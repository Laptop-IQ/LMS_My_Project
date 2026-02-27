import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  getPublicCourses,
} from "../controllers/courseController.js";

import multer from "multer";
import path from "path";

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), "uploads")),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `course-${unique}${ext}`);
  },
});
const upload = multer({ storage });

const courseRouter = express.Router();

// --- PUBLIC ROUTES ---
courseRouter.get("/public", getPublicCourses);
courseRouter.get("/", getCourses);
courseRouter.get("/:id", getCourseById);

// --- ADMIN ROUTES ---
courseRouter.post("/", upload.single("image"), createCourse);
courseRouter.delete("/:id", deleteCourse);


export default courseRouter;
