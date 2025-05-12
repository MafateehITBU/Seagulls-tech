import Maintenance from "../models/Maintenance.js";
import Ticket from "../models/Ticket.js";
import Report from "../models/Report.js";
import Tech from "../models/Tech.js";
import Admin from "../models/Admin.js";
import Asset from "../models/Asset.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { emitToAdmins, emitToTech } from '../utils/socket.js';
import { v4 as uuidv4 } from 'uuid';

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

        let techTicketApprove = false;
        // Validate the opener
        if (openedByModel === 'Tech') {
            const tech = await Tech.findById(openedBy);
            if (!tech) return res.status(400).json({ message: "Invalid Tech ID" });
        } else if (openedByModel === 'Admin') {
            const admin = await Admin.findById(openedBy);
            techTicketApprove = true;
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
        }

        // Create the ticket
        const newTicket = new Ticket({
            openedBy,
            openedByModel,
            assignedTo,
            priority,
            assetId,
            description: description || "No description provided",
            techTicketApprove,
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

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        // Emit to admins and techs
        if (openedByModel === 'Tech') {
            emitToAdmins('new-notification', {
                notifID,
                title: "Ticket Needs Approval!",
                message: 'A new ticket has been created by a Tech',
                route: "/admin/tech-tickets",
                createdAt: new Date(),
            });
        } else if (openedByModel === 'Admin') {
            emitToTech(assignedTo, 'new-notification', {
                notifID,
                title: "New Maintenance Ticket!",
                message: 'A new maintenance ticket has been assigned to you',
                route: "/maintenance",
                createdAt: new Date(),
            });
        }

        res.status(201).json({
            message: "Maintenance created successfully",
            maintenance: createdMaintenance,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**-------------------------------------------
 * @desc Appove tech ticket
 * @route PUT /api/maintenance/approve/:maintId
 * @access Private
 *  @role Admin, Super Admin
 -------------------------------------------*/
export const approveTechTicket = async (req, res) => {
    try {
        const maintId = req.params.maintId;

        // check if the maint ticket exists
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "Maitenance ticket not found" });
        }

        // get the ticketId from the maint ticket
        const ticketId = maint.ticketId;
        // check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        ticket.techTicketApprove = true;
        await ticket.save();

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        emitToTech('new-notification', {
            notifID,
            title: "Ticket Approved!",
            message: 'Start working on the ticket',
            route: "/maintenance",
            createdAt: new Date(),
        });

        res.json({ message: "Maintenance Ticket approved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

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
                select: 'openedBy assignedTo priority assetId rejectReportId description status openedByModel startTime endTime timer techTicketApprove approved rejectionReason',
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
                        select: 'assetName assetNo assetType location coordinates',
                    },
                ],
            })
            .populate({
                path: 'spareParts',
                select: 'partName'
            });

        if (!maints || maints.length === 0) {
            return res.status(404).json({ message: "No maint tickets found" });
        }

        // Filter by assigned tech
        const filteredMaints = maints.filter(maint => {
            const assignedTo = maint.ticketId?.assignedTo?._id || maint.ticketId?.assignedTo;
            const ticketStatus = maint.ticketId?.status;
            return (
                assignedTo?.toString() === id &&
                ticketStatus !== 'Closed'
            );
        });

        // Populate report if exists
        const populatedMaints = await Promise.all(filteredMaints.map(async (maint) => {
            if (maint.reportId) {
                const report = await Report.findById(maint.reportId);
                maint.reportId = report;
            }

            if (maint.rejectReportId) {
                const report = await Report.findById(maint.rejectReportId);
                maint.rejectReportId = report;
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

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        emitToAdmins('new-notification', {
            notifID,
            title: "Report Uploaded!",
            message: 'A report has been Uploaded by a Tech',
            route: "/maintenance",
            createdAt: new Date(),
        });
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

/**-------------------------------------------
 * @desc Update spare parts for an maint ticket
 * @route PUT /api/maintenance/spareparts/:maintId
 * @access Private
 * @role Tech
 --------------------------------------------*/
export const updateSpareParts = async (req, res) => {
    try {
        const { maintId } = req.params;
        const { requireSpareParts, spareParts } = req.body;
        const techId = req.user.id;

        // Check if user is a tech
        if (req.user.position !== 'tech') {
            return res.status(403).json({ message: "Only techs can update the required spare parts" });
        }

        // Find the maint
        const maint = await Maintenance.findById(maintId);
        if (!maint) {
            return res.status(404).json({ message: "maint ticket not found" });
        }

        // Check if this tech is assigned to the ticket
        const ticket = await Ticket.findById(maint.ticketId);
        if (!ticket || ticket.assignedTo.toString() !== techId) {
            return res.status(403).json({ message: "You are not assigned to this maint" });
        }

        // Update logic
        if (requireSpareParts === false || requireSpareParts === 'false') {
            maint.requireSpareParts = false;
            maint.spareParts = [];
        } else if (requireSpareParts === true || requireSpareParts === 'true') {
            // Ensure spareParts is an array
            let partsArray = Array.isArray(spareParts)
                ? spareParts
                : typeof spareParts === 'string'
                    ? JSON.parse(spareParts)
                    : [];

            maint.requireSpareParts = true;
            maint.spareParts = partsArray;
        } else {
            return res.status(400).json({ message: "Invalid value for requireSpareParts" });
        }

        await maint.save();

        res.status(200).json({
            message: "Spare parts updated successfully",
            maint,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

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

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        emitToAdmins('new-notification', {
            notifID,
            title: "Report Uploaded!",
            message: 'A report has been Uploaded by a Tech',
            route: "/maintenance",
            createdAt: new Date(),
        });
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

        ticket.status = 'Done';
        ticket.endTime = new Date();
        // calculate the time spent on the maint (timer)
        const timeSpent = ticket.endTime - ticket.startTime;
        ticket.timer = Math.floor(timeSpent / 1000 / 60); // convert to minutes
        await ticket.save();

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        emitToAdmins('new-notification', {
            notifID,
            title: "Ticket Done!",
            message: 'A maintenance ticket has been closed by a Tech',
            route: "/maintenance",
            createdAt: new Date(),
        });
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