import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Scheme } from "../models/schemes.model.js";
import { User } from "../models/user.model.js";
import { SchemePurchase } from "../models/schemePurchase.model.js";

const subscribe = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const { amount } = req.body;
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(404, "you are not authorized");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  if (!schemeId) {
    throw new ApiError(500, "No scheme id is provided");
  }
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw new ApiError(404, "No Scheme was found");
  }

  const purchasedScheme = await SchemePurchase.create({
    amount,
    purchasedBy: user._id,
    scheme: scheme._id,
  });

  const purchasedSchemeDb = await SchemePurchase.findById(purchasedScheme._id)
    .populate("purchasedBy", "_id userName email phone")
    .populate("scheme", "_id name"); // this is coming from db
  if (!purchasedSchemeDb) {
    throw new ApiError(500, "Error while purchasing scheme");
  }

  user.subscribedSchemes.push(purchasedSchemeDb._id);
  await user.save();

  scheme.subscribedBy.push(user._id);
  await scheme.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, purchasedSchemeDb, "scheme subscribed successfully")
    );
});

// const getAllSubscribers = asyncHandler(async (req, res) => {
//   const admin = await User.findById(req.user._id);

//   if (!admin) {
//     throw new ApiError(404, "admin not found");
//   }

//   if (admin.role != "admin") {
//     throw new ApiError(404, "You are not authorized");
//   }

//   // const schemes await Scheme.find().populate (subscribedBy");

//   const schemes = await Scheme.find();

//   // console.log('scheme is', schemes);

//   const subscribedBy = [];
//   schemes.map((scheme) =>
//     scheme.subscribedBy.map((ele) => subscribedBy.push(ele)),
//   );

//   // console.log("subscribedBy is", subscribedBy)
//   // " const subscribers = [];
//   // subscribedBy.map(async (ele) => {
//   // const user await User.findById(ele).select("-password");
//   // console.log('user is, user)
//   // subscribers.push (user)
//   // });
//   // console.log('subscribers is', subscribers)

//   let subscribers = [];
//   subscribers = await Promise.all(
//     subscribedBy.map(async (ele) => {
//       const user = await User.findById(ele).select("-password");

//       // console.log("Fetched user:", user); // Log each fetched user

//       return user;
//     }),
//   );

//   //console.log("All subscribers:", subscribers)

//   if (!subscribers) {
//     throw new ApiError(500, "No subscribers was found");
//   }

//   console.log("subs is", subscribers)

//   const idUserNameFromSubscribers = subscribers.map((ele) => {
//     return {
//       id: ele._id,

//       userName: ele.userName,

//       subscribedSchemes: ele.subscribedSchemes,
//     };
//   });

//   if (!idUserNameFromSubscribers) {
//     throw new ApiError(500, "Error while getting username and Id");
//   }
//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         idUserNameFromSubscribers,
//         `total ${subscribers.length} subscribers of all schemes found`,
//       ),
//     );
// });

const getAllSubscribers = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id);

  if (!admin) {
    throw new ApiError(404, "admin not found");
  }

  if (admin.role != "admin") {
    throw new ApiError(404, "You are not authorized");
  }
  const subscribers = await SchemePurchase.find()
    .populate("purchasedBy", "userName email phone")
    .populate("scheme", "name thumbnailImg schemeType");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers.length > 0 ? subscribers : {},
        subscribers.length > 0
          ? `total number of subscribers is ${subscribers.length}`
          : "No subscribers found"
      )
    );
});

const getUserSubscribedSchemes = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find the user and populate their subscribed schemes
  // const user = await User.findById(userId)
  //   .populate({
  //     path: "subscribedSchemes",
  //     populate: {
  //       path: "scheme", // Assuming `scheme` is a field in the `SchemePurchase` model
  //       select: "name description", // Include scheme-specific fields
  //     },
  //   })
  //   .select("fullName email subscribedSchemes");

  const user = await User.findById(userId)
    .populate({
      path: "subscribedSchemes",
      select: "amount nextDueDate createdAt", // Include nextDueDate and other fields from SchemePurchase
      populate: {
        path: "scheme", // Populate the scheme details
        select: "name description", // Include specific fields from the Scheme model
      },
    })
    .select("fullName email subscribedSchemes approved"); // Include basic user details

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.subscribedSchemes ? {schemes : user.subscribedSchemes, user} : {},
        user.subscribedSchemes.length > 0
          ? `Total Subscribed schemes is ${user.subscribedSchemes.length} retrieved successfully`
          : "user is not subscribed to any schemes"
      )
    );
});

const getSchemeSubscribers = asyncHandler(async (req, res) => {
  const { schemeId } = req.params; // Assuming schemeId is passed as a route parameter

  if (req.user.role != "admin") {
    throw new ApiError(404, "only admin can access");
  }

  // Find the scheme and populate its subscribers
  const scheme = await Scheme.findById(schemeId)
    .populate({
      path: "subscribedBy", // Assuming `subscribedBy` is the field in the `Scheme` model
      select: "_id fullName userName email phone", // Include user-specific fields
    })
    .select("name description subscribedBy");

  if (!scheme) {
    throw new ApiError(404, "Scheme not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        scheme.subscribedBy,
        scheme.subscribedBy.length > 0
          ? `Subscribers retrieved successfully total ${scheme.subscribedBy.length} subscribers`
          : "No subscribers found"
      )
    );
});

export {
  subscribe,
  getAllSubscribers,
  getUserSubscribedSchemes,
  getSchemeSubscribers,
};
