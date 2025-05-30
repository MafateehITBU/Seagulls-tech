import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    dateIssued: {
        type: Date,
        default: Date.now,
    },
    openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'openedByModel',
    },
    openedByModel: {
        type: String,
        enum: ['Tech', 'Admin'],
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tech',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    assetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Asset',
    },
    description: {
        type: String,
    },
    startTime: {
        type: Date,
    }, 
    endTime: {
        type: Date,
    },
    timer: {
        type: Number, // in minutes
        default: 0,
    },
    approved: {
        type: Boolean,
        default: null,
    },
    techTicketApprove: {
        type: Boolean,
        default: false,
    },
    techApproveNote: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress','Rejected','Done', 'Closed'],
        default: 'Open',
    },
    rejectionReason:{
        type: String,
    },
    photo: {
        type: String,
    }
}, { timestamps: true })

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;
// This schema defines a ticket system where tickets can be created for different types of issues (Cleaning, Maintenance, Accident).