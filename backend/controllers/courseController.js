import Course from "../models/courseModel.js";
import fs from 'fs';
import path from 'path';


// HELPER FUNCTION
const toNumber = (v, fallback = 0) => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const parseJSONSafe = (maybe) => {
  if (!maybe) return null;
  if (typeof maybe === "object") return maybe;
  try {
    return JSON.parse(maybe);
  } catch {
    return null;
  }
};
 
const computeDerivedFields = (courseObj) => {
  let totalCourseMinutes = 0;
  if (!Array.isArray(courseObj.lectures)) courseObj.lectures = [];

  courseObj.lectures = courseObj.lectures.map((lec) => {
    lec = { ...lec };
    lec.duration = lec.duration || {};
    lec.chapters = Array.isArray(lec.chapters) ? lec.chapters : [];

    // normalize chapter totals
    lec.chapters = lec.chapters.map((ch) => {
      ch = { ...ch };
      ch.duration = ch.duration || {};
      const chHours = toNumber(ch.duration.hours);
      const chMins = toNumber(ch.duration.minutes);
      ch.totalMinutes = ch.totalMinutes
        ? toNumber(ch.totalMinutes)
        : chHours * 60 + chMins;

      ch.duration.hours = chHours;
      ch.duration.minutes = chMins;
      ch.name = ch.name || "";
      ch.topic = ch.topic || "";
      ch.videoUrl = ch.videoUrl || "";

      return ch;
    });

    const lecHours = toNumber(lec.duration.hours);
    const lecMins = toNumber(lec.duration.minutes);
    const lectureOwnMinutes = lecHours * 60 + lecMins;
    const chaptersMinutes = lec.chapters.reduce(
      (s, c) => s + toNumber(c.totalMinutes, 0),
      0,
    );

    lec.totalMinutes = lectureOwnMinutes + chaptersMinutes;

    lec.duration.hours = lecHours;
    lec.duration.minutes = lecMins;

    totalCourseMinutes += lec.totalMinutes;
    lec.title = lec.title || "Untitled lecture";

    return lec;
  });

  courseObj.totalDuration = courseObj.totalDuration || {};
  courseObj.totalDuration.hours = Math.floor(totalCourseMinutes / 60);
  courseObj.totalDuration.minutes = totalCourseMinutes % 60;
  courseObj.totalLectures = Array.isArray(courseObj.lectures)
    ? courseObj.lectures.length
    : 0;

  return courseObj;
};

const makeImageAbsolute = (rawImage, req) => {
  if (!rawImage) return "";
  const image = String(rawImage || "");
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  if (image.startsWith("/")) {
    return `${req.protocol}://${req.get("host")}${image}`;
  }
  // if file stored as "uploads/filename" or just "filename"
  if (image.startsWith("uploads/")) {
    return `${req.protocol}://${req.get("host")}/${image}`;
  }
  return `${req.protocol}://${req.get("host")}/uploads/${image}`;
};

// to get public courses
export const getPublicCourses = async (req, res) => {
  try {
    const { home, type = 'all', limit } = req.query;
    let filter = {};

    if (home === 'true') {
      filter.courseType = 'top';
    } 
    else if (type === 'top') {
      filter.courseType = 'top';
    } 
    else if (type === 'regular') {
      filter.courseType = 'regular';
    }

    const q = Course.find(filter).sort({ createdAt: -1 });

    if (home === "true") {
      q.limit(Number(limit || 8));
    } else if (limit) {
      q.limit(Number(limit));
    }

    const courses = await q.lean();

    const mapped = courses.map((c) => {
      const imageUrl = makeImageAbsolute(c.image || "", req);
      return {
        ...c,
        image: imageUrl,
      }
    });

    return res.json({
      success: true,
      items: mapped,
    });

  } 
  catch (err) {
     console.error("GetPublicCourses", err);

     return res.status(500).json({
       success: false,
       error: "Server Error",
     });

  }
};


// get Courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 }).lean();
    const mapped = courses.map((c) => ({
      ...c,
      image: makeImageAbsolute(c.image || "", req)
    }));
    return res.json({
      success: true,
      courses: mapped
    });
  } 
  catch (err) {
     console.error("GetCourses error:", err);

     return res.status(500).json({
       success: false,
       error: "Server Error",
     });
   }
};


// get course by id
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course)
      return res.status(404).json({
        success: false,
        error: "Not found",
      });

    course.image = makeImageAbsolute(course.image || "", req);

    return res.json({
      success: true,
      course,
    });
  }
   catch (err) {
    console.error("GetCoursesById error:", err);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};

// to create a course
export const createCourse = async (req, res) => {
  try {
    const body = req.body || {};

    // image handling: store relative path so static serving works consistently
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : body.image || "";

    // parse price
    const priceParsed = parseJSONSafe(body.price) ?? (body.price || {});
    const price = {
      original: toNumber(priceParsed.original ?? body["price.original"] ?? 0),
      sale: toNumber(priceParsed.sale ?? body["price.sale"] ?? 0),
    };

    // lectures
    let lectures = parseJSONSafe(body.lectures) ?? body.lectures ?? [];
    if (!Array.isArray(lectures)) lectures = [];

    // normalize lectures & chapters
    lectures = lectures.map((lec) => {
      const lecture = { ...lec };
      lecture.duration = lecture.duration || {};
      lecture.duration.hours = toNumber(lecture.duration.hours);
      lecture.duration.minutes = toNumber(lecture.duration.minutes);

      lecture.chapters = Array.isArray(lecture.chapters)
        ? lecture.chapters
        : [];
      lecture.chapters = lecture.chapters.map((ch) => ({
        ...ch,
        duration: {
          hours: toNumber(ch.duration?.hours),
          minutes: toNumber(ch.duration?.minutes),
        },
        totalMinutes: toNumber(ch.totalMinutes, 0),
        videoUrl: ch.videoUrl || "",
        name: ch.name || "",
        topic: ch.topic || "",
      }));

      return {
        ...lecture,
        title: lecture.title || "Untitled lecture",
        totalMinutes: toNumber(lecture.totalMinutes, 0),
      };
    });

    const courseObj = {
      name: body.name || "",
      teacher: body.teacher || "",
      image: imagePath,
      rating: toNumber(body.rating, 0),
      pricingType: body.pricingType || "free",
      price,
      overview: body.overview || body.description || "",
      totalDuration: parseJSONSafe(body.totalDuration) ?? {
        hours: toNumber(body["totalDuration.hours"]),
        minutes: toNumber(body["totalDuration.minutes"]),
      },
      totalLectures: toNumber(body.totalLectures, lectures.length),
      lectures,
      courseType: body.courseType || "regular",
      category: body.category || null,
      createdBy: body.createdBy || null,
    };

    computeDerivedFields(courseObj);
    const course = new Course(courseObj);
    await course.save();

    const returned = course.toObject();
    returned.image = makeImageAbsolute(returned.image || "", req);

    return res.status(201).json({
      success: true,
      course: returned,
    });
  } 
  catch (err) {
    console.error("createCourse error:", err);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};


// to delete a course by id
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course)
      return res.status(404).json({
        success: false,
        error: "Not found",
      });

    // remove upload file from the local uploads folder

    try {
      if (course.image && !course.image.startsWith("http")) {
        const filePath = path.join(
          process.cwd(),
          course.image.startsWith("/") ? course.image.slice(1) : course.image,
        );

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (e) {
      // ignore any errors
    }

    await course.deleteOne();
    return res.json({
      success: true,
      message: "Course Deleted",
    });
  } 
  
  catch (err) {
    console.error("deleteCourse error:", err);

    return res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
};
