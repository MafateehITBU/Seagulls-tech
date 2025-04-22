import mongoose from "mongoose";

const cleaningSchema = new mongoose.Schema({
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Ticket',
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
    },
    note: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'Open', 'In Progress', 'Closed'],
        default: 'Pending',
    },
})

const Cleaning = mongoose.model('Cleaning', cleaningSchema);
export default Cleaning;