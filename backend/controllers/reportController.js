import Report from "../models/Report.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

/**------------------------------------------
 * @desc Create a new report
 * @route POST /api/report
 * @access Private
 * @role Tech
 -------------------------------------------*/
export const createReport = async (req, res) => {
    try {
        const { description } = req.body;

        if (!description || !req.files || !req.files.photoBefore || !req.files.photoAfter) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Upload photoBefore
        const photoBeforePath = req.files.photoBefore[0].path;
        const photoBeforeUrl = await uploadToCloudinary(photoBeforePath);
        fs.unlinkSync(photoBeforePath); // remove local file

        // Upload photoAfter
        const photoAfterPath = req.files.photoAfter[0].path;
        const photoAfterUrl = await uploadToCloudinary(photoAfterPath);
        fs.unlinkSync(photoAfterPath); // remove local file

        const report = new Report({
            description,
            photoBefore: photoBeforeUrl,
            photoAfter: photoAfterUrl,
        });

        await report.save();
        res.status(201).json({ message: "Report created successfully", report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

/***------------------------------------------
 * @desc Get report by ID
 * @route GET /api/report/:id
 * @access Private
 * @role Tech, Admin, Super Admin
 -------------------------------------------*/
export const getReportById = async (req, res) => {
    try {
        const id = req.params.id;
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json({ message: "Report fetched successfully", report });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

/**------------------------------------------
 * @desc Update a report by ID
 * @route PUT /api/report/:id
 * @access Private
 * @role Tech
 -------------------------------------------*/
export const updateReport = async (req, res) => {
    try {
        const id = req.params.id;
        const { description } = req.body;

        // Fetch the existing report
        const report = await Report.findById(id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        // Handle photoBefore upload if provided
        if (req.files?.photoBefore?.[0]) {
            const path = req.files.photoBefore[0].path;
            const uploaded = await uploadToCloudinary(path);
            fs.unlinkSync(path);
            if (uploaded) {
                report.photoBefore = uploaded;
            }
        }

        // Handle photoAfter upload if provided
        if (req.files?.photoAfter?.[0]) {
            const path = req.files.photoAfter[0].path;
            const uploaded = await uploadToCloudinary(path);
            fs.unlinkSync(path);
            if (uploaded) {
                report.photoAfter = uploaded;
            }
        }

        // Update description if provided
        if (description) {
            report.description = description;
        }

        await report.save();

        res.status(200).json({ message: "Report updated successfully", report });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
