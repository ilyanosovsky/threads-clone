import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { v2 as cloudinary } from "cloudinary";

const createPost = async (req, res) => {
    try {
        const userId = req.userId; // Extract userId from JWT token
        const { text } = req.body;
        let { img } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ error: `Text must be less than ${maxLength} characters` });
        }

        if (img) {
            // Check if the image size exceeds 10MB
            if (Buffer.byteLength(img, 'base64') > 10 * 1024 * 1024) {
                return res.status(400).json({ error: "Image size exceeds 10MB" });
            }
    
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({ postedBy: userId, text, img });
        await newPost.save();

        // Populate user details in the new post response
        await newPost.populate('postedBy', 'username name profilePic');

        const snippet = text.slice(0, 50) + '...';

        // Create notifications for each follower
        const notifications = user.followers.map(followerId => ({
            user: followerId,
            actionUser: userId,
            content: `${user.name}'s new post`,
            link: `/${user.username}/post/${newPost._id}`,
            read: false,
            snippet
        }));

        await Notification.insertMany(notifications);
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log(err);
    }
};

const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		const userId = req.userId; // get user ID from JWT token

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		if (post.postedBy.toString() !== userId) {
			return res.status(401).json({ error: "Unauthorized to delete post" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

        // Delete notifications related to this post
        await Notification.deleteMany({ link: new RegExp(`/post/${post._id}`) });

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Post deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.userId; // Get userId from JWT token

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "Post unliked successfully" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
			res.status(200).json({ message: "Post liked successfully" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const replyToPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId; // Get user ID from JWT token

        // Fetch user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const { text } = req.body;
        let { img } = req.body;  // Retrieve img from request body
        const userProfilePic = user.profilePic;
        const username = user.username;

        if (!text) {
            return res.status(400).json({ error: "Text field is required" });
        }

        // Fetch post details
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (img) {
            // Check if the image size exceeds 10MB
            if (Buffer.byteLength(img, 'base64') > 10 * 1024 * 1024) {
                return res.status(400).json({ error: "Image size exceeds 10MB" });
            }
    
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const reply = { userId, text, userProfilePic, username, img, createdAt: new Date() };

        post.replies.push(reply);
        await post.save();

        // Fetch the post owner's user details
        const postOwner = await User.findById(post.postedBy);
        if (!postOwner) {
            return res.status(404).json({ error: "Post owner not found" });
        }

        // Create a notification for the post owner if the replier is not the post owner
        if (post.postedBy.toString() !== userId) {
            const snippet = text.slice(0, 50) + '...'; // Take the first 50 characters of the reply text

            const notification = new Notification({
                user: post.postedBy,
                actionUser: userId, // The user who made the reply
                content: `${user.name}'s new reply`,
                link: `/${postOwner.username}/post/${postId}`,
                read: false,
                snippet 
            });
            await notification.save();
        }

        res.status(200).json(reply);
    } catch (err) {
        console.error("Error in replyToPost:", err);  // Log the error for debugging
        res.status(500).json({ error: err.message });
    }
};

const deleteReply = async (req, res) => {
    try {
        const { postId, replyIndex } = req.params;
        const userId = req.userId;  // Get user ID from JWT token

        // Fetch the post
        const post = await Post.findById(postId);
        if (!post) {
            console.error(`Post not found for ID: ${postId}`);
            return res.status(404).json({ error: 'Post not found' });
        }
        const user = await User.findById(userId);
        const postOwner = await User.findById(post.postedBy);

        // Fetch the reply
        const reply = post.replies[replyIndex];
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Check if the request is made by the reply owner
        if (reply.userId.toString() !== userId) {
            return res.status(401).json({ error: 'Unauthorized to delete reply' });
        }

        // If the reply has an image, delete it from Cloudinary
        if (reply.img) {
            const imgId = reply.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        // Remove the reply from the replies array
        post.replies.splice(replyIndex, 1);

        // Save the updated post
        await post.save();

        const deleteResult = await Notification.deleteOne({ 
            link: `/${postOwner.username}/post/${postId}`,
            actionUser: userId, 
            content: `${user.name}'s new reply` 
        });

        res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (err) {
        console.error('Error in deleteReply:', err);  // Log the error for debugging
        res.status(500).json({ error: err.message });
    }
};

const getFeedPosts = async (req, res) => {
    try {
        const userId = req.params.userId; 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const following = user.following;

        // Use .populate to include user details in the response
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 }).populate('postedBy', 'username name profilePic');

        res.status(200).json(feedPosts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUserPosts = async (req, res) => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Use .populate to include user details in the response
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 }).populate('postedBy', 'username name profilePic');

        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, deleteReply };