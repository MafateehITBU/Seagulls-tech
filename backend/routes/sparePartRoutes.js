import express from 'express';
import {
    addSparePart,
    getSpareParts,
    getSparePartById,
    updateSparePart,
    deleteSparePart,
} from '../controllers/sparePartController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizePosition from '../middleware/authorizePosition.js';
import upload from '../middleware/photoUpload.js';

const router = express.Router();
router.post('/', verifyToken, authorizePosition('superadmin', 'admin'), upload.single("sparePic"), addSparePart);
router.get('/', verifyToken, getSpareParts);
router.get('/:id', verifyToken, getSparePartById);
router.put('/:id', verifyToken, authorizePosition('superadmin', 'admin'), upload.single("sparePic"),updateSparePart);
router.delete('/:id', verifyToken, authorizePosition('superadmin', 'admin'), deleteSparePart);

export default router;