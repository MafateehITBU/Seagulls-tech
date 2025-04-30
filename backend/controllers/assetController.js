import Asset from "../models/Asset.js";
import helpers from "../utils/helpers.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import QRCode from 'qrcode';

// helper: To calculate the next cleaning/ maintenance date
function calculateNextDate(startDate, intervalInDays) {
    let nextDate = new Date(startDate);
    const today = new Date();

    while (nextDate <= today) {
        nextDate = new Date(nextDate.getTime() + intervalInDays * 24 * 60 * 60 * 1000);
    }

    return nextDate;
}

/**------------------------------------------
 * @desc Create a new asset
 * @route POST /api/asset
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const createAsset = async (req, res) => {
    try {
        let {
            assetNo,
            assetName,
            assetType,
            assetSubType,
            assetStatus = 'Active',
            location,
            coordinates,
            installationDate,
            quantity = 1,
            cleaningIntervalInDays,
            maintIntervalInDays,
        } = req.body;

        if (!assetNo || !assetName || !assetType || !assetSubType || !location || !coordinates || !installationDate || !cleaningIntervalInDays || !maintIntervalInDays) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        if (!helpers.validateCoordinates(coordinates)) {
            return res.status(400).json({ message: "Invalid coordinates: must be numbers within valid range" });
        }

        if (cleaningIntervalInDays < 1 || maintIntervalInDays < 1) {
            return res.status(400).json({ message: "Interval in days must be greater than 0" });
        }

        if (!helpers.validateInstallationDate(installationDate)) {
            return res.status(400).json({ message: "Invalid installation date" });
        }
        const installationDateObj = new Date(installationDate);

        if (!helpers.validateQuantity(quantity)) {
            return res.status(400).json({ message: "Quantity must be greater than 0" });
        }

        if (!helpers.validateAssetStatus(assetStatus)) {
            return res.status(400).json({ message: "Invalid asset status" });
        }

        const existingAsset = await Asset.findOne({ assetNo });
        if (existingAsset) {
            return res.status(400).json({ message: "Asset with this number already exists" });
        }

        let photo = null;
        if (req.file) {
            photo = await uploadToCloudinary(req.file.path);
            fs.unlinkSync(req.file.path);
        }

        const nextCleaningDate = calculateNextDate(installationDateObj, cleaningIntervalInDays);
        const nextMaintenanceDate = calculateNextDate(installationDateObj, maintIntervalInDays);

        const newAsset = new Asset({
            assetNo,
            assetName,
            assetType,
            assetSubType,
            assetStatus,
            location,
            coordinates,
            installationDate: installationDateObj,
            quantity,
            photo,
            cleaningSchedule: {
                intervalInDays: cleaningIntervalInDays,
                nextCleaningDate
            },
            maintenanceSchedule: {
                intervalInDays: maintIntervalInDays,
                nextMaintenanceDate
            }
        });

        await newAsset.save();

        const assetPageUrl = `http://localhost:3000/asset-details/${newAsset._id}`; // Change url later
        const qrCodeImageUrl = await QRCode.toDataURL(assetPageUrl);

        newAsset.qrCode = qrCodeImageUrl;
        await newAsset.save();

        res.status(201).json({ message: "Asset Created Successfully!", newAsset });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

/**------------------------------------------
 * @desc Get all assets
 * @route GET /api/asset
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const getAllAssets = async (req, res) => {
    try {
        const assets = await Asset.find();
        res.status(200).json(assets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**------------------------------------------
 * @desc Get a single asset
 * @route GET /api/asset/:id
 * @access Public
 * @role Admin, Super Admin, Tech
 -------------------------------------------*/
export const getAssetById = async (req, res) => {
    const { id } = req.params;
    try {
        const asset = await Asset.findById(id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        res.status(200).json(asset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

/**------------------------------------------
 * @desc Update an asset
 * @route PUT /api/asset/:id
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const updateAsset = async (req, res) => {
    const { id } = req.params;
    const {
        assetNo,
        assetName,
        assetType,
        assetSubType,
        assetStatus,
        location,
        coordinates,
        installationDate,
        quantity,
        cleaningIntervalInDays,
        maintIntervalInDays,
    } = req.body;

    try {
        const asset = await Asset.findById(id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        let installationDateObj = asset.installationDate;

        // Validate and update coordinates
        if (coordinates) {
            if (!helpers.validateCoordinates(coordinates)) {
                return res.status(400).json({ message: "Invalid coordinates: must be numbers within valid range" });
            }
            asset.coordinates = coordinates;
        }

        // Validate and update installation date
        if (installationDate) {
            if (!helpers.validateInstallationDate(installationDate)) {
                return res.status(400).json({ message: "Invalid installation date" });
            }
            installationDateObj = new Date(installationDate);
            asset.installationDate = installationDateObj;
        }

        // Validate and update quantity
        if (quantity !== undefined) {
            if (!helpers.validateQuantity(quantity)) {
                return res.status(400).json({ message: "Quantity must be greater than 0" });
            }
            asset.quantity = quantity;
        }

        // Validate and update asset status
        if (assetStatus) {
            if (!helpers.validateAssetStatus(assetStatus)) {
                return res.status(400).json({ message: "Invalid asset status" });
            }
            asset.assetStatus = assetStatus;
        }

        // Update cleaning interval and next cleaning date
        if (cleaningIntervalInDays !== undefined) {
            if (cleaningIntervalInDays < 1) {
                return res.status(400).json({ message: "Interval in days must be greater than 0" });
            }
            asset.cleaningSchedule.intervalInDays = cleaningIntervalInDays;
            asset.cleaningSchedule.nextCleaningDate = new Date(installationDateObj.getTime() + cleaningIntervalInDays * 24 * 60 * 60 * 1000);
        }

        // Update maintenance interval and next maintenance date
        if (maintIntervalInDays !== undefined) {
            if (maintIntervalInDays < 1) {
                return res.status(400).json({ message: "Interval in days must be greater than 0" });
            }
            asset.maintenanceSchedule.intervalInDays = maintIntervalInDays;
            asset.maintenanceSchedule.nextMaintenanceDate = new Date(installationDateObj.getTime() + maintIntervalInDays * 24 * 60 * 60 * 1000);
        }

        // Optional fields
        if (assetNo) {
            const existingAsset = await Asset.findOne({ assetNo });
            if (existingAsset && existingAsset._id.toString() !== id) {
                return res.status(400).json({ message: "Asset with this number already exists" });
            }
            asset.assetNo = assetNo;
        }
        if (assetName) asset.assetName = assetName;
        if (assetType) asset.assetType = assetType;
        if (assetSubType) asset.assetSubType = assetSubType;
        if (location) asset.location = location;

        // Handle photo upload
        if (req.file) {
            try {
                asset.photo = await uploadToCloudinary(req.file.path);
                fs.unlinkSync(req.file.path);
            } catch (error) {
                return res.status(500).json({ message: "Failed to upload asset photo" });
            }
        }

        await asset.save();
        res.status(200).json({ message: "Asset Updated Successfully!", asset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**------------------------------------------
 * @desc Delete an asset
 * @route DELETE /api/asset/:id
 * @access Private
 * @role Admin, Super Admin
 -------------------------------------------*/
export const deleteAsset = async (req, res) => {
    const { id } = req.params;
    try {
        const asset = await Asset.findById(id);
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        await Asset.findByIdAndDelete(id);
        res.status(200).json({ message: "Asset Deleted Successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
