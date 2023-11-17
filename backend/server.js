import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db/connectDB.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import galleryRoutes from "./routes/galleryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

connectDB();

const PORT = process.env.PORT || 5000;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors(
	{
		origin: "https://threads-clone-server.vercel.app/",
		methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
		credentials: true
	}
));


// Middlewares
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true }));


// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/gallery", galleryRoutes);

app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`));