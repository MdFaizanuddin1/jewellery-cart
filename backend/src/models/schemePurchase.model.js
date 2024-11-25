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
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Add a pre-save hook to calculate nextDueDate
schemePurchaseSchema.pre("save", function (next) {
  if (!this.nextDueDate) {
    const purchaseDate = this.purchaseDate || new Date();
    const nextDueDate = new Date(purchaseDate);
    nextDueDate.setDate(nextDueDate.getDate() + 30); // Add 30 days
    this.nextDueDate = nextDueDate;
  }
  next();
});

// Create SchemePurchase model
export const SchemePurchase = mongoose.model(
  "SchemePurchase",
  schemePurchaseSchema,
);
