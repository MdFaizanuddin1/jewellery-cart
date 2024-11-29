import mongoose, { Schema } from "mongoose";

const schemeSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnailImg: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schemeType: {
      type: String,
      enum: ["oneTime", "monthly"],
    },
    minAmount: {
      type: Number,
      required: true,
    },
    maxAmount: {
      type: Number,
      required: true,
    },
    subscribedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    duration: {
      type: String,
      default: "11 months",
    },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model("Scheme", schemeSchema);
