import { Router } from "express";
import {
  addAddress,
  checkUserHasAddress,
  deleteAddress,
  editSingleAddress,
  getAllAddress,
  getSingleAddress,
} from "../controllers/address.controller.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.route("/addAddress").post(verifyJWT, addAddress);
router.route("/getAllAddress").get(verifyJWT, getAllAddress);
router.route("/getSingleAddress/:addressId").get(getSingleAddress);
router.route("/editSingleAddress/:addressId").put(verifyJWT, editSingleAddress);
router.route("/deleteAddress/:addressId").delete(verifyJWT, deleteAddress);
router.route("/hasAddress").get(verifyJWT, checkUserHasAddress);

export default router;
