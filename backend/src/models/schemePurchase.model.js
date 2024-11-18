import mongoose from "mongoose";

const schemePurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: "User",
      required: true,
    },
    schemeName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    aadhar: {
      type: String,
      required: true,
    },
    pan: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create SchemePurchase model
export const SchemePurchase = mongoose.model(
  "SchemePurchase",
  schemePurchaseSchema,
);
