import express from "express";
import {
    createAccidentTicket,
    getAdminAccidentTickets,
    getClosedAccidentTickets,
    getAccidentTicketsTech,
    getEveryoneTicket,
    claimTicket,
    startAccident,
    addReportToAccident,
    addCrocaToAccident,
    closeAccident,
    deleteAccident
} from "../controllers/accidentController.js";
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, createAccidentTicket); // Create a new accident ticket
router.get('/', verifyToken, authorizePosition('admin', 'superadmin'), getAdminAccidentTickets); // Get all accident tickets for admin and super admin
router.get('/closed', verifyToken, authorizePosition('admin', 'superadmin'), getClosedAccidentTickets); // Get all closed accident tickets
router.get('/tech', verifyToken, authorizePosition('tech'), getAccidentTicketsTech); // Get all accident tickets assigned to a specific tech
router.get('/everyone', verifyToken, authorizePosition('tech'), getEveryoneTicket); // Get all accident tickets for everyone
router.post('/claim/:accidentId', verifyToken, authorizePosition('tech'), claimTicket); // Claim an accident ticket
router.post('/start/:accidentId', verifyToken, authorizePosition('tech'), startAccident); // Start accident ticket
router.post
    (
        '/tech/:accidentId',
        verifyToken, authorizePosition('tech'),
        upload.fields([
            { name: 'photoBefore', maxCount: 1 },
            { name: 'photoAfter', maxCount: 1 }
        ]),
        addReportToAccident
    ); // Add a report to a accident ticket
router.post('/croca/:accidentId', verifyToken, authorizePosition('tech'), upload.single('crocaPic'), addCrocaToAccident); // Add a croca to a accident ticket
router.post('/close/:accidentId', verifyToken, authorizePosition('tech'), closeAccident); // Close accident ticket
router.delete('/:accidentId', verifyToken, authorizePosition('admin', 'superadmin'), deleteAccident); // Delete a accident ticket

export default router;