    import mongoose from "mongoose";

    const vendorSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
        },
        spareParts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SparePart"
            }
        ]
    }, { timestamps: true })

    const Vendor = mongoose.model('Vendor', vendorSchema);
    export default Vendor;