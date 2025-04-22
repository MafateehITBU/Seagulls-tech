import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const techSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    photo: {
        type: String
    },
}, { timestamps: true });

// This will hash the password before saving it to the database
techSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

techSchema.pre('save', function (next) {
    const encodedName = encodeURIComponent(this.name);

    if (!this.photo) {
        // If no photo set at all
        this.photo = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
    } else if (this.isModified('name') && this.photo.includes('ui-avatars.com')) {
        // If name changed AND photo is from ui-avatars, regenerate it
        this.photo = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
    }

    next();
});

const Tech = mongoose.model('Tech', techSchema);
export default Tech;