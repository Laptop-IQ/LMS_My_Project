import express from "express";
import Progress from "../models/progressModel.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET completed chapters for a course
router.get("/completed", authMiddleware, async (req, res) => {
  const { courseId } = req.query;
  const userId = req.user.id;

  if (!courseId)
    return res
      .status(400)
      .json({ success: false, message: "courseId required" });

  try {
    const progress = await Progress.findOne({ userId, courseId });
    return res.json({
      success: true,
      completedChapters: progress?.completedChapters || [],
    });
  } catch (err) {
    console.error("Progress GET error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST mark/unmark chapter completion
router.post("/mark", authMiddleware, async (req, res) => {
  const { courseId, chapterId, completed } = req.body;
  const userId = req.user.id;

  if (!courseId || !chapterId) {
    return res
      .status(400)
      .json({ success: false, message: "courseId and chapterId required" });
  }

  try {
    let progress = await Progress.findOne({ userId, courseId });

    if (!progress) {
      progress = new Progress({ userId, courseId, completedChapters: [] });
    }

    if (completed) {
      if (!progress.completedChapters.includes(chapterId)) {
        progress.completedChapters.push(chapterId);
      }
    } else {
      progress.completedChapters = progress.completedChapters.filter(
        (id) => id !== chapterId,
      );
    }

    await progress.save();

    return res.json({
      success: true,
      completedChapters: progress.completedChapters,
    });
  } catch (err) {
    console.error("Progress POST error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
