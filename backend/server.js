import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./database/db.js";
import "./config/passport.js";
import ratingRoutes from "./routes/ratingRoutes.js";

/* ROUTES */
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import courseRouter from "./routes/courseRouter.js";
import bookingRouter from "./routes/bookingRouter.js";
import progressRoutes from "./routes/progressRoutes.js";



const app = express();
const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use("/uploads", express.static("uploads"));

app.use(
  cors({
    origin: ["https://lms-client-1q2c.onrender.com", "https://lms-my-project.onrender.com"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/* ROUTES */
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/api/course", courseRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/auth", userRoute);
app.use("/api/ratings", ratingRoutes);
app.use("/api/progress", progressRoutes);


app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error("❌ DB connection failed", err));
