import express from 'express';
import {
    createAsset,
    getAllAssets,
    getAssetById,
    updateAsset,
    deleteAsset,
} from '../controllers/assetController.js';
import upload from '../middleware/photoUpload.js';
import verifyToken from '../middleware/verifyToken.js';
import authorizePosition from '../middleware/authorizePosition.js';

const router = express.Router();
router.post('/', verifyToken, authorizePosition('superadmin', 'admin'), upload.single('assetPic'), createAsset); // Create a new asset
router.get('/', verifyToken, authorizePosition('superadmin', 'admin'), getAllAssets); // Get all assets
router.get('/:id', verifyToken, getAssetById); // Get a single asset by ID
router.put('/:id', verifyToken, authorizePosition('superadmin', 'admin'), upload.single('assetPic'), updateAsset); // Update an asset by ID
router.delete('/:id', verifyToken, authorizePosition('superadmin', 'admin'), deleteAsset); // Delete an asset by ID


export default router;