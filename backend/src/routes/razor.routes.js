import { Router } from "express";
import { createOrder, verifyPay } from "../controllers/razor.controller.js";

const router = Router();

router.post("/create", createOrder);
router.post("/verify", verifyPay);

export default router;
