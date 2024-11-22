import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

import { User } from "../models/user.model.js";

const addPanAadhar = asyncHandler(async (req, res) => {
  const { pan, aadhar } = req.body;
  const { aadharImg, panImg } = req.files;
  //   console.log("req.files is", req.files);

  if (!pan || !aadhar) {
    throw new ApiError(400, "All fields are required");
  }
  const userId = req.user._id;
  if (!userId) {
    throw new ApiError(404, "you are not authorized");
  }

  const user = await User.findById(userId).select("-password");
  //   console.log(user)

  if (user.pan || user.aadhar) {
    throw new ApiError(400, "user already has pan and aadhar");
  }

  user.pan = pan;
  user.aadhar = aadhar;

  const aadharImgName1 = req.files?.aadharImg[0].filename;
  const aadharImgName2 = req.files?.aadharImg[1].filename;
  const panImg1 = req.files?.panImg[0].filename;
  const panImg2 = req.files?.panImg[1].filename;
  //   console.log(aadharImgName1, aadharImgName2, panImg1, panImg2);
  //   user.aadharImg = `${req.protocol}://${req.get("host")}/${image.filename}`
  const aadharImgName1Url = `${req.protocol}://${req.get("host")}/${aadharImgName1}`;
  const aadharImgName2Url = `${req.protocol}://${req.get("host")}/${aadharImgName2}`;
  const panImg1Url = `${req.protocol}://${req.get("host")}/${panImg1}`;
  const panImg2Url = `${req.protocol}://${req.get("host")}/${panImg2}`;

  //   console.log(aadharImgName1Url,aadharImgName2Url,panImg1Url,panImg2Url)

  if (
    [aadharImgName1Url, aadharImgName2Url, panImg1Url, panImg2Url].some(
      (ele) => ele.trim() === "",
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }
  user.panImg = []
  user.aadharImg =[]
  user.panImg.push(panImg1Url, panImg2Url);
  user.aadharImg.push(aadharImgName1Url, aadharImgName2Url);
  //   console.log(user)

  await user.save();
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "aadhar and pan details saved successfully"),
    );
});

const checkPanAadhar = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError(404, "you are not authorized");
  }

  const dbUser = await User.findById(user._id).select("-password");
  if (!dbUser) {
    throw new ApiError(400, "No user is found");
  }

  if (!dbUser.pan) {
    throw new ApiError(400, "No pan details found");
  }
  if (!dbUser.aadhar) {
    throw new ApiError(400, "No aadhar details found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        dbUser,
        "User has pan and address stored successfully",
      ),
    );
});

export { addPanAadhar, checkPanAadhar };
