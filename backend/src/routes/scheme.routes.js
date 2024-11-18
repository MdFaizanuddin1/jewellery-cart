import { Router } from "express";
import {
  createScheme,
  deleteAll,
  deleteOne,
  getAllSchemes,
  getScheme,
} from "../controllers/scheme.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.route("/create").post(upload.single("image"), verifyJWT, createScheme);
router.route("/deleteAll").delete(verifyJWT, deleteAll);
router.route("/delete/:schemeId").delete(verifyJWT, deleteOne);
router.route("/getScheme/:schemeId").get(getScheme);
router.route("/getAllSchemes").get(getAllSchemes);

export default router;
