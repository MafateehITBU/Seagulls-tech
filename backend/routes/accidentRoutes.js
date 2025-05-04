import express from "express";
import {
    createAccidentTicket,
    approveTechTicket,
    getAccidentTicketsTech,
    startAccident,
    addReportToAccident,
    addRejectReportToAccident,
    addCrocaToAccident,
    closeAccident,
    deleteAccident
} from "../controllers/accidentController.js";
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post('/', verifyToken, createAccidentTicket); // Create a new accident ticket
router.get('/tech', verifyToken, authorizePosition('tech'), getAccidentTicketsTech); // Get all accident tickets assigned to a specific tech
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
router.post
    (
        '/tech/reject/:accidentId',
        verifyToken, authorizePosition('tech'),
        upload.fields([
            { name: 'photoBefore', maxCount: 1 },
            { name: 'photoAfter', maxCount: 1 }
        ]),
        addRejectReportToAccident
    ); // Add a reject report to a accident ticket
router.put('/approve/:accidentId', verifyToken, authorizePosition('admin', 'superadmin'), approveTechTicket); // Approve Tickets Created by Tech
router.post('/croca/:accidentId', verifyToken, authorizePosition('tech'), upload.single('crocaPic'), addCrocaToAccident); // Add a croca to a accident ticket
router.post('/close/:accidentId', verifyToken, authorizePosition('tech'), closeAccident); // Close accident ticket
router.delete('/:accidentId', verifyToken, authorizePosition('admin', 'superadmin'), deleteAccident); // Delete a accident ticket

export default router;