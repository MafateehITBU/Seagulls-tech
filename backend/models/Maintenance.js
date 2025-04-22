import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['Pending', 'Open', 'In Progress', 'Completed'],
        default: 'Pending',
    },
})

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);
export default Maintenance;