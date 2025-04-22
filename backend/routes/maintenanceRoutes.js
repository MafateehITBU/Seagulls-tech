import express from 'express';
import {
    createMaintenanceTicket,
    getAdminMaintenanceTickets,
    getClosedMaintTickets,
    getMaintTicketsTech,
    getEveryoneTicket,
    claimTicket,
    addReportToMaint,
    startMaint,
    closeMaint,
    deleteMaint
} from '../controllers/maintenanceController.js';
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, createMaintenanceTicket); // Create a new maintenance ticket
router.get('/', verifyToken, authorizePosition('admin', 'superadmin'), getAdminMaintenanceTickets); // Get all maintenance tickets for admin and super admin
router.get('/closed', verifyToken, authorizePosition('admin', 'superadmin'), getClosedMaintTickets); // Get all closed maintenance tickets
router.get('/tech', verifyToken, authorizePosition('tech'), getMaintTicketsTech); // Get all maintenance tickets assigned to a specific tech
router.get('/everyone', verifyToken, authorizePosition('tech'), getEveryoneTicket); // Get all maintenance tickets for everyone
router.post('/claim/:maintId', verifyToken, authorizePosition('tech'), claimTicket); // Claim a maintenance ticket
router.post
    (
        '/tech/:maintId',
        verifyToken, authorizePosition('tech'),
        upload.fields([
            { name: 'photoBefore', maxCount: 1 },
            { name: 'photoAfter', maxCount: 1 }
        ]),
        addReportToMaint
    ); // Add a report to a maintenance ticket
router.post('/tech/start/:maintId', verifyToken, authorizePosition('tech'), startMaint); // Start maintenance ticket
router.post('/tech/close/:maintId', verifyToken, authorizePosition('tech'), closeMaint); // Close maintenance ticket
router.delete('/:maintId', verifyToken, authorizePosition('admin', 'superadmin'), deleteMaint); // Delete a maintenance ticket

export default router;