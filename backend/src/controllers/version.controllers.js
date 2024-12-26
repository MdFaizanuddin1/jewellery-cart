import { Version } from "../models/version.model.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import semver from 'semver' // Install this library for semantic version comparison

const getVersion = asyncHandler(async (req, res) => {
  const latestVersion = await Version.findOne().sort({ createdAt: -1 });
  if (!latestVersion) {
    return res.status(404).json(new ApiResponse(404, null, "No version found"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, latestVersion, "Latest version fetched successfully")
    );
});

const setVersion = asyncHandler(async (req, res) => {
  const { version } = req.body;

  // Check if the user is an admin
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You are not authorized to set the version");
  }

  // Find the latest version
  const latestVersion = await Version.findOne().sort({ createdAt: -1 });

  // If a version already exists, compare it
  if (latestVersion && semver.lte(version, latestVersion.version)) {
    throw new ApiError(
      400,
      `Provided version (${version}) must be greater than the latest version (${latestVersion.version})`
    );
  }

  // Save the new version
  const newVersion = new Version({ version });
  const savedVersion = await newVersion.save();

  if (!savedVersion) {
    throw new ApiError(500, "Something went wrong while setting the version");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, savedVersion, "Version changed successfully"));
});

export { getVersion, setVersion };
