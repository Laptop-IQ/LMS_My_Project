import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Ek user ek course ko ek hi rating de
ratingSchema.index({ course: 1, user: 1 }, { unique: true });

const Rating = mongoose.models.Rating || mongoose.model("Rating", ratingSchema);

export default Rating;
