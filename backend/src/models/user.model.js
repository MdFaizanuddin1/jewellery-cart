import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    aadhar: {
      type: String, // Store Aadhar as a string
      unique: true,
      sparse: true, // Allows the field to be optional but unique when provided
    },
    aadharImg: {
      type: [String],
    },
    pan: {
      type: String, // Store PAN as a string
      unique: true,
      sparse: true,
    },
    panImg: {
      type: [String],
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    subscribedSchemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SchemePurchase",
      },
    ],
    approved: {
      type: String,
      enum: ["waiting", "approved"],
      default: "waiting",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId, // Reference to the User who referred this user
      ref: "User",
    },
    referralCode: {
      type: String, // Unique code generated for each user
      unique: true,
    },
    referredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId, // List of users referred by this user
        ref: "User",
      },
    ],
    phone: {
      type: Number,
      unique: true,
    },
    referralEarnings: {
      totalEarnings: { type: Number, default: 0 }, // Total earnings from referrals
      monthlyEarnings: { type: Number, default: 0 }, // Earnings for the current month
    },
    isOffline: {
      type: Boolean,
      default: false,
    },    
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password is new or modified

  this.password = await bcrypt.hash(this.password, 10); // Hash the password

  next();
});

// Method to compare passwords
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.token = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      fullName: this.fullName,
      phone: this.phone,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRY }
  );
};

// Generate a unique referral code on user creation
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    // Generate a 4-digit random code
    this.referralCode = Math.floor(1000 + Math.random() * 9000).toString();
  }
  next();
});


// Create User model
export const User = mongoose.model("User", userSchema);
