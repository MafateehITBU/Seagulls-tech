import Ticket from "../models/Ticket.js";
import Maintenance from "../models/Maintenance.js";
import Accident from "../models/Accident.js";
import Cleaning from "../models/Cleaning.js";
import Asset from "../models/Asset.js";
import SparePart from "../models/SparePart.js";

/**----------------------------------------
 * @desc Get the tickets that are closed and associated with the cleaning
 * @route GET /api/ticket/closed-cleaning
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getClosedCleaningTickets = async (req, res) => {
    try {
        // get all cleaning records and populate the ticketId field with the ticket details
        const cleaningTickets = await Cleaning.find({})
            .populate({
                path: 'ticketId',
                match: { status: 'Closed' },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId');

        // filter the cleaning.ticketId.status === "Closed" (keep only the closed tickets)
        const closedTickets = cleaningTickets.filter(ticket => ticket.ticketId !== null && ticket.ticketId.status === 'Closed');

        // check if closedTickets is empty
        if (closedTickets.length === 0) {
            return res.status(404).json({ message: "No closed tickets found" });
        }

        res.status(200).json(closedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

/**----------------------------------------
 * @desc Get the tickets that are Open, In Progree, Rejected and associated with the cleaning
 * @route GET /api/ticket/cleaning-tickets
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getCleaningTickets = async (req, res) => {
    try {
        // get all cleaning records and populate the ticketId field with the ticket details
        const cleaningTickets = await Cleaning.find({})
            .populate({
                path: 'ticketId',
                match: { status: { $ne: 'Closed' } },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId');

        // filter out the cleaning.ticketId.status === "Closed" (keep only the open, in progress and rejected tickets)
        const openTickets = cleaningTickets.filter(ticket => ticket.ticketId !== null && ticket.ticketId.status !== 'Closed');

        // check if openTickets is empty
        if (openTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found" });
        }

        res.status(200).json(openTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

/**----------------------------------------
 * @desc Get the tickets that are closed and associated with the maintenance
 * @route GET /api/ticket/closed-maintenance
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getClosedMaintTickets = async (req, res) => {
    try {
        const maintTickets = await Maintenance.find({})
            .populate({
                path: 'ticketId',
                match: { status: 'Closed' },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId')
            .populate({
                path: 'spareParts',
                select: 'partName'
            })
            .populate('rejectReportId');

        const closedTickets = maintTickets
            .filter(ticket => ticket.ticketId && ticket.ticketId.status === 'Closed')
            .map(ticket => {
                const transformedTicket = ticket.toObject(); // convert Mongoose doc to plain JS object

                if (Array.isArray(transformedTicket.spareParts) && transformedTicket.spareParts.length > 0) {
                    transformedTicket.spareParts = transformedTicket.spareParts
                        .map(part => part.partName)
                        .join(', ');
                } else {
                    transformedTicket.spareParts = "";
                }

                return transformedTicket;
            });

        if (closedTickets.length === 0) {
            return res.status(404).json({ message: "No closed tickets found" });
        }

        res.status(200).json(closedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/**----------------------------------------
 * @desc Get the tickets that are not closed and associated with the maintenance
 * @route GET /api/ticket/maintenance-tickets
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getMaintTickets = async (req, res) => {
    try {
        const maintTickets = await Maintenance.find({})
            .populate({
                path: 'ticketId',
                match: { status: { $ne: 'Closed' } },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId')
            .populate({
                path: 'spareParts',
                select: 'partName'
            })
            .populate('rejectReportId');

        const closedTickets = maintTickets
            .filter(ticket => ticket.ticketId && ticket.ticketId.status !== 'Closed')
            .map(ticket => {
                const transformedTicket = ticket.toObject(); // convert Mongoose doc to plain JS object

                if (Array.isArray(transformedTicket.spareParts) && transformedTicket.spareParts.length > 0) {
                    transformedTicket.spareParts = transformedTicket.spareParts
                        .map(part => part.partName)
                        .join(', ');
                } else {
                    transformedTicket.spareParts = "";
                }

                return transformedTicket;
            });

        if (closedTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found" });
        }

        res.status(200).json(closedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/**----------------------------------------
 * @desc Get the tickets that are closed and associated with the accident
 * @route GET /api/ticket/closed-accident
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getClosedAccidentTickets = async (req, res) => {
    try {
        const accidentTickets = await Accident.find({})
            .populate({
                path: 'ticketId',
                match: { status: 'Closed' },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId')
            .populate({
                path: 'spareParts',
                select: 'partName'
            })
            .populate('rejectReportId');

        const closedTickets = accidentTickets
            .filter(ticket => ticket.ticketId && ticket.ticketId.status === 'Closed')
            .map(ticket => {
                const transformedTicket = ticket.toObject();

                if (Array.isArray(transformedTicket.spareParts) && transformedTicket.spareParts.length > 0) {
                    transformedTicket.spareParts = transformedTicket.spareParts
                        .map(part => part.partName)
                        .join(', ');
                } else {
                    transformedTicket.spareParts = "";
                }

                return transformedTicket;
            });

        if (closedTickets.length === 0) {
            return res.status(404).json({ message: "No closed tickets found" });
        }

        res.status(200).json(closedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/**----------------------------------------
 * @desc Get the tickets that are not closed and associated with the accident
 * @route GET /api/ticket/accident-tickets
 * @access Private
 * @position admin, superadmin
 -----------------------------------------*/
