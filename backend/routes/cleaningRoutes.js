import express from 'express';
import {
    createCleaningTicket,
    getCleaningTicketsByTech,
    getEveryoneTicket,
    claimTicket,
    addReportToCleaning,
    startCleaning,
    closeCleaning,
    deleteCleaning
} from '../controllers/cleaningController.js';
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, createCleaningTicket); // Create a new cleaning ticket
router.get('/tech', verifyToken, authorizePosition('tech'), getCleaningTicketsByTech); // Get all cleaning tickets assigned to a specific tech
router.get('/everyone', verifyToken, authorizePosition('tech'), getEveryoneTicket); // Get all cleaning tickets for everyone
router.post('/claim/:cleaningId', verifyToken, authorizePosition('tech'), claimTicket); // Claim a cleaning ticket
router.post
    (
        '/tech/:cleaningId',
        verifyToken, authorizePosition('tech'),
        upload.fields([
            { name: 'photoBefore', maxCount: 1 },
            { name: 'photoAfter', maxCount: 1 }
        ]),
        addReportToCleaning
    ); // Add a report to a cleaning ticket
router.post('/tech/start/:cleaningId', verifyToken, authorizePosition('tech'), startCleaning); // Start cleaning ticket
router.post('/tech/close/:cleaningId', verifyToken, authorizePosition('tech'), closeCleaning); // Close cleaning ticket
router.delete('/:cleaningId', verifyToken, authorizePosition('admin', 'superadmin'), deleteCleaning); // Delete a cleaning ticket

export default router;