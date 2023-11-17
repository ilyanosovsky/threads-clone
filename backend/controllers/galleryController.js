import Gallery from "../models/galleryModel.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new album
const createAlbum = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.userId; // Extracted from JWT token

        const newAlbum = new Gallery({
            name,
            createdBy: userId,
        });

        await newAlbum.save();
        res.status(201).json(newAlbum);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAlbum = async (req, res) => {
    try {
        const albumId = req.params.albumId;
        const album = await Gallery.findById(albumId).populate('images');
        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }
        res.status(200).json(album);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllAlbums = async (req, res) => {
    try {
        const userId = req.userId; // Assuming you're using JWT to get the user's ID
        const albums = await Gallery.find({ createdBy: userId }).populate('images');
        res.status(200).json(albums);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Add an image to an album
const addImageToAlbum = async (req, res) => {
    try {
        const { albumId, img } = req.body;

        const uploadedResponse = await cloudinary.uploader.upload(img);
        const imageUrl = uploadedResponse.secure_url;

        const album = await Gallery.findById(albumId);

        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }

        album.images.push({ imageUrl });
        await album.save();

        res.status(200).json(album);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getImage = async (req, res) => {
    try {
        const { albumId, imageId } = req.params;
        const album = await Gallery.findById(albumId);
        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }
        const image = album.images.find(image => image._id.toString() === imageId);
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }
        res.status(200).json(image);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Remove an image from an album
const removeImageFromAlbum = async (req, res) => {
    try {
        const { albumId, imageId } = req.params;

        const album = await Gallery.findById(albumId);

        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }

        const image = album.images.id(imageId);
        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        // Optional: Delete image from Cloudinary
        const imgId = image.imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imgId);

        image.remove();
        await album.save();

        res.status(200).json({ message: "Image removed from album" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update album details
const updateAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;
        const { name } = req.body;

        const album = await Gallery.findByIdAndUpdate(albumId, { name }, { new: true });

        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }

        res.status(200).json(album);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete an album
const deleteAlbum = async (req, res) => {
    try {
        const { albumId } = req.params;

        const album = await Gallery.findByIdAndDelete(albumId);

        if (!album) {
            return res.status(404).json({ error: "Album not found" });
        }

        // Optional: Delete all images from Cloudinary
        // ...

        res.status(200).json({ message: "Album deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { createAlbum, addImageToAlbum, removeImageFromAlbum, updateAlbum, deleteAlbum, getAlbum, getImage, getAllAlbums };
