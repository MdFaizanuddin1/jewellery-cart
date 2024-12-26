import mongoose from "mongoose";

const VersionSchema = new mongoose.Schema(
  {
    version: {
      type: String, // Use String to handle semantic versioning
      default: "1.0.0+1",
    },
  },
  {
    timestamps: true,
  }
);

export const Version = mongoose.model("Version", VersionSchema);
