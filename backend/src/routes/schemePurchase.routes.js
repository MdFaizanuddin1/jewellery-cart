import { Router } from "express";
import {
  getAllSubscribers,
  getSchemeSubscribers,
  getUserSubscribedSchemes,
  subscribe,
} from "../controllers/schemePurchase.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.post("/subscribe/:schemeId", verifyJWT, subscribe);
router.get("/getAllSubscribers", verifyJWT, getAllSubscribers);

// Get all subscribed schemes of a specific user
router.get("/user/subscribed-schemes", verifyJWT, getUserSubscribedSchemes);

// Get all subscribers of a specific scheme
router.get("/scheme/:schemeId", verifyJWT, getSchemeSubscribers);

export default router;
