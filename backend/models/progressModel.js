import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedChapters: [{ type: String }], // chapter _id strings
  },
  { timestamps: true },
);

const Progress =
  mongoose.models.Progress || mongoose.model("Progress", progressSchema);

export default Progress;
