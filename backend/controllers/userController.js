import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
	// We will fetch user profile either with username or userId
	// query is either username or userId
	const { query } = req.params;

	try {
		let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await User.findOne({ _id: query }).select("-password").select("-updatedAt");
		} else {
			// query is username
			user = await User.findOne({ username: query }).select("-password").select("-updatedAt");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in getUserProfile: ", err.message);
	}
};

const signupUser = async (req, res) => {
	try {
		const { name, email, username, password } = req.body;
		const user = await User.findOne({ $or: [{ email }, { username }] });

		if (user) {
			return res.status(400).json({ error: "User already exists" });
		}
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			name,
			email,
			username,
			password: hashedPassword,
		});
		await newUser.save();

		if (newUser) {
			const token = generateToken(newUser._id);
			res.status(201).json({
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				username: newUser.username,
				bio: newUser.bio,
				profilePic: newUser.profilePic,
				token,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in signupUser: ", err.message);
	}
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(400).json({ error: "Username does not exist" });

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (isPasswordCorrect) {
			// Update lastVisit when the user logs in
			user.lastVisit = Date.now();
			await user.save();

            // Create session
            // req.session.userId = user._id;
			// console.log("Session after login:", req.session);
			const token = generateToken(user._id);
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profilePic: user.profilePic,
				token,
            });
			console.log("user logged in ->", user._id)
        } else {
            return res.status(400).json({ error: "Incorrect password" });
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("Error in loginUser: ", error.message);
    }
};

const logoutUser = (req, res) => {
    try {
        // Destroy session
        // req.session.destroy(err => {
        //     if (err) {
        //         res.status(500).json({ error: err.message });
        //     } else {
        //         res.status(200).json({ message: "User logged out successfully" });
        //     }
        // });
		res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in logoutUser: ", err.message);
    }
};

const followUnFollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id; // ID of the user to follow/unfollow
        const userId = req.userId; // Authenticated user's ID from JWT

        const userToModify = await User.findById(targetUserId);
        const currentUser = await User.findById(userId);

        if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

        if (targetUserId === userId.toString())
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });

			const isFollowing = currentUser.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(targetUserId, { $pull: { followers: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { following: targetUserId } });
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow user
            await User.findByIdAndUpdate(targetUserId, { $push: { followers: userId } });
            await User.findByIdAndUpdate(userId, { $push: { following: targetUserId } });
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("Error in followUnFollowUser: ", err.message);
    }
};

const updateUser = async (req, res) => {
	const { name, email, username, password, bio } = req.body;
	let { profilePic } = req.body;

	const userId = req.userId; // Get userId from JWT token

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: "User not found" });

		if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.name = name || user.name;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

		// Find all posts that this user replied and update username and userProfilePic fields
		await Post.updateMany(
			{ "replies.userId": userId },
			{
				$set: {
					"replies.$[reply].username": user.username,
					"replies.$[reply].userProfilePic": user.profilePic,
				},
			},
			{ arrayFilters: [{ "reply.userId": userId }] }
		);

		// password should be null in response
		user.password = null;

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log("Error in updateUser: ", err.message);
	}
};

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from JWT token

        // Convert userId to a MongoDB ObjectId
        const objectIdUserId = new mongoose.Types.ObjectId(userId);

        const usersFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: objectIdUserId },
                },
            },
            {
                $sample: { size: 10 },
            },
        ]);

        if (!Array.isArray(users)) {
            return res.status(500).json({ error: "Failed to fetch suggested users" });
        }

        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id.toString()));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach((user) => (user.password = null));

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error in getSuggestedUsers:", error); // Log the detailed error
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { signupUser, loginUser, logoutUser, followUnFollowUser, updateUser, getUserProfile, getSuggestedUsers };