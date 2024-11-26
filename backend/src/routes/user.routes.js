import { Router } from "express";
import {
  changeCurrentPassword,
  editUser,
  generateReferralCode,
  getAllUser,
  getCurrentUser,
  getReferredUsers,
  getReferrer,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

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

export default router;
