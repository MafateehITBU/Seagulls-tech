import Maintenance from "../models/Maintenance.js";
import Ticket from "../models/Ticket.js";
import Report from "../models/Report.js";
import SparePart from "../models/SparePart.js";
import Tech from "../models/Tech.js";
import Admin from "../models/Admin.js";
import Asset from "../models/Asset.js"; // ✅ Missing import added
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

        const { assignedTo, priority, assetId, description, requireSpareParts } = req.body;

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
 * @desc Get all maintenance tickets Open / In Progress
 * @route GET /api/maintenance
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const getAdminMaintenanceTickets = async (req, res) => {
    try {
        const maintenances = await Maintenance.find({ status: { $in: ['Open', 'Pending', 'In Progress'] } })
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

        if (!maintenances || maintenances.length === 0) {
            return res.status(404).json({ message: "No maintenance tickets found" });
        }

        // Convert to plain objects and populate reports
        let populatedMaint = await Promise.all(maintenances.map(async (maint) => {
            const maintObj = maint.toObject();
            if (maintObj.reportId) {
                const report = await Report.findById(maintObj.reportId);
                maintObj.reportId = report;
            }
            return maintObj;
        }));

        // Gather all spare part IDs
        const sparePartIds = populatedMaint.flatMap(m => m.spareParts || []);
        const spareParts = await SparePart.find({ _id: { $in: sparePartIds } });

        // Create a map of spare part names
        const sparePartsMap = {};
        spareParts.forEach(sp => {
            sparePartsMap[sp._id.toString()] = sp.partName;
        });

        // Replace spare part IDs with names
        populatedMaint = populatedMaint.map(m => {
            m.spareParts = (m.spareParts || []).map(spId => sparePartsMap[spId.toString()] || "Unknown");
            return m;
        });


        res.status(200).json(populatedMaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all maintenance tickets Closed
 * @route GET /api/maintenance/closed
 * @access Private
 * @role Admin, Super Admin
 * -------------------------------------------*/
export const getClosedMaintTickets = async (req, res) => {
    try {
        const maintenances = await Maintenance.find({ status: 'Closed' })
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
            return res.status(404).json({ message: "No closed maintenance tickets found" });
        }
        let populatedMaint = await Promise.all(maintenances.map(async (maint) => {
            if (maint.reportId) {
                const report = await Report.findById(maint.reportId);
                maint.reportId = report;
            }
            return maint;
        }));

        // Gather all spare part IDs
        const sparePartIds = populatedMaint.flatMap(m => m.spareParts || []);
        const spareParts = await SparePart.find({ _id: { $in: sparePartIds } });

        // Create a map of spare part names
        const sparePartsMap = {};
        spareParts.forEach(sp => {
            sparePartsMap[sp._id.toString()] = sp.partName;
        });

        // Replace spare part IDs with names
        populatedMaint = populatedMaint.map(m => {
            m.spareParts = (m.spareParts || []).map(spId => sparePartsMap[spId.toString()] || "Unknown");
            return m;
        });

        res.json(populatedMaint);
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