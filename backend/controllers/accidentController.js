import Accident from "../models/Accident.js";
import Ticket from "../models/Ticket.js";
import Report from "../models/Report.js";
import SparePart from "../models/SparePart.js";
import Tech from "../models/Tech.js";
import Admin from "../models/Admin.js";
import Asset from "../models/Asset.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**------------------------------------------
 * @desc Create a new accident record
 * @route POST /api/accident
 * @access Private
 * @role Tech, Admin, Super Admin
 -------------------------------------------*/
export const createAccidentTicket = async (req, res) => {
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

        // Create the accident record
        const accident = new Accident({
            ticketId: createdTicket._id,
            requireSpareParts,
            spareParts,
            reportId: null,
            croca: {
                crocaType: req.body.crocaType || "Croca",
                cost: req.body.cost || "0",
                photo: null,
            },
            status: 'Pending',
        });

        const createdAccident = await accident.save();

        res.status(201).json({
            message: "Accident Ticket created successfully!",
            accident: createdAccident,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all accident tickets Open / In Progress
 * @route GET /api/accident
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const getAdminAccidentTickets = async (req, res) => {
    try {
        const accidents = await Accident.find({ status: { $in: ['Open', 'Pending', 'In Progress'] } })
            .populate({
                path: 'ticketId',
                select: 'openedBy assignedTo priority assetId description status openedByModel',
                populate: [
                    { path: 'assignedTo', select: 'name' },
                    { path: 'assetId', select: 'name' },
                    { path: 'openedBy', select: 'name' },
                    { path: 'assetId', select: 'assetName' },
                ],
            });

        if (!accidents || accidents.length === 0) {
            return res.status(404).json({ message: "No Accident tickets found" });
        }

        // Convert to plain objects and populate reports
        let populatedAccident = await Promise.all(accidents.map(async (accident) => {
            const accidentObj = accident.toObject();
            if (accidentObj.reportId) {
                const report = await Report.findById(accidentObj.reportId);
                accidentObj.reportId = report;
            }
            return accidentObj;
        }));

        // Gather all spare part IDs
        const sparePartIds = populatedAccident.flatMap(a => a.spareParts || []);
        const spareParts = await SparePart.find({ _id: { $in: sparePartIds } });

        // Create a map of spare part names
        const sparePartsMap = {};
        spareParts.forEach(sp => {
            sparePartsMap[sp._id.toString()] = sp.partName;
        });

        // Replace spare part IDs with names
        populatedAccident = populatedAccident.map(a => {
            a.spareParts = (a.spareParts || []).map(spId => sparePartsMap[spId.toString()] || "Unknown");
            return a;
        });


        res.status(200).json(populatedAccident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all accident tickets Closed
 * @route GET /api/accident/closed
 * @access Private
 * @role Admin, Super Admin
 * -------------------------------------------*/
export const getClosedAccidentTickets = async (req, res) => {
    try {
        const accidents = await Accident.find({ status: 'Closed' })
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
        if (!accidents || accidents.length === 0) {
            return res.status(404).json({ message: "No closed Accident tickets found" });
        }
        let populatedAccident = await Promise.all(accidents.map(async (accident) => {
            if (accident.reportId) {
                const report = await Report.findById(accident.reportId);
                accident.reportId = report;
            }
            return accident;
        }));

        // Gather all spare part IDs
        const sparePartIds = populatedAccident.flatMap(a => a.spareParts || []);
        const spareParts = await SparePart.find({ _id: { $in: sparePartIds } });

        // Create a map of spare part names
        const sparePartsMap = {};
        spareParts.forEach(sp => {
            sparePartsMap[sp._id.toString()] = sp.partName;
        });

        // Replace spare part IDs with names
        populatedAccident = populatedAccident.map(a => {
            a.spareParts = (a.spareParts || []).map(spId => sparePartsMap[spId.toString()] || "Unknown");
            return a;
        });

        res.json(populatedAccident);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Get all Open and In Progress accident tickets assigned to the logged-in Tech
 * @route GET /api/accident/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const getAccidentTicketsTech = async (req, res) => {
    try {
        const id = req.user.id;

        // Verify tech exists
        const tech = await Tech.findById(id);
        if (!tech) {
            return res.status(404).json({ message: "Tech not found" });
        }

        // Fetch open or in-progress accident tickets and populate related fields
        const accidents = await Accident.find({ status: { $in: ['Pending', 'Open', 'In Progress'] } })
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

        if (!accidents || accidents.length === 0) {
            return res.status(404).json({ message: "No accident tickets found" });
        }

        // Filter by assigned tech
        const filteredAccidents = accidents.filter(accident => {
            const assignedTo = accident.ticketId?.assignedTo?._id || accident.ticketId?.assignedTo;
            return assignedTo?.toString() === id;
        });

        // Populate report if exists
        const populatedAccidents = await Promise.all(filteredAccidents.map(async (accident) => {
            if (accident.reportId) {
                const report = await Report.findById(accident.reportId);
                accident.reportId = report;
            }
            return accident;
        }));

        res.json(populatedAccidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all accident records where the associated ticket is not assigned to anyone
 * @route GET /api/accident/unassigned
 * @access Private
 * @role Tech, Admin, Super Admin
 -------------------------------------------*/
export const getEveryoneTicket = async (req, res) => {
    try {
        // Fetch all accident records
        const accidents = await Accident.find()
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

        if (!accidents || accidents.length === 0) {
            return res.status(404).json({ message: "No accident records found" });
        }

        // Filter the accident records where the associated ticket's assignedTo is null or empty
        const unassignedAccidents = accidents.filter(accident => {
            const assignedTo = accident.ticketId?.assignedTo;
            return !assignedTo; // If assignedTo is null or doesn't exist, include this accident record
        });

        if (unassignedAccidents.length === 0) {
            return res.status(404).json({ message: "No unassigned accident records found" });
        }

        res.status(200).json(unassignedAccidents);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Claim a ticket (assign it to the logged-in user)
 * @route PUT /api/accident/claim/:id
 * @access Private
 * @role Tech
 -------------------------------------------*/
export const claimTicket = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;
        const userId = req.user.id;

        // Check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
        }

        const ticketId = accident.ticketId;

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

/**-------------------------------------------
 * @desc Start time for accident ticket 
 * @route POST /api/accident/start/:id
 * @access Private
 *  @role Tech
 -------------------------------------------*/
export const startAccident = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;

        // check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
        }

        // get the accidentId from the accident ticket
        const ticketId = accident.ticketId;
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

        // change the accident status to In Progress
        accident.status = 'In Progress';
        await accident.save();
        res.json({ message: "Accident started successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Add a report to a accident ticket by Tech
 * @route POST /api/tech/:id
 * @access Private
 * @role Tech
 * -------------------------------------------*/
export const addReportToAccident = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;

        // check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
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

        accident.reportId = createdReport._id;
        await accident.save();
        res.json({ message: "Report added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Add a croca to an accident ticket by Tech
 * @route POST /api/croca/:accidentId
 * @access Private
 * @role Tech
 -------------------------------------------*/
export const addCrocaToAccident = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;
        const { requireSpareParts, spareParts } = req.body;

        // Check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
        }

        const { crocaType, cost } = req.body;

        // Make sure all fields are present
        if (!crocaType || !cost || !req.file) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload photo
        const crocaPath = req.file.path;
        const crocaUrl = await uploadToCloudinary(crocaPath);
        fs.unlinkSync(crocaPath); // Remove the local file

        // Add croca to the accident ticket
        accident.croca = {
            crocaType,
            cost,
            photo: crocaUrl,
        };

        accident.requireSpareParts = requireSpareParts;
        // check if spare parts if required
        if (requireSpareParts) {
            // check if spare parts are provided
            if (!spareParts || spareParts.length === 0) {
                return res.status(400).json({ message: "Spare parts are required" });
            }

            // check if the spare parts are valid
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

            accident.spareParts = spareParts;
        }

        await accident.save();

        res.json({ message: "Croca added successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**-------------------------------------------
* @desc Close for accident ticket 
* @route POST /api/accident/end/:id
* @access Private
*  @role Tech
-------------------------------------------*/
export const closeAccident = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;
        // check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
        }

        accident.status = 'Closed';
        await accident.save();

        // get the ticketId from the accident ticket
        const ticketId = accident.ticketId;
        // check if the ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        // Check if the ticket is approved 
        if (!ticket.approved) {
            return res.status(400).json({ message: "Ticket not approved, you can't close it yet." });
        }

        ticket.endTime = new Date();
        // calculate the time spent on the accident (timer)
        const timeSpent = ticket.endTime - ticket.startTime;
        ticket.timer = Math.floor(timeSpent / 1000 / 60); // convert to minutes
        await ticket.save();

        res.json({ message: "Accident ended successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**-------------------------------------------
 * @desc Delete a accident ticket
 * @route DELETE /api/accident/:id
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
 export const deleteAccident = async (req, res) => {
    try {
        const accidentId = req.params.accidentId;
        // check if the accident ticket exists
        const accident = await Accident.findById(accidentId);
        if (!accident) {
            return res.status(404).json({ message: "Accident ticket not found" });
        }
        // check if the ticketId exists
        const ticketId = accident.ticketId;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }
        // check if there is a reportId
        const reportId = accident.reportId;
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
        // delete the accident ticket
        await Accident.deleteOne();
        res.json({ message: "accident ticket deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}