import express from 'express';
import {
    addAdmin,
    getAllAdmins,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    signin
} from '../controllers/adminController.js';
import upload from '../middleware/photoUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizePosition from '../middleware/authorizePosition.js';

const router = express.Router();
router.post('/add', verifyToken, authorizePosition('superadmin'), upload.single("profilePic"), addAdmin); // Add a new admin
router.get('/', verifyToken, authorizePosition('superadmin'), getAllAdmins); // Get all admins
router.get('/:id', verifyToken, authorizePosition('superadmin', 'admin'), getAdmin); // Get a single admin by ID
router.put('/:id', verifyToken, authorizePosition('superadmin', 'admin'), upload.single("profilePic"),updateAdmin); // Update an admin by ID
router.delete('/:id', verifyToken, authorizePosition('superadmin'), deleteAdmin); // Delete an admin by ID
router.post('/signin', signin); // Admin/Tech Signin

export default router;