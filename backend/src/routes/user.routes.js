import { Router } from "express";
import {
  changeCurrentPassword,
  editUser,
  generateReferralCode,
  getAllUser,
  getCurrentUser,
  getOfflineUsers,
  getOnlineUsers,
  getReferredUsers,
  getReferrer,
  loginUser,
  loginWithOtp,
  logoutUser,
  registerUser,
  registerUserOffline,
  sendOtpController,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";
import {
  getUserEarnings,
  getAllUserEarnings,
} from "../controllers/referredEarnings.controllers.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
//-------- secure routes
router.get("/logout", verifyJWT, logoutUser);
router.put("/changePassword", verifyJWT, changeCurrentPassword);
router.get("/getCurrUser", verifyJWT, getCurrentUser);
router.get("/getAllUser", verifyJWT, getAllUser);
router.get("/getReferredUsers", verifyJWT, getReferredUsers);
router.get("/getReferrer", verifyJWT, getReferrer);
router.get("/generateReferralCode", verifyJWT, generateReferralCode);
router.put("/edit", verifyJWT, editUser);
router.post("/sendOtp", sendOtpController);
router.post("/loginOtp", loginWithOtp);

// user referral earnings

router.get("/userEarning", verifyJWT, getUserEarnings);
router.get("/allUserEarning", verifyJWT, getAllUserEarnings);

// offline - online customers
router.post("/registerOffline", registerUserOffline);
router.get("/getAllOnlineUser", verifyJWT, getOnlineUsers);
router.get("/getAllOfflineUser", verifyJWT, getOfflineUsers);

export default router;
