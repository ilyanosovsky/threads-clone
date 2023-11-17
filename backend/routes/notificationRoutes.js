import express from "express";
import {
    getNotifications,
    markAsRead
} from "../controllers/notificationController.js";
import  authenticate  from "../middlewares/protectRoute.js";

const router = express.Router();

router.get('/', authenticate, getNotifications);
router.patch('/markAsRead', authenticate, markAsRead);

export default router;