import { Router } from "express";
import { getAllSubscribers, subscribe } from "../controllers/schemePurchase.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.post("/subscribe/:schemeId", verifyJWT, subscribe);
router.get("/getAllSubscribers", verifyJWT, getAllSubscribers);

export default router;
