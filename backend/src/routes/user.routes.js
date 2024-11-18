import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login",loginUser)
//-------- secure routes
router.get('/logout',verifyJWT, logoutUser)
router.put("/changePassword",verifyJWT,changeCurrentPassword)
router.get ("/getCurrUser",verifyJWT,getCurrentUser)

export default router;
 