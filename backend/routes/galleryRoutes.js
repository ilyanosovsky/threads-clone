import express from "express";
import {
    createAlbum,
    addImageToAlbum,
    removeImageFromAlbum,
    updateAlbum,
    deleteAlbum,
    getAlbum,
    getImage,
    getAllAlbums
} from "../controllers/galleryController.js";
import authenticate from "../middlewares/protectRoute.js";

const router = express.Router();

router.post("/album/create", authenticate, createAlbum);
router.post("/album/addImage", authenticate, addImageToAlbum);
router.delete("/album/:albumId/image/:imageId", authenticate, removeImageFromAlbum);
router.put("/album/:albumId", authenticate, updateAlbum);
router.delete("/album/:albumId", authenticate, deleteAlbum);
router.get("/album/:albumId", authenticate, getAlbum);
router.get("/album/:albumId/image/:imageId", authenticate, getImage);
router.get("/albums", authenticate, getAllAlbums);

export default router;
