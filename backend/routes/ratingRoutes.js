import express from "express";
import { addOrUpdateRating } from "../controllers/rating.controller.js";
import { isAuthenticated } from "../middleware/userAuthenticated.js";

const router = express.Router();
console.log("✅ ratingRoutes.js loaded");

router.post("/rate", isAuthenticated, addOrUpdateRating);

export default router;
