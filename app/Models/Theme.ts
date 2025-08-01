import mongoose from "mongoose";

const themeSchema = new mongoose.Schema({
  customPrimary: {
    type: String,
    required: true,
    default: "#000000",
  },
  customSecondary: {
    type: String,
    required: true,
    default: "#ffffff",
  },
  customTertiary: {
    type: String,
    required: true,
    default: "#000000",
  },
});

const Theme = mongoose.models.Theme || mongoose.model("Theme", themeSchema);

export default Theme; 