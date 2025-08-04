import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: "/media/avatar.avif",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    subscription: {
        type: String,
        default: "Free",
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
})

const User = mongoose.models.User || mongoose.model("User", userSchema)

export default User