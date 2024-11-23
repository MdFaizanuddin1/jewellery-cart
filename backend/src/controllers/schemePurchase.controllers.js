import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Scheme } from "../models/schemes.model.js";
import { User } from "../models/user.model.js";
import { SchemePurchase } from "../models/schemePurchase.model.js";

const subscribe = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const { amount, quantity } = req.body;
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
    quantity: quantity,
    purchasedBy: user._id,
    scheme: scheme._id,
  });

  const purchasedSchemeDb = await SchemePurchase.findById(purchasedScheme._id); // this is coming from db
  if (!purchasedSchemeDb) {
    throw new ApiError(500, "Error while purchasing scheme");
  }

  user.subscribedSchemes = purchasedSchemeDb._id;
  await user.save();

  scheme.subscribedBy.push(user._id);
  await scheme.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, purchasedSchemeDb, "scheme subscribed successfully"),
    );
});

const getAllSubscribers = asyncHandler(async (req, res) => {
  
});

export { subscribe, getAllSubscribers };
