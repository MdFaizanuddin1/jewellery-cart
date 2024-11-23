import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { Scheme } from "../models/schemes.model.js";
import { User } from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Use `fileURLToPath` to handle ES modules directory resolution
const __filename = fileURLToPath(import.meta.url);
// console.log('file name is ', __filename)
const __dirname = path.dirname(__filename);
// console.log('dirname is ', __dirname)

const createScheme = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const image = req.file;

  // console.log("thumbnail image is", image);

  const imageUrl = `${req.protocol}://${req.get("host")}/${image.filename}`;

  // console.log("image url is", imageUrl);
  // this line will store something like this ----- http://localhost:8000/image.jpg

  if (!imageUrl) {
    throw new ApiError(500, "Error while uploading thumbnailImg");
  }

  if (req.user.role != "admin") {
    throw new ApiError(400, "Only admin can create scheme");
  }
  const adminId = req.user._id;
  // console.log('id is',adminId)
  const admin = await User.findById(adminId);
  // console.log('admin is', admin)

  if (!admin) {
    throw new ApiError(404, "No admin was found in Db");
  }
  const scheme = await Scheme.create({
    name,
    description,
    thumbnailImg: imageUrl,
    createdBy: admin._id,
  });

  const createdScheme = await Scheme.findById(scheme._id);
  if (!createdScheme) {
    throw new ApiError(500, "Some thing went wrong while creating scheme");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdScheme, "Scheme created successfully"));
});

const deleteAll = asyncHandler(async (req, res) => {
  if (!req.user.role === "admin") {
    throw new ApiError(404, "only admin can delete the scheme");
  }

  // Retrieve all schemes created by the admin
  const schemes = await Scheme.find({ createdBy: req.user._id });

  if (!schemes.length) {
    throw new ApiError(404, "No schemes found with your admin ID");
  }

  // Delete the images associated with the schemes
  for (const scheme of schemes) {
    const imageUrl = scheme.thumbnailImg; // e.g., http://localhost:8000/uploads/image.jpg
    const imagePath = path.join(
      __dirname,
      "../../public/temp",
      path.basename(imageUrl),
    ); // Adjust path to 'uploads' folder
    // console.log(imagePath)

    try {
      fs.unlinkSync(imagePath); // Delete the file
      // console.log(`Deleted file: ${imagePath}`);
    } catch (err) {
      console.error(`Error deleting file: ${imagePath}`, err);
      throw new ApiError(500, `error deleting file , ${imagePath}`);
    }
  }

  // Delete the schemes
  const deleted = await Scheme.deleteMany({ createdBy: req.user._id });

  if (!deleted.deletedCount) {
    throw new ApiError(404, "No schemes found with your admin ID");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deleted.deletedCount,
        "All schemes and associated images deleted successfully",
      ),
    );
});

const getAllSchemes = asyncHandler(async (req, res) => {
  const schemes = await Scheme.find();
  if (!schemes || schemes.length == 0) {
    throw new ApiError(404, "No schemes found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, schemes, "All schemes fetched successfully"));
});

const getScheme = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw new ApiError(404, "No scheme found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, scheme, "Scheme fetched successfully"));
});

const deleteOne = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw new ApiError(404, "No scheme found");
  }

  if (req.user.role != "admin") {
    throw new ApiError(404, "you are not authorized to delete the scheme");
  }

  const imageUrl = scheme.thumbnailImg; // e.g., http://localhost:8000/uploads/image.jpg
  const imagePath = path.join(
    __dirname,
    "../../public/temp",
    path.basename(imageUrl),
  ); // Adjust path to 'uploads' folder
  // console.log(imagePath)

  try {
    fs.unlinkSync(imagePath); // Delete the file
    // console.log(`Deleted file: ${imagePath}`);
  } catch (err) {
    console.error(`Error deleting file: ${imagePath}`, err);
    throw new ApiError(500, `error deleting file , ${imagePath}`);
  }

  const deletedScheme = await Scheme.findByIdAndDelete(schemeId);
  if (deletedScheme.deletedCount < 0) {
    throw new ApiError(500, "Error while deleting the scheme");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedScheme, "scheme deleted successfully"));
});

const editScheme = asyncHandler(async (req, res) => {
  const { schemeId } = req.params;
  const { name, description ,schemeType} = req.body;
  const newImage = req.file; // New image if provided

  // Retrieve the existing scheme
  const scheme = await Scheme.findById(schemeId);
  if (!scheme) {
    throw new ApiError(404, "No scheme found with the given ID");
  }

  if (req.user.role != "admin") {
    throw new ApiError(403, "Only admin can edit the scheme");
  }

  let oldImagePath = null;
  if (newImage) {
    // If there is a new image, delete the old image
    const oldImageUrl = scheme.thumbnailImg; // e.g., http://localhost:8000/uploads/image.jpg
    oldImagePath = path.join(
      __dirname,
      "../../public/temp",
      path.basename(oldImageUrl),
    ); // Get old image file path

    // Delete the old image file
    try {
      fs.unlinkSync(oldImagePath); // Synchronously delete the old file
      console.log(`Deleted old image: ${oldImagePath}`);
    } catch (err) {
      console.error(`Error deleting old file: ${oldImagePath}`, err);
      throw new ApiError(500, `Error deleting the old image: ${oldImagePath}`);
    }

    // Generate new image URL
    const newImageUrl = `${req.protocol}://${req.get("host")}/${newImage.filename}`;
    scheme.thumbnailImg = newImageUrl; // Update the image URL in the scheme
  }

  // Update the scheme details
  scheme.name = name || scheme.name; // Update name if provided, else keep the old value
  scheme.description = description || scheme.description; // Update description if provided
  scheme.schemeType = schemeType || scheme.schemeType; 

  // Save the updated scheme
  const updatedScheme = await scheme.save();

  return res
    .status(200)
    .json(new ApiResponse(200, scheme, "Scheme updated successfully"));
});

export {
  createScheme,
  deleteAll,
  getScheme,
  getAllSchemes,
  deleteOne,
  editScheme,
};
