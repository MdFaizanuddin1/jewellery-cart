import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { addPanAadhar, checkPanAadhar } from "../controllers/panAadhar.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.post(
  "/add",
  verifyJWT
  ,
  upload.fields([
    { name: "panImg", maxCount: 2 },
    { name: "aadharImg", maxCount: 2 },
  ]),
  addPanAadhar,
);
router.route ('/check').get (verifyJWT,checkPanAadhar)

export default router;
