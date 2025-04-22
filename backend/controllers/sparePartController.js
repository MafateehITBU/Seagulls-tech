import SparePart from "../models/SparePart.js";
import Vendor from "../models/Vendor.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**------------------------------------------
* @desc Add a new spare part
* @route POST /api/sparepart
* @access Private
* @role Super Admin, Admin
*-------------------------------------------*/
export const addSparePart = async (req, res) => {
    const { partNo, partName, partBarcode, quantity, minStock, maxStock, expiryDate, leadTime, storageType } = req.body;

    if (!partNo || !partName || !partBarcode || !quantity || !minStock || !maxStock) {
        return res.status(400).json({ message: "Please fill all required fields" });
    }

    if (quantity < minStock || quantity > maxStock) {
        return res.status(400).json({ message: "Quantity must be between minStock and maxStock" });
    }

    if (minStock > maxStock) {
        return res.status(400).json({ message: "minStock must be less than maxStock" });
    }

    if (new Date(expiryDate) < new Date()) {
        return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    if (leadTime < 0) {
        return res.status(400).json({ message: "Lead time must be a positive number" });
    }

    if (!["cold", "regular"].includes(storageType)) {
        return res.status(400).json({ message: "Storage type must be either 'cold' or 'regular'" });
    }

    const existingPartNo = await SparePart.findOne({ partNo });
    const existingPartBarcode = await SparePart.findOne({ partBarcode });

    if (existingPartNo) {
        return res.status(400).json({ message: "Part number already exists" });
    }

    if (existingPartBarcode) {
        return res.status(400).json({ message: "Part barcode already exists" });
    }

    try {
        let photoUrl = null;
        if (req.file) {
            try {
                photoUrl = await uploadToCloudinary(req.file.path);
                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                return res.status(500).json({ message: "Failed to upload picture" });
            }
        }

        const sparePart = new SparePart({
            partNo,
            partName,
            partBarcode,
            quantity,
            minStock,
            maxStock,
            expiryDate,
            leadTime,
            storageType,
            photo: photoUrl
        });

        const createdSpare = await sparePart.save();

        const vendor = await Vendor.findById(req.body.vendorId);
        if (vendor) {
            console.log("Vendor found:", vendor.name);
            vendor.spareParts.push(createdSpare._id);
            await vendor.save();
        } else {
            console.log("Vendor not found");
            return res.status(404).json({ message: "Vendor not found" });
        }

        return res.status(201).json({ message: "Spare part added successfully", sparePart });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get all spare parts
 * @route GET /api/sparepart
 * @access Public
 *-------------------------------------------*/
export const getSpareParts = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate("spareParts");
        const sparePartsWithVendor = [];

        vendors.forEach(vendor => {
            vendor.spareParts.forEach(sparePart => {
                sparePartsWithVendor.push({
                    ...sparePart._doc,
                    vendorName: vendor.name
                });
            });
        });

        if (sparePartsWithVendor.length === 0) {
            return res.status(404).json({ message: "No spare parts found" });
        }

        return res.status(200).json(sparePartsWithVendor);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Get spare part by ID
 * @route GET /api/sparepart/:id
 * @access Public
 *-------------------------------------------*/
export const getSparePartById = async (req, res) => {
    try {
        const { id } = req.params;
        const sparePart = await SparePart.findById(id);
        if (!sparePart) {
            return res.status(404).json({ message: "Spare part not found" });
        }

        const vendor = await Vendor.findOne({ spareParts: id }).select("name");
        return res.status(200).json({
            ...sparePart._doc,
            vendorName: vendor ? vendor.name : null
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Update spare part by ID
 * @route PUT /api/sparepart/:id
 * @access Private
 * @role Super Admin, Admin
 *-------------------------------------------*/
export const updateSparePart = async (req, res) => {
    const { id } = req.params;
    const { partNo, partName, partBarcode, quantity, minStock, maxStock, expiryDate, leadTime, storageType, vendorId } = req.body;

    const updatedFields = {
        partNo,
        partName,
        partBarcode,
        quantity,
        minStock,
        maxStock,
        expiryDate,
        leadTime,
        storageType
    };

    Object.keys(updatedFields).forEach(key => {
        if (updatedFields[key] === undefined) {
            delete updatedFields[key];
        }
    });

    if (
        updatedFields.quantity !== undefined &&
        updatedFields.minStock !== undefined &&
        updatedFields.maxStock !== undefined
    ) {
        if (updatedFields.quantity < updatedFields.minStock || updatedFields.quantity > updatedFields.maxStock) {
            return res.status(400).json({ message: "Quantity must be between minStock and maxStock" });
        }
    }

    if (
        updatedFields.minStock !== undefined &&
        updatedFields.maxStock !== undefined &&
        updatedFields.minStock > updatedFields.maxStock
    ) {
        return res.status(400).json({ message: "minStock must be less than maxStock" });
    }

    if (updatedFields.expiryDate !== undefined && new Date(updatedFields.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    if (updatedFields.leadTime !== undefined && updatedFields.leadTime < 0) {
        return res.status(400).json({ message: "Lead time must be a positive number" });
    }

    if (updatedFields.storageType !== undefined && !["cold", "regular"].includes(updatedFields.storageType)) {
        return res.status(400).json({ message: "Storage type must be either 'cold' or 'regular'" });
    }

    const existingPartNo = await SparePart.findOne({ partNo, _id: { $ne: id } });
    const existingPartBarcode = await SparePart.findOne({ partBarcode, _id: { $ne: id } });

    if (existingPartNo) {
        return res.status(400).json({ message: "Part number already exists" });
    }

    if (existingPartBarcode) {
        return res.status(400).json({ message: "Part barcode already exists" });
    }

    try {
        let photoUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, "spareParts");
            photoUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        if (vendorId) {
            const currentVendor = await Vendor.findOne({ spareParts: id });
            if (!currentVendor || currentVendor._id.toString() !== vendorId) {
                if (currentVendor) {
                    currentVendor.spareParts = currentVendor.spareParts.filter(part => part.toString() !== id);
                    await currentVendor.save();
                }

                const newVendor = await Vendor.findById(vendorId);
                if (!newVendor) {
                    return res.status(404).json({ message: "Vendor not found" });
                }

                newVendor.spareParts.push(id);
                await newVendor.save();
            }
        }

        const updatePayload = { ...updatedFields };
        if (photoUrl) updatePayload.photo = photoUrl;

        const sparePart = await SparePart.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!sparePart) {
            return res.status(404).json({ message: "Spare part not found" });
        }

        return res.status(200).json({ message: "Spare part updated successfully", sparePart });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**------------------------------------------
 * @desc Delete spare part by ID
 * @route DELETE /api/sparepart/:id
 * @access Private
 * @role Super Admin, Admin
 *-------------------------------------------*/
export const deleteSparePart = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the spare part exists
        const sparePart = await SparePart.findById(id);
        if (!sparePart) {
            return res.status(404).json({ message: "Spare part not found" });
        }

        // Remove the spare part from the vendor's spareParts array
        const vendor = await Vendor.findOne({ spareParts: id });
        if (vendor) {
            vendor.spareParts = vendor.spareParts.filter(part => part.toString() !== id);
            await vendor.save();
        }

        // Delete the spare part
        await SparePart.findByIdAndDelete(id);

        return res.status(200).json({ message: "Spare part deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
