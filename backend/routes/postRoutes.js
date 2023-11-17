import express from "express";
import {
	createPost,
	deletePost,
	getPost,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
	deleteReply
} from "../controllers/postController.js";
import  authenticate  from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed/:userId",  getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", authenticate, createPost);
router.delete("/:id", authenticate, deletePost);
router.put("/like/:id", authenticate, likeUnlikePost);
router.put("/reply/:id/:userId", authenticate, replyToPost);
router.delete("/deleteReply/:postId/:replyIndex", authenticate, deleteReply);

export default router;