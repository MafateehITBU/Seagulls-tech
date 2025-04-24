import Tech from '../models/Tech.js';
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import helpers from "../utils/helpers.js";

/**-----------------------------------------
 *  @desc Add a new tech
 * @route POST /api/tech
 * @access Private
 * @role Super Admin, Admin
 ------------------------------------------*/
export const addTech = async (req, res) => {
    try {
        const { name, email, password, phone, dob } = req.body;
        // validate required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }
        // validate email format
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        // validate phone format
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        // validate password strength
        if (!helpers.validatePassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character" });
        }
        // validate date of birth
        if (!helpers.validateDOB(dob)) {
            return res.status(400).json({ message: "You must be at least 18 years old" });
        }

        // Check if the tech already exists
        const existingTech = await Tech.find({ email });
        if (existingTech.length > 0) {
            return res.status(400).json({ message: "Tech already exists" });
        }

        const lowerCaseEmail = email.toLowerCase();

        // check if a file is uploaded
        let profilePictureUrl = null;
        if (req.file) {
            try {
                profilePictureUrl = await uploadToCloudinary(req.file.path);
                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                return res.status(500).json({ message: "Failed to upload profile picture" });
            }
        }

        const newTech = new Tech({
            name,
            email: lowerCaseEmail,
            password,
            phone,
            dob: new Date(dob),
            photo: profilePictureUrl,
        });
        await newTech.save();
        return res.status(201).json({ message: "Tech added successfully", newTech });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 *  @desc Get all techs
 * @route GET /api/tech
 * @access Private
 * @role Super Admin, Admin
 ------------------------------------------*/
export const getAllTechs = async (req, res) => {
    try {
        const techs = await Tech.find().select("-password");
        return res.status(200).json({ message: "Techs fetched successfully", techs });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

/**-----------------------------------------
 *  @desc Get a tech by ID
 * @route GET /api/tech/:id
 * @access Private
 * @role Super Admin, Admin, Tech
 ------------------------------------------*/
export const getTechById = async (req, res) => {
    try {
        const tech = await Tech.findById(req.params.id).select("-password");
        if (!tech) {
            return res.status(404).json({ message: "Tech not found" });
        }
        return res.status(200).json( tech );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

/**-----------------------------------------
 *  @desc Update a tech
 * @route PUT /api/tech/:id
 * @access Private
 * @role Super Admin, Admin, Tech
 ------------------------------------------*/
export const updateTech = async (req, res) => {
    const tech = await Tech.findById(req.params.id);
    if (!tech) {
        return res.status(404).json({ message: "Tech not found" });
    }

    // update only the fields that are provided
    if (req.body.name) tech.name = req.body.name;
    if (req.body.email) {
        // validate email format
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        tech.email = email.toLowerCase();
    }
    if (req.body.password) {
        // validate password format
        if (!helpers.validatePassword(password)) {
            return res.status(400).json({ message: "Invalid password format" });
        }
        tech.password = password;
    }
    if (req.body.phone) {
        // validate phone format
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        tech.phone = phone;
    }
    if (req.body.dob) {
        // validate date of birth
        if (!helpers.validateDOB(dob)) {
            return res.status(400).json({ message: "You must be at least 18 years old" });
        }
        tech.dob = new Date(dob);
    }
    try {
        // Check if a file is uploaded
        let profilePictureUrl = null;
        if (req.file) {
            try {
                profilePictureUrl = await uploadToCloudinary(req.file.path);
                // Delete the local file after uploading
                fs.unlinkSync(req.file.path);
            } catch (error) {
                return res.status(500).json({ message: "Failed to upload profile picture" });
            }
        }

        if (profilePictureUrl) tech.photo = profilePictureUrl;
        await tech.save();
        return res.status(200).json({ message: "Tech updated successfully", tech });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

/**-----------------------------------------
 * @desc Delete a tech
 * @route DELETE /api/tech/:id
 * @access Private
 * @role Super Admin, Admin
 ------------------------------------------*/
export const deleteTech = async (req, res) => {
    const { id } = req.params;
    try {
        const tech = await Tech.findByIdAndDelete(id);
        if (!tech) {
            return res.status(404).json({ message: "Tech not found" });
        }
        return res.status(200).json({ message: "Tech deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}