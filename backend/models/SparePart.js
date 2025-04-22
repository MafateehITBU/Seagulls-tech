import mongoose from "mongoose";

const sparePartSchema = new mongoose.Schema({
    partNo: {
        type: String,
        unique: true,
        required: true,
    },
    partName: {
        type: String,
        required: true,
    },
    partBarcode: {
        type: String,
        unique: true, // check if it must be unique or not
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    photo: {
        type: String,
    },
    minStock: {
        type: Number,
        required: true,
    },
    maxStock: {
        type: Number,
        required: true,
    },
    expiryDate: {
        type: Date,
    },
    leadTime: {
        type: String,
    },
    storageType: {
        type: String,
        enum: ['cold', 'regular'],
        default: 'regular',
    }
}, { timestamps: true })

const SparePart = mongoose.model('SparePart', sparePartSchema);
export default SparePart;