import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
import Course from "../models/courseModel.js";

export const updateCourseRatingStats = async (courseId) => {
  const stats = await Rating.aggregate([
    {
      $match: {
        course: new mongoose.Types.ObjectId(courseId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$course",
        avgRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        ratings: { $push: "$rating" },
      },
    },
  ]);

  if (!stats.length) {
    return Course.findByIdAndUpdate(courseId, {
      avgRating: 0,
      totalRatings: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  }

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  stats[0].ratings.forEach((r) => {
    distribution[r]++;
  });

  await Course.findByIdAndUpdate(courseId, {
    avgRating: stats[0].avgRating.toFixed(1),
    totalRatings: stats[0].totalRatings,
    ratingDistribution: distribution,
  });
};
