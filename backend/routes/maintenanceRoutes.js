import express from 'express';
import {
    createMaintenanceTicket,
    getAdminMaintenanceTickets,
    getClosedMaintTickets,
} from '../controllers/maintenanceController.js';
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, createMaintenanceTicket); // Create a new maintenance ticket
router.get('/', verifyToken, authorizePosition('admin', 'superadmin'), getAdminMaintenanceTickets); // Get all maintenance tickets for admin and super admin
router.get('/closed', verifyToken, authorizePosition('admin', 'superadmin'), getClosedMaintTickets); // Get all closed maintenance tickets

export default router;