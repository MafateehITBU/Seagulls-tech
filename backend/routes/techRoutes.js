import express from 'express';
import {
    getAllTechs,
    getTechById,
    addTech,
    updateTech,
    deleteTech
} from '../controllers/techController.js';
import upload from '../middleware/photoUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizePosition from '../middleware/authorizePosition.js';

const router = express.Router();
router.post('/add', verifyToken, authorizePosition('superadmin', 'admin'), upload.single("profilePic"), addTech); // Add a new tech
router.get('/', verifyToken, authorizePosition('superadmin', 'admin'), getAllTechs); // Get all techs
router.get('/:id',verifyToken, getTechById); // Get a single tech by ID
router.put('/:id',verifyToken, updateTech); // Update a tech by ID
router.delete('/:id',verifyToken, authorizePosition('superadmin', 'admin'), deleteTech); // Delete a tech by ID

export default router;