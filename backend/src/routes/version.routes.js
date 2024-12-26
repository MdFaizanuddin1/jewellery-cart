import { Router } from "express";
import { getVersion, setVersion } from "../controllers/version.controllers.js";
import { verifyJWT } from "../middlewares/userAuth.middlewares.js";

const router = Router();

router.get("/get", getVersion);
router.post("/set", verifyJWT, setVersion);

export default router;
