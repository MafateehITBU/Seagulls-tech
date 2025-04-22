import Vendor from "../models/Vendor.js";

/**------------------------------------------
 * @desc Add a new vendor
 * @route POST /api/vendor
 * @access Private
 * @role Super Admin, Admin
 -------------------------------------------*/
export const addVendor = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: "Vendor already exists" });
        }
        // Create a new vendor
        const vendor = new Vendor({
            name,
            email,
            phone,
        });
        await vendor.save();
        return res.status(201).json({ message: "Vendor added successfully", vendor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Get all vendors
 * @route GET /api/vendor
 * @access Private
 * @role Super Admin, Admin
 -------------------------------------------*/
export const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        // populate the spare parts with name if not empty
        if (vendors.length > 0) {
            // Check if the spareParts array is not empty before populating for all vendors
            for (let i = 0; i < vendors.length; i++) {
                if (vendors[i].spareParts.length > 0) {
                    await vendors[i].populate("spareParts", "name");
                }
            }
        }

        if (vendors.length === 0) {
            return res.status(404).json({ message: "No vendors found" });
        }
        return res.status(200).json({ message: "Vendors fetched successfully", vendors });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Get a vendor by ID
 * @route GET /api/vendor/:id
 * @access Private
 * @role Super Admin, Admin
 -------------------------------------------*/
export const getVendorById = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        // Populate the spareParts field with their names if the array is not empty
        if (vendor.spareParts.length > 0) {
            await vendor.populate("spareParts", "name");
        }
        return res.status(200).json({ message: "Vendor fetched successfully", vendor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Update a vendor
 * @route PUT /api/vendor/:id
 * @access Private
 * @role Super Admin, Admin
 -------------------------------------------*/
export const updateVendor = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const vendor = await Vendor.findById(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Update vendor details
        vendor.name = name || vendor.name;
        vendor.email = email || vendor.email;
        vendor.phone = phone || vendor.phone;

        await vendor.save();
        return res.status(200).json({ message: "Vendor updated successfully", vendor });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Delete a vendor
 * @route DELETE /api/vendor/:id
 * @access Private
 * @role Super Admin, Admin
 -------------------------------------------*/
export const deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findByIdAndDelete(req.params.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        return res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
}