import mongoose from "mongoose";

const PriceSchema = new mongoose.Schema(
  {
    gold: {
      type: Number,
      default: 0.100000,
      required: true,
    },
    silver: {
      type: Number,
      default: 0.100000,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Price = mongoose.model("price", PriceSchema);
