import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  addPanAadhar,
  approveUser,
  checkPanAadhar,
  getApprovalRequests,
} from "../controllers/panAadhar.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.post(
  "/add",
  verifyJWT,
  upload.fields([
    { name: "panImg", maxCount: 2 },
    { name: "aadharImg", maxCount: 2 },
  ]),
  addPanAadhar,
);
router.route("/check").get(verifyJWT, checkPanAadhar);

router.get("/approval-requests", verifyJWT, getApprovalRequests);
router.post("/approve-user", verifyJWT, approveUser);

export default router;
