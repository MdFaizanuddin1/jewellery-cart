import { Router } from "express";
import { getPrice, setPrice } from "../controllers/goldSilverPrice.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router()

router.get ('/get',verifyJWT,getPrice);
router.post ('/set',verifyJWT,setPrice);

export default router;