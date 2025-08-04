import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["ai_completion", "pro_plan", "system"],
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    link: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;