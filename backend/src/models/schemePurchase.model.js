import mongoose from "mongoose";

const schemePurchaseSchema = new mongoose.Schema(
  {
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User model
      ref: "User",
      required: true,
    },
    scheme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scheme",
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
    amount: {
      type: Number,
      required: true,
    },
    // aadhar: {
    //   type: String,
    //   required: true,
    // },
    // pan: {
    //   type: String,
    //   required: true,
    // },
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
