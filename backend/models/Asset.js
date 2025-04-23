import mongoose from "mongoose";

const assetSchema = new mongoose.Schema({
    assetNo: {
        type: String,
        required: true,
        unique: true,
    },
    assetName: {
        type: String,
        required: true,
    },
    assetType: {
        type: String,
        enum: ['DS8', 'DS10', 'DS12'],
        required: true,
    },
    assetSubType: {
        type: String,
        enum: ['8SQM', '10SQM', '12SQM'],
        required: true,
    },
    assetStatus: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    location: {
        type: String,
        required: true,
    },
    coordinates: {
        lat: {
            type: Number,
            required: true
        },
        long: {
            type: Number,
            required: true
        }
    },
    installationDate: {
        type: Date,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    photo: {
        type: String,
    },
    cleaningSchedule: {
        intervalInDays: {
            type: Number,
            default: 14 // every 2 weeks
        },
        nextCleaningDate: {
            type: Date,
        }
    },
    maintenanceSchedule: {
        intervalInDays: {
            type: Number,
            default: 30 // every month
        },
        nextMaintenanceDate: {
            type: Date,
        }
    },
    maintenanceReports: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
        }
    ],
}, { timestamps: true });


const Asset = mongoose.model('Asset', assetSchema);
export default Asset;