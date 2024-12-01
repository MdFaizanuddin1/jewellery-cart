import { Router } from "express";
import { getPrice } from "../controllers/goldSilverPrice.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router()

router.get ('/get',verifyJWT,getPrice);

export default router;