export const getAccidentTickets = async (req, res) => {
    try {
        const accidentTickets = await Accident.find({})
            .populate({
                path: 'ticketId',
                match: { status: { $ne: 'Closed' } },
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ]
            })
            .populate('reportId')
            .populate({
                path: 'spareParts',
                select: 'partName'
            })
            .populate('rejectReportId');

        const closedTickets = accidentTickets
            .filter(ticket => ticket.ticketId && ticket.ticketId.status !== 'Closed')
            .map(ticket => {
                const transformedTicket = ticket.toObject();

                if (Array.isArray(transformedTicket.spareParts) && transformedTicket.spareParts.length > 0) {
                    transformedTicket.spareParts = transformedTicket.spareParts
                        .map(part => part.partName)
                        .join(', ');
                } else {
                    transformedTicket.spareParts = "";
                }

                return transformedTicket;
            });

        if (closedTickets.length === 0) {
            return res.status(404).json({ message: "No tickets found" });
        }

        res.status(200).json(closedTickets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/**---------------------------------------
 * @desc Reject a ticket
 * @route POST /api/ticket/reject/:ticketId
 * @access Private
 * @position admin, superadmin
 ----------------------------------------*/
export const rejectTicket = async (req, res) => {
    const { ticketId } = req.params;
    const { rejectionReason } = req.body;
    try {
        // Find the ticket by ID and update its status to "Rejected"
        const ticket = await Ticket.findByIdAndUpdate(ticketId, {
            status: 'Rejected',
            approved: false,
            rejectionReason: rejectionReason
        }, { new: true });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Ticket rejected successfully", ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

/**---------------------------------------
 * @desc Approve a ticket
 * @route POST /api/ticket/approve/:ticketId
 * @access Private
 * @position admin, superadmin
 ----------------------------------------*/
export const approveTicket = async (req, res) => {
    const { ticketId } = req.params;
    try {
        const ticket = await Ticket.findByIdAndUpdate(ticketId, {
            approved: true,
        }, { new: true });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Find if it's a Maintenance or Accident ticket
        let spareTicket = await Maintenance.findOne({ ticketId }).populate('spareParts');
        if (!spareTicket) {
            spareTicket = await Accident.findOne({ ticketId }).populate('spareParts');
        }

        if (spareTicket && spareTicket.requireSpareParts) {
            // spareParts is an array of SparePart documents
            for (const sparePart of spareTicket.spareParts) {
                const updatedSparePart = await SparePart.findOneAndUpdate(
                    { _id: sparePart._id, quantity: { $gt: 0 } },
                    { $inc: { quantity: -1 } },
                    { new: true }
                );

                if (!updatedSparePart) {
                    return res.status(400).json({
                        message: `Spare Part with ID ${sparePart._id} is invalid or out of stock`,
                    });
                }
            }
        }

        res.status(200).json({ message: "Ticket approved successfully", ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

/**---------------------------------------
 * @desc Close a ticket
 * @route POST /api/ticket/close/:ticketId
 * @access Private
 * @position admin, superadmin
 ----------------------------------------*/
export const closeTicket = async (req, res) => {
    const { ticketId } = req.params;
    try {
        // Find the ticket by ID and update its status to "Closed"
        const ticket = await Ticket.findByIdAndUpdate(ticketId, {
            status: 'Closed'
        }, { new: true });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.status(200).json({ message: "Ticket closed successfully", ticket });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}