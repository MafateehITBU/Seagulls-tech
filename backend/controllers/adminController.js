import Admin from '../models/Admin.js';
import Tech from '../models/Tech.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import helpers from "../utils/helpers.js";

/**-----------------------------------------
 *  @desc Add a new admin
 * @route POST /api/admin/add
 * @access Private
 * @role Super Admin
 ------------------------------------------*/
export const addAdmin = async (req, res) => {
    const { name, email, password, phone, bio, position } = req.body;
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

    // Check if a file is uploaded
    let profilePictureUrl = null;
    if (req.file) {
        try {
            profilePictureUrl = await uploadToCloudinary(req.file.path);
            // Delete the local file after uploading
            fs.unlinkSync(req.file.path);
        } catch (error) {
            return res
                .status(500)
                .json({ message: "Failed to upload profile picture" });
        }
    }

    // Check if the admin already exists
    const existingAdmin = await Admin.find({ email });
    if (existingAdmin.length > 0) {
        return res.status(400).json({ message: "Admin already exists" });
    }

    const lowerCaseEmail = email.toLowerCase();
    try {
        const newAdmin = new Admin({
            name,
            email: lowerCaseEmail,
            password,
            phone,
            bio,
            position,
            photo: profilePictureUrl,
        });

        await newAdmin.save();
        return res.status(201).json({ message: "Admin added successfully", newAdmin });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Get all admins
 * @route GET /api/admin
 * @access Private
 * @role Super Admin
 ------------------------------------------*/
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select("-password");
        return res.status(200).json(admins);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Get a single admin
 * @route GET /api/admin/:id
 * @access Private
 * @role Super Admin
 ------------------------------------------*/
export const getAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id).select("-password");
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json(admin);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Update an admin
 * @route PUT /api/admin/:id
 * @access Private
 * @role Super Admin, Admin
 * @param {string} id - The ID of the admin to update
 ------------------------------------------*/
export const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, bio, position } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
    }

    // Update only the fields that are provided
    if (name) admin.name = name;
    if (email) {
        if (!helpers.validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        admin.email = email.toLowerCase();
    }
    if (phone) {
        if (!helpers.validatePhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }
        admin.phone = phone;
    }
    if (bio) admin.bio = bio;
    if (position) admin.position = position;

    try {
        let profilePictureUrl = admin.photo;

        if (req.file) {
            try {
                profilePictureUrl = await uploadToCloudinary(req.file.path);
                fs.unlinkSync(req.file.path);  // Clean up the file after uploading
            } catch (error) {
                return res.status(500).json({ message: "Failed to upload profile picture" });
            }
        }

        // If a new profile picture URL exists, update it
        if (profilePictureUrl !== admin.photo) {
            admin.photo = profilePictureUrl;
        }

        await admin.save();
        return res.status(200).json({ message: "Admin updated successfully", admin });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**-----------------------------------------
 * @desc Update Admin Password
 * @route PUT /api/admin/update-password/:id
 * @access Private
 ------------------------------------------*/
export const updateAdminPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // Check if both fields are provided
    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Please provide both new password and confirm password" });
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate password strength
    if (!helpers.validatePassword(newPassword)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, contain at least one uppercase letter, one number, and one special character"
        });
    }

    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Update password and increment token version
        admin.password = newPassword;
        admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Increment token version

        await admin.save();

        // Clear all cookies
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({ 
            message: "Password updated successfully. Please sign in again.",
            signOut: true // Flag to indicate that user should be signed out
        });
    } catch (error) {
        console.error('Password update error:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**-----------------------------------------
 * @desc Delete an admin
 * @route DELETE /api/admin/:id
 * @access Private
 * @role Super Admin
 * @param {string} id - The ID of the admin to delete
 ------------------------------------------*/
export const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

/**-----------------------------------------
 * @desc Sign an admin/tech
 * @route POST /api/admin/login
 * @access Public
 ------------------------------------------*/
export const signin = async (req, res) => {
    const { email, password } = req.body;
    // Validate required fields
    if (!email || !password) {
        return res.status(400).json({ message: 'Please fill all required fields' });
    }
    // Validate email format
    if (!helpers.validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // convert email to lowercase
    const lowerCaseEmail = email.toLowerCase();

    try {
        // Try finding the user in Admins
        let user = await Admin.findOne({ email: lowerCaseEmail });
        let position = '';
        if (user) {
            position = user.position;
        }

        // If not found in Admins, try Techs
        if (!user) {
            user = await Tech.findOne({ email: lowerCaseEmail });
            position = 'tech';
        }

        // If still not found
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Token payload
        const payload = {
            id: user._id,
            position: position,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};