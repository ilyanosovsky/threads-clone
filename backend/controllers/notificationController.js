import Notification from "../models/notificationModel.js";

const getNotifications = async (req, res) => {
  try {
      const userId = req.userId; // Use userId from JWT
      console.log("User ID from JWT:", userId);

      const notifications = await Notification.find({
          user: userId,
          read: false,
      }).populate('actionUser', 'profilePic name');
      
      res.json(notifications);
  } catch (error) {
      console.error("Error in getNotifications:", error); // Log the error
      res.status(500).send(error.message);
  }
};


const markAsRead = async (req, res) => {
  try {
      const { notificationId } = req.body;
      const userId = req.userId; // Use userId from JWT

      // Optionally, you can verify if the notification belongs to the logged-in user
      const notification = await Notification.findOne({ _id: notificationId, user: userId });
      if (!notification) {
          return res.status(404).send("Notification not found or not for this user");
      }

      await Notification.findByIdAndUpdate(notificationId, { read: true });
      res.status(204).send();
  } catch (error) {
      res.status(500).send(error.message);
  }
};

  
  export { getNotifications, markAsRead };