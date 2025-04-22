import express from "express";
import {
    createReport,
    getReportById,
    updateReport,
} from "../controllers/reportController.js";
import upload from "../middleware/photoUpload.js";
import verifyToken from "../middleware/verifyToken.js";
import authorizePosition from "../middleware/authorizePosition.js";

const router = express.Router();
router.post(
    '/',
    verifyToken,
    authorizePosition('tech'),
    upload.fields([
        { name: 'photoBefore', maxCount: 1 },
        { name: 'photoAfter', maxCount: 1 },
    ]),
    createReport
);

router.get('/:id', verifyToken, getReportById); // Get a single report by ID
router.put(
    '/:id',
    verifyToken,
    upload.fields([
        { name: 'photoBefore', maxCount: 1 },
        { name: 'photoAfter', maxCount: 1 }
    ]),
    updateReport
); // Update a report by ID


export default router;