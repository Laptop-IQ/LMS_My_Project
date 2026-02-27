import express from "express";
import {
  createBooking,
  getBookings,
  getStats,
  getUserBookings,
  checkBooking,
  confirmPayment,
} from "../controllers/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const bookingRouter = express.Router();

// Public routes
bookingRouter.get("/", getBookings);
bookingRouter.get("/stats", getStats);
bookingRouter.get("/check", authMiddleware, checkBooking);
bookingRouter.get("/confirm", confirmPayment);

// Protected routes
bookingRouter.post("/create", authMiddleware, createBooking);
bookingRouter.get("/my", authMiddleware, getUserBookings);


export default bookingRouter;
