import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    photoBefore: {
        type: String,
        required: true,
    },
    photoAfter: {
        type: String,
        required: true,
    },
    reportDate: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

const Report = mongoose.model('Report', reportSchema);
export default Report;