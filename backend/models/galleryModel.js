import mongoose from "mongoose";

const imageSchema = mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const albumSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    images: [imageSchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Gallery = mongoose.model("Gallery", albumSchema);

export default Gallery;