import express from 'express';
import {
    getClosedCleaningTickets,
    getClosedMaintTickets,
    getClosedAccidentTickets,
    rejectTicket,
} from '../controllers/ticketController.js';
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.get('/closed-cleaning', verifyToken, authorizePosition('admin', 'superadmin'), getClosedCleaningTickets); // Get all closed cleaning tickets
router.get('/closed-maintenance', verifyToken, authorizePosition('admin', 'superadmin'), getClosedMaintTickets); // Get all closed maintenance tickets
router.get('/closed-accident', verifyToken, authorizePosition('admin', 'superadmin'), getClosedAccidentTickets); // Get all closed accident tickets
router.post('/reject/:ticketId', verifyToken, authorizePosition('admin', 'superadmin'), rejectTicket); // Reject a ticket

export default router;