import { Router } from "express";
import {
  createScheme,
  deleteAll,
  getAllSchemes,
  getScheme,
} from "../controllers/scheme.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.route("/create").post(upload.single("image"), verifyJWT, createScheme);
router.route("/delete").delete(verifyJWT, deleteAll);
router.route("/getScheme/:schemeId").get(getScheme);
router.route("/getAllSchemes").get(getAllSchemes);

export default router;
