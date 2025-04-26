import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const adminSchema = new mongoose.Schema({
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
    photo: {
        type: String,
    },
    bio: {
        type: String,
    },
    position: {
        type: String,
        enum: ['admin', 'superadmin'],
        default: 'admin',
    },
}, { timestamps: true });

// This will hash the password before saving it to the database
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

adminSchema.pre('save', function (next) {
    const encodedName = encodeURIComponent(this.name);

    if (!this.photo) {
        this.photo = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
        return next();
    }

    if (this.isModified('name')) {
        if (this.isModified('photo')) {
            // Both name and photo modified — do nothing
            return next();
        }

        if (this.photo.includes('ui-avatars.com')) {
            // Only name modified and photo is an avatar — regenerate
            this.photo = `https://ui-avatars.com/api/?name=${encodedName}&size=128`;
        }
    }

    next();
});


const Admin = mongoose.model('Admin', adminSchema);
export default Admin;