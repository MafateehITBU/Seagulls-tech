import express from 'express';
import {
    createMaintenanceTicket,
    approveTechTicket,
    getMaintTicketsTech,
    addReportToMaint,
    addRejectReportToMaint,
    startMaint,
    updateSpareParts,
    closeMaint,
    deleteMaint
} from '../controllers/maintenanceController.js';
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, upload.single('ticketPhoto'), createMaintenanceTicket); // Create a new maintenance ticket
router.get('/tech', verifyToken, authorizePosition('tech'), getMaintTicketsTech); // Get all maintenance tickets assigned to a specific tech
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
router.post
    (
        '/tech/reject/:maintId',
        verifyToken, authorizePosition('tech'),
        upload.fields([
            { name: 'photoBefore', maxCount: 1 },
            { name: 'photoAfter', maxCount: 1 }
        ]),
        addRejectReportToMaint
    ); // Add a reject report to a maintenance ticket
router.put('/approve/:maintId', verifyToken, authorizePosition('admin', 'superadmin'), approveTechTicket); // Approve Tickets Created by Tech
router.post('/tech/start/:maintId', verifyToken, authorizePosition('tech'), startMaint); // Start maintenance ticket
router.put('/spareparts/:maintId', verifyToken, authorizePosition('tech'), updateSpareParts); // Update spare parts in a maint ticket
router.post('/tech/close/:maintId', verifyToken, authorizePosition('tech'), closeMaint); // Close maintenance ticket
router.delete('/:maintId', verifyToken, authorizePosition('admin', 'superadmin'), deleteMaint); // Delete a maintenance ticket

export default router;