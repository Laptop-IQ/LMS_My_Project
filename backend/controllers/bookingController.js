import Booking from "../models/bookingModel.js";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const FRONTEND_URL = process.env.FRONTEND_URL;

const stripe = STRIPE_KEY
  ? new Stripe(STRIPE_KEY, { apiVersion: "2023-10-16" })
  : null;

// HELPERS
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const genBookingId = () => `BK-${uuidv4()}`;

function buildFrontendBase(req) {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, "");
  const origin = req.get("origin");
  if (origin) return origin.replace(/\/$/, "");
  const host = req.get("host");
  if (host) return `${req.protocol || "http"}://${host}`.replace(/\/$/, "");
  return null;
}

// ------------------- Get User Bookings -------------------
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return res.status(200).json({
      success: true,
      enrolled: bookings.length > 0,
      bookings,
    });
  } catch (err) {
    console.error("getUserBookings ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ------------------- Get All Bookings -------------------
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).lean().exec();

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("getBookings error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ------------------- Check Booking -------------------
export const checkBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(200)
        .json({ success: true, enrolled: false, booking: null });

    const { courseId } = req.query;
    if (!courseId)
      return res
        .status(400)
        .json({ success: false, message: "CourseId required" });

    const booking = await Booking.findOne({ course: courseId, userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!booking)
      return res
        .status(200)
        .json({ success: true, enrolled: false, booking: null });

    const paid =
      booking.paymentStatus?.toLowerCase() === "paid" ||
      booking.orderStatus?.toLowerCase() === "confirmed" ||
      Boolean(booking.paidAt);

    return res.status(200).json({ success: true, enrolled: paid, booking });
  } catch (err) {
    console.error("checkBooking error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ------------------- Create Booking -------------------
export const createBooking = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const {
      courseId,
      courseName,
      teacherName = "",
      price,
      notes = "",
      email,
      studentName,
    } = req.body;

    if (!courseId || !courseName)
      return res
        .status(400)
        .json({ success: false, message: "courseId and courseName required" });

    const numericPrice = safeNumber(price);
    if (numericPrice === null || numericPrice < 0)
      return res
        .status(400)
        .json({ success: false, message: "price must be a valid number" });

    // ------------------- Prevent Duplicate Booking -------------------
    const existingBooking = await Booking.findOne({ userId, course: courseId });
    if (existingBooking) {
      const isPaid =
        existingBooking.paymentStatus?.toLowerCase() === "paid" ||
        existingBooking.orderStatus?.toLowerCase() === "confirmed" ||
        Boolean(existingBooking.paidAt);

      return res.status(200).json({
        success: true,
        message: isPaid
          ? "Booking already exists and confirmed"
          : "Booking exists — payment pending",
        booking: existingBooking,
      });
    }

    const bookingId = genBookingId();
    const resolvedStudentName =
      (studentName && String(studentName).trim()) ||
      (email && String(email).trim()) ||
      `User-${String(userId).slice(0, 8)}`;

    const basePayload = {
      bookingId,
      userId,
      studentName: resolvedStudentName,
      course: courseId,
      courseName,
      teacherName,
      price: numericPrice,
      paymentMethod: "Online",
      paymentStatus: "Unpaid",
      notes,
      orderStatus: "Pending",
      createdAt: new Date(),
    };

    // ------------------- Free Course -------------------
    if (numericPrice === 0) {
      const booking = await Booking.create({
        ...basePayload,
        paymentStatus: "Paid",
        orderStatus: "Confirmed",
        paidAt: new Date(),
      });
      return res
        .status(201)
        .json({ success: true, booking, checkoutUrl: null });
    }

    // ------------------- Paid Course: Stripe -------------------
    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured on server" });

    const base = buildFrontendBase(req);
    if (!base)
      return res.status(500).json({
        success: false,
        message:
          "Frontend URL not determined. Set FRONTEND_URL or send an Origin header.",
      });

    const successUrl = `${base}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/booking/cancel`;

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: { name: courseName },
              unit_amount: Math.round(numericPrice * 100),
            },
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          bookingId,
          courseId,
          userId,
          studentName: resolvedStudentName,
        },
      });
    } catch (stripeErr) {
      console.error("Stripe create session error:", stripeErr);
      const message =
        stripeErr?.raw?.message || stripeErr?.message || "Stripe error";
      return res
        .status(502)
        .json({
          success: false,
          message: `Payment provider error: ${message}`,
        });
    }

    try {
      const booking = await Booking.create({
        ...basePayload,
        sessionId: session.id,
        paymentIntentId: session.payment_intent || null,
      });
      return res
        .status(201)
        .json({ success: true, booking, checkoutUrl: session.url || null });
    } catch (dbErr) {
      console.error("DB error saving booking after stripe session:", dbErr);
      return res
        .status(500)
        .json({ success: false, message: "Failed to create booking record" });
    }
  } catch (err) {
    console.error("createBooking unexpected:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Confirm Payment -------------------
export const confirmPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });

    const { session_id } = req.query;
    if (!session_id)
      return res
        .status(400)
        .json({ success: false, message: "session_id is required" });

    if (!stripe)
      return res
        .status(500)
        .json({ success: false, message: "Stripe not configured" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session)
      return res
        .status(400)
        .json({ success: false, message: "Invalid session" });

    if (session.payment_status !== "paid")
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });

    let booking = await Booking.findOneAndUpdate(
      { sessionId: session_id },
      {
        paymentStatus: "Paid",
        paymentIntentId: session.payment_intent || null,
        orderStatus: "Confirmed",
        paidAt: new Date(),
      },
      { new: true },
    );

    if (!booking && session.metadata?.bookingId) {
      booking = await Booking.findOneAndUpdate(
        { bookingId: session.metadata.bookingId },
        {
          paymentStatus: "Paid",
          paymentIntentId: session.payment_intent || null,
          orderStatus: "Confirmed",
          paidAt: new Date(),
        },
        { new: true },
      );
    }

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    return res.json({ success: true, booking });
  } catch (err) {
    console.error("confirmPayment:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ------------------- Get Stats -------------------
export const getStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const totalRevenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].total) || 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const bookingsLast7Days = await Booking.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const topCourses = await Booking.aggregate([
      {
        $group: {
          _id: "$courseName",
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { courseName: "$_id", count: 1, revenue: 1, _id: 0 } },
    ]);

    return res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        bookingsLast7Days,
        topCourses,
      },
    });
  } catch (err) {
    console.error("getStats:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
