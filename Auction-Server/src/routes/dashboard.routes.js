import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { apiLimiter } from "../middleware/rateLimiter.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(apiLimiter);
router.use(auth);

router.get("/", getDashboardStats);

export default router;
