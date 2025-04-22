import express from 'express';
import {
    getAllVendors,
    getVendorById,
    addVendor,
    updateVendor,
    deleteVendor
} from '../controllers/vendorController.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizePosition from '../middleware/authorizePosition.js';

const router = express.Router();
router.post('/', verifyToken, authorizePosition('superadmin', 'admin'), addVendor); // Add a new vendor
router.get('/', verifyToken, authorizePosition('superadmin', 'admin'), getAllVendors); // Get all vendors
router.get('/:id', verifyToken,authorizePosition('superadmin', 'admin'), getVendorById); // Get a single vendor by ID
router.put('/:id', verifyToken, authorizePosition('superadmin', 'admin'), updateVendor); // Update a vendor by ID
router.delete('/:id', verifyToken, authorizePosition('superadmin', 'admin'), deleteVendor); // Delete a vendor by ID

export default router;