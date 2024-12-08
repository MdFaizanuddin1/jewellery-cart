import { SchemePurchase } from "../models/schemePurchase.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getUserEarnings = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming user is authenticated
  const date = 10; // Custom date for earnings calculation

  const currentDate = new Date();
  let startOfRange, endOfRange;

  if (currentDate.getDate() < date) {
    const previousMonth =
      currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
    const previousYear =
      currentDate.getMonth() === 0
        ? currentDate.getFullYear() - 1
        : currentDate.getFullYear();

    startOfRange = new Date(previousYear, previousMonth, date);
    endOfRange = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date - 1
    );
  } else {
    const nextMonth =
      currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1;
    const nextYear =
      currentDate.getMonth() === 11
        ? currentDate.getFullYear() + 1
        : currentDate.getFullYear();

    startOfRange = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      date
    );
    endOfRange = new Date(nextYear, nextMonth, date - 1);
  }

  // Get referred users from the `referredUsers` field
  const user = await User.findById(userId).populate("referredUsers");
  const referredUserIds = user.referredUsers.map((user) => user._id);

  // Get purchases by referred users where commission is not yet calculated
  const purchases = await SchemePurchase.find({
    purchasedBy: { $in: referredUserIds },
    commissionCalculated: false, // Only include uncalculated purchases
  }).populate("scheme");

  let monthlyEarnings = user.referralEarnings.monthlyEarnings || 0;
  let totalEarnings = user.referralEarnings.totalEarnings || 0;

  // Calculate monthly and total earnings
  purchases.forEach((purchase) => {
    const commission =
      (purchase.amount * purchase.scheme.rewardPercentage) / 100;

    monthlyEarnings += commission;
    totalEarnings += commission;
  });

  // Update user's referral earnings
  await User.findByIdAndUpdate(
    userId,
    {
      "referralEarnings.monthlyEarnings": monthlyEarnings,
      "referralEarnings.totalEarnings": totalEarnings,
    },
    { new: true }
  );

  // Mark purchases as commission calculated
  await SchemePurchase.updateMany(
    { _id: { $in: purchases.map((p) => p._id) } },
    { commissionCalculated: true }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        monthlyEarnings,
        totalEarnings,
        range: {
          startOfRange,
          endOfRange,
        },
      },
      "Earnings calculated and updated successfully"
    )
  );
});

const getAllUserEarnings = asyncHandler(async (req, res) => {
  // Check for admin access
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin access");
  }

  // Fetch all users from the database
  const allUsers = await User.find();

  if (!allUsers || allUsers.length === 0) {
    throw new ApiError(400, "No earnings found");
  }

  const earningsReport = (
    await Promise.all(
      allUsers.map(async (user) => {
        if (user.referredUsers.length === 0) {
          return null; // Skip users with no referred users
        }
        const referredUsers = await User.find({
          _id: { $in: user.referredUsers },
        }).select("userName phone email subscribedSchemes");

        return {
          userId: user._id,
          userName: user.userName,
          phone: user.phone,
          email: user.email,
          referredUsers: referredUsers.map((refUser) => ({
            userName: refUser.userName,
            phone: refUser.phone,
            email: refUser.email,
            subscribed: refUser.subscribedSchemes,
          })),
          monthlyEarnings: user.referralEarnings.monthlyEarnings || 0,
          totalEarnings: user.referralEarnings.totalEarnings || 0,
        };
      })
    )
  ).filter(Boolean); // Remove null entries from the array

  if (earningsReport.length === 0) {
    throw new ApiError(404, "No earnings found");
  }

  // Send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        earningsReport,
        "All user earnings fetched successfully"
      )
    );
});


export { getUserEarnings, getAllUserEarnings };
