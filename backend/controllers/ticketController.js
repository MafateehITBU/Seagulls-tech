import Ticket from "../models/Ticket.js";
import Maintenance from "../models/Maintenance.js";
import Accident from "../models/Accident.js";
import Cleaning from "../models/Cleaning.js";
import SparePart from "../models/SparePart.js";
import Tech from "../models/Tech.js";
import { v4 as uuidv4 } from 'uuid';
import { emitToAdmins } from '../utils/socket.js';

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
            return res.json([]);
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
            return res.json([]);
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
            return res.json([]);
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
            return res.json([]);
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
            return res.json([]);
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
            return res.json([]);
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

                // Check if updated quantity is below minStock
                if (updatedSparePart.quantity < updatedSparePart.minStock) {
                    // Generate a unique notifID
                    const notifID = uuidv4(); // Generate a unique ID for the notification

                    emitToAdmins('new-notification', {
                        notifID,
                        title: "Spare Parts!",
                        message: `Spare part (${updatedSparePart.partNo}) is under min stock.`,
                        route: "/admin/spare-parts",
                        createdAt: new Date(),
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

/**--------------------------------------
 * @desc Get all Tech names and the no. of their closed tickets
 * @route GET /api/ticket/tech
 * @access Private
 * @position admin, superadmin
 ----------------------------------------*/
export const getTechClosedTicketsNo = async (req, res) => {
    try {
        // Fetch all technicians
        const allTechs = await Tech.find({}, 'name');

        // Fetch all closed tickets with assigned tech populated
        const closedTickets = await Ticket.find({ status: 'Closed' }).populate('assignedTo', 'name');

        // Count closed tickets per techId
        const closedCounts = {};
        closedTickets.forEach(ticket => {
            const techId = ticket.assignedTo?._id?.toString();
            if (techId) {
                closedCounts[techId] = (closedCounts[techId] || 0) + 1;
            }
        });

        // Build result array with all techs
        const result = allTechs.map(tech => ({
            techName: tech.name,
            closedTicketsCount: closedCounts[tech._id.toString()] || 0
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Couldn't fetch the techs and their closed tickets count!" });
    }
};

/**--------------------------------------
 * @desc Get all unassigned tickets with their type (cleaning, maintenance, accident)
 * @route GET /api/ticket/tech/unassigned
 * @access Private
 * @position tech
 ----------------------------------------*/
export const getUnassignedTicketsWithType = async (req, res) => {
    try {
        // Find all unassigned tickets
        const unassignedTickets = await Ticket.find({ assignedTo: { $exists: false } })
            .populate('assignedTo', 'name')
            .populate('assetId', 'assetName coordinates location');

        const ticketIds = unassignedTickets.map(ticket => ticket._id.toString());

        // Find associated cleaning, maintenance, and accident records
        const cleaningDocs = await Cleaning.find({ ticketId: { $in: ticketIds } }).select('ticketId');
        const maintenanceDocs = await Maintenance.find({ ticketId: { $in: ticketIds } }).select('ticketId');
        const accidentDocs = await Accident.find({ ticketId: { $in: ticketIds } }).select('ticketId');

        const cleaningMap = new Set(cleaningDocs.map(doc => doc.ticketId.toString()));
        const maintenanceMap = new Set(maintenanceDocs.map(doc => doc.ticketId.toString()));
        const accidentMap = new Set(accidentDocs.map(doc => doc.ticketId.toString()));

        // Add type to each ticket
        const ticketsWithType = unassignedTickets.map(ticket => {
            const id = ticket._id.toString();
            let type = 'unknown';
            if (cleaningMap.has(id)) type = 'cleaning';
            else if (maintenanceMap.has(id)) type = 'maintenance';
            else if (accidentMap.has(id)) type = 'accident';

            return {
                ...ticket.toObject(),
                ticketType: type
            };
        });

        res.status(200).json(ticketsWithType);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch unassigned tickets with types" });
    }
};

/**-------------------------------------
 * @desc Claim a Ticket
 * @route PUT /api/ticket/tech/claim/:ticketId
 * @access Private
 * @positiom tech
 --------------------------------------*/
export const claimTicket = async (req, res) => {
    try {
        const ticketId = req.params.ticketId;
        const userId = req.user.id;

        // Check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if the ticket is already assigned
        if (ticket.assignedTo) {
            return res.status(400).json({ message: "Ticket is already assigned to someone else" });
        }

        // Update the ticket's assignedTo field
        ticket.assignedTo = userId;
        await ticket.save();

        res.status(200).json({ message: "Ticket claimed successfully", ticket });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}