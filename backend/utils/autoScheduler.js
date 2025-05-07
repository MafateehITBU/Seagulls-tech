import Asset from "../models/Asset.js";
import Ticket from "../models/Ticket.js";
import Maintenance from "../models/Maintenance.js";
import Cleaning from "../models/Cleaning.js";
import { emitToAdmins, emitToTech } from './socket.js';
import { v4 as uuidv4 } from 'uuid';

export const autoMaintenanceScheduler = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueAssets = await Asset.find({
            "maintenanceSchedule.nextMaintenanceDate": { $lte: today },
        });

        for (const asset of dueAssets) {
            // Create a new ticket
            const ticket = new Ticket({
                priority: "Medium",
                assetId: asset._id,
                description: "Scheduled automatic maintenance.",
                status: "Open",
            });

            const savedTicket = await ticket.save();

            // Create a new maintenance record
            const maintenance = new Maintenance({
                ticketId: savedTicket._id,
                requireSpareParts: false,
                spareParts: [],
                status: "Pending",
            });

            await maintenance.save();

            // Update asset's next maintenance date
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + asset.maintenanceSchedule.intervalInDays);
            asset.maintenanceSchedule.nextMaintenanceDate = nextDate;

            await asset.save();

            // Generate a unique notifID
            const notifID = uuidv4(); // Generate a unique ID for the notification

            emitToAdmins('new-notification', {
                notifID,
                title: "System Ticket Created!",
                message: 'A maintenance ticket created automatically.',
                route: "/maintenance",
                createdAt: new Date(),
            });
        }

        console.log(`[AutoMaint] Processed ${dueAssets.length} assets.`);
    } catch (error) {
        console.error("[AutoMaint Error]:", error.message);
    }
};

export const autoCleaningScheduler = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find assets where nextCleaningDate is due or past
        const dueAssets = await Asset.find({
            "cleaningSchedule.nextCleaningDate": { $lte: today },
        });

        for (const asset of dueAssets) {
            // Create a new cleaning ticket
            const ticket = new Ticket({
                priority: "Medium",
                assetId: asset._id,
                description: "Scheduled automatic cleaning.",
                status: "Open",
            });

            const savedTicket = await ticket.save();

            // Create a new cleaning record
            const cleaning = new Cleaning({
                ticketId: savedTicket._id,
                reportId: null,
                note: null,
                status: 'Pending',
            });

            await cleaning.save();

            // Update asset's next cleaning date
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + asset.cleaningSchedule.intervalInDays);
            asset.cleaningSchedule.nextCleaningDate = nextDate;

            await asset.save();
            // Generate a unique notifID
            const notifID = uuidv4(); // Generate a unique ID for the notification

            emitToAdmins('new-notification', {
                notifID,
                title: "System Ticket Created!",
                message: 'A cleaning ticket created automatically.',
                route: "/cleaning",
                createdAt: new Date(),
            });
        }

        console.log(`[AutoCleaning] Processed ${dueAssets.length} assets.`);
    } catch (error) {
        console.error("[AutoCleaning Error]:", error.message);
    }
};
