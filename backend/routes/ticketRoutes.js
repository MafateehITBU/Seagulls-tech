import express from 'express';
import {
    getClosedCleaningTickets,
    getCleaningTickets,
    getClosedMaintTickets,
    getMaintTickets,
    getClosedAccidentTickets,
    getAccidentTickets,
    rejectTicket,
    approveTicket,
    closeTicket
} from '../controllers/ticketController.js';
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.get('/closed-cleaning', verifyToken, authorizePosition('admin', 'superadmin'), getClosedCleaningTickets); // Get all closed cleaning tickets
router.get('/cleaning-tickets', verifyToken, authorizePosition('admin', 'superadmin'), getCleaningTickets); // Get all cleaning tickets (Open, In Progress, Rejected)
router.get('/closed-maintenance', verifyToken, authorizePosition('admin', 'superadmin'), getClosedMaintTickets); // Get all closed maintenance tickets
router.get('/maintenance-tickets', verifyToken, authorizePosition('admin', 'superadmin'), getMaintTickets); // Get all maintenance tickets (Open, In Progress, Rejected)
router.get('/closed-accident', verifyToken, authorizePosition('admin', 'superadmin'), getClosedAccidentTickets); // Get all closed accident tickets
router.get('/accident-tickets', verifyToken, authorizePosition('admin', 'superadmin'), getAccidentTickets); // Get all accident tickets (Open, In Progress, Rejected)
router.post('/reject/:ticketId', verifyToken, authorizePosition('admin', 'superadmin'), rejectTicket); // Reject a ticket
router.post('/approve/:ticketId', verifyToken, authorizePosition('admin', 'superadmin'), approveTicket); // Approve a ticket
router.post('/close/:ticketId', verifyToken, authorizePosition('admin', 'superadmin'), closeTicket); // Close a ticket

export default router;