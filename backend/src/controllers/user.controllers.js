import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOtp, verifyOtp } from "../utils/twilio.js";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "NO user found");
    }
    const token = user.token();

    return token;
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const options = {
  httpOnly: true,
  secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role, fullName, referralCode, phone } =
    req.body;
  // console.log(req.body);

  if (
    [userName, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fieds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }, { phone }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with phone number , email or userName already exists"
    );
  }

  const userData = {
    userName,
    email,
    password,
    fullName,
  };

  // Include `role` only if it exists in the request body
  if (role) {
    userData.role = role;
  }

  if (phone) {
    userData.phone = phone;
  }

  const user = await User.create(userData);

  // Handle referral code if provided
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      throw new ApiError(400, "Invalid referral code");
    }
    user.referredBy = referrer._id;

    // Add this user to the referrer's referredUsers list
    referrer.referredUsers.push(user._id);
    await referrer.save();
  }
  await user.save();

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  const token = await generateTokens(createdUser._id);

  return res
    .status(201)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, token },
        "User registered successfully"
      )
    );
});

const registerUserOffline = asyncHandler(async (req, res) => {
  const {
    userName,
    email,
    password,
    role,
    fullName,
    referralCode,
    phone,
    isOffline,
  } = req.body;
  // console.log(req.body);

  if (
    [userName, email, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fieds are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }, { phone }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "User with phone number , email or userName already exists"
    );
  }

  const userData = {
    userName,
    email,
    password,
    fullName,
    isOffline: isOffline || true,
  };

  // Include `role` only if it exists in the request body
  if (role) {
    userData.role = role;
  }

  if (phone) {
    userData.phone = phone;
  }

  const user = await User.create(userData);

  // Handle referral code if provided
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      throw new ApiError(400, "Invalid referral code");
    }
    user.referredBy = referrer._id;

    // Add this user to the referrer's referredUsers list
    referrer.referredUsers.push(user._id);
    await referrer.save();
  }
  await user.save();

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  const token = await generateTokens(createdUser._id);

  return res
    .status(201)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        { user: createdUser, token },
        "User registered successfully"
      )
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //console.log(email);

  if (!email) {
    throw new ApiError(400, "email is required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User does not exists");
  }

  // console.log('password is',password)
  // console.log('user password is', user.password)
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const token = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("token", options)
    .send(new ApiResponse(200, {}, "User logged out successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("subscribedSchemes")
    .populate("address");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Current user details"));
});

const getAllUser = asyncHandler(async (req, res) => {
  if (req.user.role != "admin") {
    throw new ApiError(404, "You are not authorized to check all users");
  }
  const users = await User.find()
    .populate("subscribedSchemes")
    .populate("address");
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        users,
        users.length > 0
          ? `Total ${users.length} users fetched successfully`
          : "No users found"
      )
    );
});

const getReferredUsers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "referredUsers",
    "fullName email userName"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.referredUsers,
        "Referred users fetched successfully"
      )
    );
});
const getReferrer = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "referredBy",
    "fullName email userName"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.referredBy ? user.referredBy : {},
        user.referredBy ? "fetched the referer" : "There is no referer"
      )
    );
});
const generateReferralCode = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User does not exists");
  }
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, user.referralCode, "Referral code"));
});

const editUser = asyncHandler(async (req, res) => {
  const { userName, fullName, phone } = req.body;

  if (!req.user) {
    throw new ApiError(404, "You are not logged In");
  }
  const userId = req.user._id;

  // Check if fields are provided
  if (!userName && !fullName && !phone) {
    throw new ApiError(
      400,
      "At least one field (userName, fullName, phone) must be provided"
    );
  }

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Validate uniqueness of `userName` if it's being updated
  if (userName && userName !== user.userName) {
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      throw new ApiError(409, "Username is already taken");
    }
    user.userName = userName;
  }

  // Update fields if provided
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  // Save the updated user
  const updatedUser = await user.save();

  // Respond with the updated user data (excluding sensitive fields)
  const responseUser = await User.findById(updatedUser._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, responseUser, "User updated successfully"));
});

const sendOtpController = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  //   console.log("phone is", phone);

  // Validation
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required." });
  }

  // Send OTP
  const verification = await sendOtp(phone);
  // console.log("verfication is ", verification);

  res
    .status(200)
    .json(new ApiResponse(200, verification, "OTP sent successfully!"));
});

const loginWithOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    throw new ApiError(400, "Phone and OTP are required.");
  }
  const verificationCheck = await verifyOtp(phone, otp);

  if (verificationCheck.status !== "approved") {
    throw new ApiError(401, "Invalid OTP.");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
  const token = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("token", token, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          token,
        },
        "User logged In Successfully"
      )
    );
});

const getOnlineUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to check online users");
  }

  const onlineUsers = await User.find({ isOffline: false })
    .populate("subscribedSchemes")
    .populate("address");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        onlineUsers,
        onlineUsers.length > 0
          ? `Total ${onlineUsers.length} online users fetched successfully`
          : "No online users found"
      )
    );
});

const getOfflineUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to check offline users");
  }

  const offlineUsers = await User.find({ isOffline: true })
    .populate("subscribedSchemes")
    .populate("address");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        offlineUsers,
        offlineUsers.length > 0
          ? `Total ${offlineUsers.length} offline users fetched successfully`
          : "No offline users found"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  getAllUser,
  getReferredUsers,
  getReferrer,
  generateReferralCode,
  editUser,
  sendOtpController,
  loginWithOtp,
  registerUserOffline,
  getOnlineUsers,
  getOfflineUsers,
};
