import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import mongoose from "mongoose";
import { Address } from "../models/Address.model.js";
import { User } from "../models/user.model.js";

const addAddress = asyncHandler(async (req, res) => {
  //   const { userId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "User id is not valid");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { name, phone, address, pinCode, city, state, country } = req.body;

  if (
    [name, phone, address, pinCode, city, state, country].some(
      (field) => field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const savedAddress = await Address.create({
    name,
    phone,
    address,
    pinCode,
    city,
    state,
    country,
    user: user._id,
  });

  if (!savedAddress) {
    throw new ApiError(500, "Error while saving the address");
  }

  user.address.push(savedAddress._id);
  user.save();

  return res
    .status(200)
    .send(new ApiResponse(200, savedAddress, "Address saved successfully"));
});

const getAllAddress = asyncHandler(async (req, res) => {
  //   const { userId } = req.params;

  const userId = req.user._id;

  // Validate userId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(404, "Invalid User ID");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch all addresses for the user
  const addresses = await Address.find({ user: userId });

  // If no addresses are found, return an empty array
  if (!addresses || addresses.length === 0) {
    throw new ApiError(404, "No addresses found for this user");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});
const getSingleAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  // Check if the addressId is valid
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  // Find the address by ID
  //   const address = await Address.findById(addressId).populate("user").select("-password");
  const address = await Address.findById(addressId).populate({
    path: "user",
    select: "-password", // Exclude password from the user document
  });

  // If no address is found, throw an error
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // If address is found, return it with success message
  return res
    .status(200)
    .send(new ApiResponse(200, address, "Address fetched successfully"));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "You are not authorized");
  }

  // Validate addressId
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  const address = await Address.findById(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  if (address.user.toString() !== user._id.toString()) {
    throw new ApiError(404, "user id is not matching with address user id");
  }

  // Delete address by ID
  const addressDeleted = await Address.findByIdAndDelete(addressId);

  if (!addressDeleted) {
    throw new ApiError(404, "Address not found");
  }

  user.address = user.address.filter(
    (addrId) => addrId.toString() !== addressId
  );
  await user.save();

  return res
    .status(200)
    .send(new ApiResponse(200, addressDeleted, "Address deleted successfully"));
});

const editSingleAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  //   const { userId } = req.body; // if you need to check ownership
  const userId = req.user._id;

  // Validate addressId
  if (!mongoose.Types.ObjectId.isValid(addressId)) {
    throw new ApiError(404, "Invalid Address ID");
  }

  // Find the address to ensure it exists
  const address = await Address.findById(addressId);
  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  // Optional: Ensure the address belongs to the current user
  if (address.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You do not have permission to edit this address");
  }

  // Update only the fields that are provided in the request body
  const updatedFields = {};
  if (req.body.name) updatedFields.name = req.body.name;
  if (req.body.phone) updatedFields.phone = req.body.phone;
  if (req.body.address) updatedFields.address = req.body.address;
  if (req.body.pinCode) updatedFields.pinCode = req.body.pinCode;
  if (req.body.city) updatedFields.city = req.body.city;
  if (req.body.state) updatedFields.state = req.body.state;
  if (req.body.country) updatedFields.country = req.body.country;

  // Update the address with only the provided fields
  const updatedAddress = await Address.findByIdAndUpdate(
    addressId,
    { $set: updatedFields }, // Only update the fields that were passed
    { new: true, runValidators: true } // Return the updated document
  );

  if (!updatedAddress) {
    throw new ApiError(500, "Error while updating the address");
  }

  return res
    .status(200)
    .send(new ApiResponse(200, updatedAddress, "Address updated successfully"));
});

const checkUserHasAddress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(404, "user id not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const addresses = await Address.find({ user: user._id });
  if (!addresses || addresses.length === 0) {
    throw new ApiError(400, "No address found in database");
  }
  return res
    .status(200)
    .send(
      new ApiResponse(
        200,
        addresses,
        `addresses fetched successfully, user has ${addresses.length} in Db`
      )
    );
});

export {
  addAddress,
  getAllAddress,
  getSingleAddress,
  editSingleAddress,
  deleteAddress,
  checkUserHasAddress,
};
