import Maintenance from "../models/Maintenance.js";
import Ticket from "../models/Ticket.js";
import Report from "../models/Report.js";
import SparePart from "../models/SparePart.js";
import Tech from "../models/Tech.js";
import Admin from "../models/Admin.js";
import Asset from "../models/Asset.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**------------------------------------------
 * @desc Create a new maintenance record
 * @route POST /api/maintenance
 * @access Private
 * @role Tech, Admin, Super Admin
 -------------------------------------------*/
export const createMaintenanceTicket = async (req, res) => {
    try {
        const openedBy = req.user.id;
        const openedByModel = req.user.position === 'tech' ? 'Tech' : 'Admin';

        const { priority, assetId, description, requireSpareParts } = req.body;
        let assignedTo = req.body.assignedTo;

        if (!openedBy || !openedByModel || !priority || !assetId) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        // Validate the opener
        if (openedByModel === 'Tech') {
            const tech = await Tech.findById(openedBy);
            if (!tech) return res.status(400).json({ message: "Invalid Tech ID" });
        } else if (openedByModel === 'Admin') {
            const admin = await Admin.findById(openedBy);
            if (!admin) return res.status(400).json({ message: "Invalid Admin ID" });
        }

        // Validate assigned tech if provided
        if (assignedTo) {
            const tech = await Tech.findById(assignedTo);
            if (!tech) return res.status(400).json({ message: "Invalid Assigned Tech ID" });
        } else if (openedByModel === 'Tech') {
            assignedTo = openedBy;
        }

        // Validate asset
        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(400).json({ message: "Invalid Asset ID" });

        // Validate priority
        const validPriorities = ['Low', 'Medium', 'High'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid Priority" });
        }

        let spareParts = [];

        // Handle spare parts
        if (requireSpareParts) {
            spareParts = Array.isArray(req.body.spareParts)
                ? req.body.spareParts
                : JSON.parse(req.body.spareParts || '[]');

            for (const sparePartId of spareParts) {
                const updatedSparePart = await SparePart.findOneAndUpdate(
                    { _id: sparePartId, quantity: { $gt: 0 } },
                    { $inc: { quantity: -1 } },
                    { new: true }
                );

                if (!updatedSparePart) {
                    return res.status(400).json({
                        message: `Spare Part with ID ${sparePartId} is invalid or out of stock`,
                    });
                }
            }
        }

        // Create the ticket
        const newTicket = new Ticket({
            openedBy,
            openedByModel,
            assignedTo,
            priority,
            assetId,
            description: description || "No description provided",
        });

        const createdTicket = await newTicket.save();

        // Create the maintenance
        const maintenance = new Maintenance({
            ticketId: createdTicket._id,
            requireSpareParts,
            spareParts,
            reportId: null,
            status: 'Pending',
        });

        const createdMaintenance = await maintenance.save();

        res.status(201).json({
            message: "Maintenance created successfully",
            maintenance: createdMaintenance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all Open and In Progress maintenance tickets assigned to the logged-in Tech
 * @route GET /api/maintenance/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const getMaintTicketsTech = async (req, res) => {
    try {
        const id = req.user.id;

        // Verify tech exists
        const tech = await Tech.findById(id);
        if (!tech) {
            return res.status(404).json({ message: "Tech not found" });
        }

        // Fetch open or in-progress maint tickets and populate related fields
        const maints = await Maintenance.find({ status: { $in: ['Pending', 'Open', 'In Progress'] } })
            .populate({
                path: 'ticketId',
                select: 'openedBy assignedTo priority assetId description status openedByModel',
                populate: [
                    {
                        path: 'openedBy',
                        select: 'name',
                    },
                    {
                        path: 'assignedTo',
                        select: 'name',
                    },
                    {
                        path: 'assetId',
                        select: 'name',
                    },
                ],
            });

        if (!maints || maints.length === 0) {
            return res.status(404).json({ message: "No maint tickets found" });
        }

        // Filter by assigned tech
        const filteredMaints = maints.filter(maint => {
            const assignedTo = maint.ticketId?.assignedTo?._id || maint.ticketId?.assignedTo;
            return assignedTo?.toString() === id;
        });

        // Populate report if exists
        const populatedMaints = await Promise.all(filteredMaints.map(async (maint) => {
            if (maint.reportId) {
                const report = await Report.findById(maint.reportId);
                maint.reportId = report;
            }
            return maint;
        }));

        res.json(populatedMaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all maintenance records where the associated ticket is not assigned to anyone
 * @route GET /api/maintenance/unassigned
 * @access Private
 * @role Tech, Admin, Super Admin
 -------------------------------------------*/
export const getEveryoneTicket = async (req, res) => {
    try {
        // Fetch all maintenance records
        const maintenances = await Maintenance.find()
            .populate({
                path: 'ticketId',
                select: 'openedBy assignedTo priority assetId description status openedByModel',
                populate: [
                    {
                        path: 'openedBy',
                        select: 'name',
                    },
                    {
                        path: 'assignedTo',
                        select: 'name',
                    },
                    {
                        path: 'assetId',
                        select: 'assetName',
                    },
                ],
            });

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: "No maintenance records found" });
        }

        // Filter the maintenance records where the associated ticket's assignedTo is null or empty
        const unassignedMaintenances = maintenances.filter(maintenance => {
            const assignedTo = maintenance.ticketId?.assignedTo;
            return !assignedTo; // If assignedTo is null or doesn't exist, include this maintenance record
        });

        if (unassignedMaintenances.length === 0) {
            return res.status(404).json({ message: "No unassigned maintenance records found" });
        }

        res.status(200).json(unassignedMaintenances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Claim a ticket (assign it to the logged-in user)
 * @route PUT /api/tickets/claim/:id
 * @access Private
 * @role Tech
 -------------------------------------------*/
export const claimTicket = async (req, res) => {
    try {
        const maintId = req.params.maintId;
        const userId = req.user.id;

        // Check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }

        const ticketId = maint.ticketId;

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
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Add a report to a maintenance ticket by Tech
 * @route POST /api/maintenance/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const addReportToMaint = async (req, res) => {
    try {
        const maintId = req.params.maintId;

        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }

        const { description } = req.body;
        if (!description || !req.files || !req.files.photoBefore || !req.files.photoAfter) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload photoBefore
        const photoBeforePath = req.files.photoBefore[0].path;
        const photoBeforeUrl = await uploadToCloudinary(photoBeforePath);
        fs.unlinkSync(photoBeforePath); // remove local file

        // Upload photoAfter
        const photoAfterPath = req.files.photoAfter[0].path;
        const photoAfterUrl = await uploadToCloudinary(photoAfterPath);
        fs.unlinkSync(photoAfterPath); // remove local file

        const report = new Report({
            description,
            photoBefore: photoBeforeUrl,
            photoAfter: photoAfterUrl,
        });

        const createdReport = await report.save();

        maint.reportId = createdReport._id;
        await maint.save();
        res.json({ message: "Report added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Start time for maintenance ticket 
 * @route POST /api/maintenance/start/:id
 * @access Private
 *  @role Tech
 -------------------------------------------*/
export const startMaint = async (req, res) => {
    try {
        const maintId = req.params.maintId;

        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }

        // get the maintId from the maint ticket
        const ticketId = maint.ticketId;
        // check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        // check if the ticket is already started
        if (ticket.startTime) {
            return res.status(400).json({ message: "Ticket already started" });
        }

        // add the start time to the ticket
        ticket.startTime = new Date();
        ticket.status = 'In Progress';
        await ticket.save();

        // change the maint status to In Progress
        maint.status = 'In Progress';
        await maint.save();
        res.json({ message: "Maintenance started successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Add a report to a maintenance ticket by Tech
 * @route POST /api/maintenance/tech/reject/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const addRejectReportToMaint = async (req, res) => {
    try {
        const maintId = req.params.maintId;

        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }

        // check if the ticketId exists
        const ticketId = maint.ticketId;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // check if the ticket is not approved
        if (ticket.approved) {
            return res.status(400).json({ message: "Ticket already approved. You can't upload a reject report unless it's rejected!" });
        }

        // check if the ticket is neither approved nor rejected
        if (ticket.approved === null) {
            return res.status(400).json({ message: "Ticket is neither approved nor rejected. You can't upload a reject report unless it's rejected!" });
        }

        const { description } = req.body;
        if (!description || !req.files || !req.files.photoBefore || !req.files.photoAfter) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload photoBefore
        const photoBeforePath = req.files.photoBefore[0].path;
        const photoBeforeUrl = await uploadToCloudinary(photoBeforePath);
        fs.unlinkSync(photoBeforePath); // remove local file

        // Upload photoAfter
        const photoAfterPath = req.files.photoAfter[0].path;
        const photoAfterUrl = await uploadToCloudinary(photoAfterPath);
        fs.unlinkSync(photoAfterPath); // remove local file

        const report = new Report({
            description,
            photoBefore: photoBeforeUrl,
            photoAfter: photoAfterUrl,
        });

        const createdReport = await report.save();

        maint.rejectReportId = createdReport._id;
        await maint.save();
        res.json({ message: "Report added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
* @desc Close for maintenance ticket 
* @route POST /api/maintenance/end/:id
* @access Private
*  @role Tech
-------------------------------------------*/
export const closeMaint = async (req, res) => {
    try {
        const maintId = req.params.maintId;
        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }

        // get the ticketId from the maint ticket
        const ticketId = maint.ticketId;
        // check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if the ticket is approved 
        if (!ticket.approved) {
            return res.status(400).json({ message: "Ticket not approved, you can't close it yet." });
        }
        
        maint.status = 'Closed';
        await maint.save();

        ticket.endTime = new Date();
        // calculate the time spent on the maint (timer)
        const timeSpent = ticket.endTime - ticket.startTime;
        ticket.timer = Math.floor(timeSpent / 1000 / 60); // convert to minutes
        await ticket.save();

        res.json({ message: "Maintenance ended successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Delete a maintenance ticket
 * @route DELETE /api/maintenance/:id
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const deleteMaint = async (req, res) => {
    try {
        const maintId = req.params.maintId;
        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maintenance ticket not found" });
        }
        // check if the ticketId exists
        const ticketId = maint.ticketId;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        // check if there is a reportId
        const reportId = maint.reportId;
        if (reportId) {
            const report = await Report.findById(reportId);
            if (!report) {
                return res.status(404).json({ message: "Report not found" });
            }
            // delete the report
            await report.deleteOne();
        }
        // delete the ticket
        await ticket.deleteOne();
        // delete the maint ticket
        await Maintenance.deleteOne();
        res.json({ message: "maint ticket deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}