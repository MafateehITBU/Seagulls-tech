import Cleaning from "../models/Cleaning.js";
import Ticket from "../models/Ticket.js";
import Asset from "../models/Asset.js";
import Tech from "../models/Tech.js";
import Admin from "../models/Admin.js";
import Report from "../models/Report.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { emitToAdmins, emitToTech } from '../utils/socket.js';
import { v4 as uuidv4 } from 'uuid';

/**------------------------------------------
* @desc Create a new cleaning Ticket
* @route POST /api/cleaning
* @access Public
* @role Tech, Admin, Super Admin
-------------------------------------------*/
export const createCleaningTicket = async (req, res) => {
    try {
        const openedBy = req.user.id;
        const openedByModel = req.user.position === 'tech' ? 'Tech' : 'Admin'; // position is either 'Tech' or 'Admin'

        let assignedTo = req.body.assignedTo;
        const { priority, assetId, description } = req.body;

        if (!openedBy || !openedByModel || !priority || !assetId) {
            return res.status(400).json({ message: "Please Fill all required fields" });
        }

        // check if the assetId exists in the database
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        let techTicketApprove = false;
        let ticketPhoto = null;
        // check if the openedBy exists in the database
        if (openedByModel === 'Tech') {
            const tech = await Tech.findById(openedBy);
            if (!tech) {
                return res.status(404).json({ message: "Tech not found" });
            }
            // check is the tech uploaded a photo
            if (!req.file) {
                return res.status(400).json({ message: "Photo is required" });
            }
            // Upload photo
            const photoPath = req.file.path;
            const photoUrl = await uploadToCloudinary(photoPath);
            fs.unlinkSync(photoPath); // remove local file
            ticketPhoto = photoUrl;
        } else if (openedByModel === 'Admin') {
            const admin = await Admin.findById(openedBy);
            techTicketApprove = true;
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }
        }

        // check if the assignedTo exists in the tech database
        if (assignedTo) {
            const tech = await Tech.findById(assignedTo);
            if (!tech) {
                return res.status(404).json({ message: "Tech not found" });
            }
        } else if (openedByModel === 'Tech') {
            assignedTo = openedBy;
        }
        // check if the priority is valid
        const validPriorities = ['Low', 'Medium', 'High'];
        if (!validPriorities.includes(priority)) {
            return res.status(400).json({ message: "Invalid priority" });
        }

        // Create a new ticket
        const ticket = new Ticket({
            openedBy,
            openedByModel,
            assignedTo,
            priority,
            assetId,
            description: description || "No description provided",
            techTicketApprove,
            photo: ticketPhoto,
        });
        const createdTicket = await ticket.save();

        // Create a new cleaning record
        const cleaning = new Cleaning({
            ticketId: createdTicket._id,
            reportId: null,
            note: null,
            status: 'Pending',
        });
        const createdCleaning = await cleaning.save()

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
                title: "New Cleaning Ticket!",
                message: 'A new cleaning ticket has been assigned to you',
                route: "/cleaning",
                createdAt: new Date(),
            });
        }
        res.status(201).json({ message: "Cleaning Ticket Created", ticket: createdTicket, cleaning: createdCleaning });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Appove tech ticket
 * @route PUT /api/cleaning/approve/:cleaningId
 * @access Private
 *  @role Admin, Super Admin
 -------------------------------------------*/
