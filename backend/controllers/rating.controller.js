import Rating from "../models/rating.model.js";
import Course from "../models/courseModel.js"; // assuming you have a Course model
import asyncHandler from "../utils/asyncHandler.js";

export const addOrUpdateRating = asyncHandler(async (req, res) => {
  const { courseId, rating, comment } = req.body;
  const userId = req.userId; // set by isAuthenticated middleware

  if (!courseId || !rating) {
    return res
      .status(400)
      .json({ success: false, message: "courseId and rating are required" });
  }

  // Check if rating exists
  let existing = await Rating.findOne({ course: courseId, user: userId });

  if (existing) {
    existing.rating = rating;
    existing.comment = comment || existing.comment;
    existing.isDeleted = false;
    await existing.save();
  } else {
    await Rating.create({ course: courseId, user: userId, rating, comment });
  }

  // Recalculate course stats
  const ratings = await Rating.find({ course: courseId, isDeleted: false });
  const totalRatings = ratings.length;
  const avgRating =
    totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  await Course.findByIdAndUpdate(courseId, { avgRating, totalRatings });

  res.status(200).json({
    success: true,
    message: "Rating saved successfully",
    avgRating,
    totalRatings,
  });
});
