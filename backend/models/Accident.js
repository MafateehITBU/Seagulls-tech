import mongoose from "mongoose";

const accidentSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ticket',
    },
    requireSpareParts: {
        type: Boolean,
        default: false,
    },
    spareParts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SparePart',
        }
    ],
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    },
    rejectReportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    },
    croca: {
        crocaType: {
            type: String,
            enum: ['Croca', 'Anonymous', 'Insurance Expired'],
        },
        cost: {
            type: String,
        },
        photo: {
            type: String,
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Open', 'In Progress', 'Closed'],
        default: 'Pending',
    },
}, { timestamps: true });

const Accident = mongoose.model('Accident', accidentSchema);
export default Accident;