export const approveTechTicket = async (req, res) => {
    try {
        const cleaningId = req.params.cleaningId;

        // check if the cleaning ticket exists
        const cleaning = await Cleaning.findById(cleaningId);
        if (!cleaning) {
            return res.status(404).json({ message: "Cleaning ticket not found" });
        }

        // get the ticketId from the cleaning ticket
        const ticketId = cleaning.ticketId;
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
            route: "/cleaning",
            createdAt: new Date(),
        });
        res.json({ message: "Cleaning Ticket approved successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Get all Open and In Progress cleaning tickets assigned to the logged-in Tech
 * @route GET /api/cleaning/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const getCleaningTicketsByTech = async (req, res) => {
    try {
        const id = req.user.id;

        // Verify tech exists
        const tech = await Tech.findById(id);
        if (!tech) {
            return res.status(404).json({ message: "Tech not found" });
        }

        // Fetch open or in-progress cleaning tickets and populate related fields
        const cleanings = await Cleaning.find({ status: { $in: ['Pending', 'Open', 'In Progress'] } })
            .populate({
                path: 'ticketId',
                select: 'openedBy assignedTo priority assetId description status openedByModel startTime endTime timer techTicketApprove',
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
            });

        if (!cleanings || cleanings.length === 0) {
            return res.status(404).json({ message: "No cleaning tickets found" });
        }

        // Filter by assigned tech and ticket not closed
        const filteredCleanings = cleanings.filter(cleaning => {
            const assignedTo = cleaning.ticketId?.assignedTo?._id || cleaning.ticketId?.assignedTo;
            const ticketStatus = cleaning.ticketId?.status;
            return (
                assignedTo?.toString() === id &&
                ticketStatus !== 'Closed'
            );
        });

        // Populate report if exists
        const populatedCleanings = await Promise.all(filteredCleanings.map(async (cleaning) => {
            if (cleaning.reportId) {
                const report = await Report.findById(cleaning.reportId);
                cleaning.reportId = report;
            }
            return cleaning;
        }));

        res.json(populatedCleanings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Add a report to a cleaning ticket by Tech
 * @route POST /api/cleaning/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const addReportToCleaning = async (req, res) => {
    try {
        const cleaningId = req.params.cleaningId;

        // check if the cleaning ticket exists
        const cleaning = await Cleaning.findById(cleaningId);
        if (!cleaning) {
            return res.status(404).json({ message: "Cleaning ticket not found" });
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

        cleaning.reportId = createdReport._id;
        await cleaning.save();

        // Generate a unique notifID
        const notifID = uuidv4(); // Generate a unique ID for the notification

        emitToAdmins('new-notification', {
            notifID,
            title: "Report Uploaded!",
            message: 'A maintenance report has been uploaded by a Tech',
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
 * @desc Start time for cleaning ticket 
 * @route POST /api/cleaning/start/:id
 * @access Private
 *  @role Tech
 -------------------------------------------*/
export const startCleaning = async (req, res) => {
    try {
        const cleaningId = req.params.cleaningId;

        // check if the cleaning ticket exists
        const cleaning = await Cleaning.findById(cleaningId);
        if (!cleaning) {
            return res.status(404).json({ message: "Cleaning ticket not found" });
        }

        // get the ticketId from the cleaning ticket
        const ticketId = cleaning.ticketId;
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

        // change the cleaning status to In Progress
        cleaning.status = 'In Progress';
        await cleaning.save();
        res.json({ message: "Cleaning started successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Close for cleaning ticket 
 * @route POST /api/cleaning/end/:id
 * @access Private
 *  @role Tech
 -------------------------------------------*/
export const closeCleaning = async (req, res) => {
    try {
        const cleaningId = req.params.cleaningId;
        // check if the cleaning ticket exists
        const cleaning = await Cleaning.findById(cleaningId);
        if (!cleaning) {
            return res.status(404).json({ message: "Cleaning ticket not found" });
        }

        // get the ticketId from the cleaning ticket
        const ticketId = cleaning.ticketId;
        // check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        cleaning.status = 'Closed';
        await cleaning.save();

        ticket.status = 'Done';
        ticket.endTime = new Date();
        // calculate the time spent on the cleaning (timer)
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
        res.json({ message: "Cleaning ended successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Delete a cleaning ticket
 * @route DELETE /api/cleaning/:id
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const deleteCleaning = async (req, res) => {
    try {
        const cleaningId = req.params.cleaningId;
        // check if the cleaning ticket exists
        const cleaning = await Cleaning.findById(cleaningId);
        if (!cleaning) {
            return res.status(404).json({ message: "Cleaning ticket not found" });
        }
        // check if the ticketId exists
        const ticketId = cleaning.ticketId;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        // check if there is a reportId
        const reportId = cleaning.reportId;
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
        // delete the cleaning ticket
        await cleaning.deleteOne();
        res.json({ message: "Cleaning ticket deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}