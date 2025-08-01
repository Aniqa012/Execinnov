import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: String,
    maxAnsLength: {
        type: Number,
        default: 600
    }
})

const toolSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    systemInstructions: {
        type: String,
        required: true,
    },
    questions: [questionSchema],
    isPro: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
})

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

export const Tool = mongoose.models.Tool || mongoose.model("Tool", toolSchema);