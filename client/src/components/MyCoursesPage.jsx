import React, { useEffect, useState } from "react";
import { myCoursesStyles, myCoursesCustomStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { TOKEN_KEY } from "@/constants/auth";
import { Star, User, Play, } from "lucide-react";



const API_BASE = "https://online-course-n9hd.onrender.com";

const MyCoursesPage = () => {
  const navigate = useNavigate();
  const isSignedIn = !!localStorage.getItem(TOKEN_KEY);
  const token = localStorage.getItem(TOKEN_KEY);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRatings, setUserRatings] = useState(() => {
    try {
      const raw = localStorage.getItem("userCourseRatings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [hoverRatings, setHoverRatings] = useState({});

  useEffect(() => {
    try {
      localStorage.setItem("userCourseRatings", JSON.stringify(userRatings));
    } catch {}
  }, [userRatings]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchMyCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // If user isn't signed in, don't call the protected endpoint.
        if (!isSignedIn) {
          if (mounted) {
            setCourses([]);
            setLoading(false);
          }
          return;
        }
        // Prepare headers and attempt to include Clerk token
        const headers = { "Content-Type": "application/json" };
        try {
          const token = localStorage.getItem(TOKEN_KEY);
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch (e) {
          // ignore token acquisition failure; server will respond 401
        }
        const bookingsRes = await fetch(`${API_BASE}/api/booking/my`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
          headers,
        });

        // explicit handling for unauthorized
        if (bookingsRes.status === 401) {
          throw new Error(
            "Unauthorized — please sign in to view your bookings.",
          );
        }

        if (!bookingsRes.ok) {
          const text = await bookingsRes.text().catch(() => "");
          throw new Error(
            text || `Failed to fetch bookings (${bookingsRes.status})`,
          );
        }

        const bookingsJson = await bookingsRes.json();
        if (!bookingsJson || bookingsJson.success === false) {
          throw new Error(
            (bookingsJson && bookingsJson.message) || "Failed to load bookings",
          );
        }
        const bookings = bookingsJson.bookings || [];
        // (the rest of your logic is unchanged — fetch courses for each booking)
        const combined = await Promise.all(
          bookings.map(async (b) => {
            const courseId = b.course ?? b.courseId ?? null;
            if (!courseId) return null;

            try {
              const cHeaders = { "Content-Type": "application/json" };
              try {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) cHeaders.Authorization = `Bearer ${token}`;
              } catch (e) {}

              const courseRes = await fetch(
                `${API_BASE}/api/course/${courseId}`,
                {
                  method: "GET",
                  credentials: "include",
                  signal: controller.signal,
                  headers: cHeaders,
                },
              );

              if (!courseRes.ok) {
                console.warn(
                  `Course ${courseId} not available (status ${courseRes.status}). Skipping booking.`,
                );
                return null;
              }

              const courseJson = await courseRes.json().catch(() => null);
              if (!courseJson || !courseJson.success || !courseJson.course) {
                console.warn(
                  `Course ${courseId} response invalid; skipping booking.`,
                );
                return null;
              }

              const courseData = courseJson.course;

              return {
                booking: b,
                course: {
                  ...courseData,
                  image: courseData.image || null,
                  avgRating:
                    typeof courseData.avgRating !== "undefined"
                      ? courseData.avgRating
                      : (courseData.rating ?? 0),
                  totalRatings:
                    typeof courseData.totalRatings !== "undefined"
                      ? courseData.totalRatings
                      : (courseData.ratingCount ?? 0),
                },
              };
            } catch (err) {
              if (controller.signal.aborted) return null;
              console.warn("Course fetch error for", courseId, err);
              return null;
            }
          }),
        );

        if (!mounted) return;
        const valid = combined.filter(Boolean);
        const uiCourses = valid.map(({ booking, course }) => ({
          booking,
          id: course.id ?? course.id ?? booking.course ?? booking.courseId,
          name: course.name ?? booking.courseName ?? "Untitled Course",
          teacher: course.teacher ?? booking.teacherName ?? "",
          image: course.image ?? null,
          avgRating: course.avgRating ?? 0,
          totalRatings: course.totalRatings ?? 0,
          isFree: !!(
            course.pricingType === "free" ||
            !course.price ||
            (course.price.sale == null && course.price.original == null) ||
            (course.price &&
              (course.price.sale === 0 || course.price.original === 0))
          ),
          price: course.price ?? {
            original: booking.price ?? 0,
            sale: booking.price ?? 0,
          },
          overview: course.overview ?? "",
          lectures: course.lectures ?? [],
          rawCourse: course,
          rawBooking: booking,
        }));
        setCourses(uiCourses);
        // fetch user's per-course rating (unchanged)
        if (isSignedIn && uiCourses.length > 0) {
          const ratingPromises = uiCourses.map(async (c) => {
            if (!c._id) return null;
            try {
              const rHeaders = { "Content-Type": "application/json" };
              try {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) rHeaders.Authorization = `Bearer ${token}`;
              } catch (e) {}
              const res = await fetch(`${API_BASE}/api/ratings/rate`, {
                method: "POST",
                headers: rHeaders,
                credentials: "include",
              });
              const data = await res.json().catch(() => null);
              if (res.ok && data && data.success && data.myRating) {
                return { courseId: c._id, myRating: data.myRating.rating };
              }
            } catch (err) {}
            return null;
          });

          const results = await Promise.all(ratingPromises);
          const ratingsMap = {};
          results.forEach((r) => {
            if (r && r.courseId) ratingsMap[r.courseId] = r.myRating;
          });
          if (mounted && Object.keys(ratingsMap).length) {
            setUserRatings((prev) => ({ ...prev, ...ratingsMap }));
          }
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load your courses");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchMyCourses();
    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // Helper: optimistic submit rating to server
const submitRatingToServer = async (courseId, ratingValue, comment = "") => {
  if (!token) {
    toast.error("Please login to rate this course.");
    return { success: false };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // must be valid JWT
    };

    const res = await fetch(`${API_BASE}/api/ratings/rate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ courseId, rating: ratingValue, comment }),
    });

    const data = await res.json().catch(() => ({ success: false }));

    if (!res.ok || !data.success) {
      throw new Error(
        data.message || `Failed to submit rating (${res.status})`,
      );
    }

    // Update courses state
    setCourses((prev) =>
      prev.map((c) =>
        c._id === courseId
          ? { ...c, avgRating: data.avgRating, totalRatings: data.totalRatings }
          : c,
      ),
    );

    // Update user's rating
    setUserRatings((prev) => ({ ...prev, [courseId]: ratingValue }));

    toast.success("Thanks for your rating!");
    return { success: true, avg: data.avgRating, total: data.totalRatings };
  } catch (err) {
    console.error("submitRatingToServer:", err);
    toast.error(err.message || "Failed to submit rating");
    return { success: false, error: err };
  }
};

  const handleSetRating = async (e, courseId, rating) => {
    e.stopPropagation();
    if (!isSignedIn) {
      toast("Please sign in to submit a rating...", { icon: "⭐" });
      return;
    }
    setUserRatings((prev) => ({ ...prev, [courseId]: rating }));
    await submitRatingToServer(courseId, rating);
  };

  const handleViewCourse = (courseId) => {
    if (!courseId) return;
    navigate(`/course/${courseId}`);
  };

  // for stars
  const renderInteractiveStars = (c) => {
    const userRating = userRatings[c.id] || 0;
    const hover = hoverRatings[c.id] || 0;
    const baseDisplay = userRating || Math.round(c.avgRating || 0);
    const displayRating = hover || baseDisplay;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ display: "flex", gap: 4, alignItems: "center" }}
        >
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            const filled = idx <= displayRating;
            return (
              <button
                key={i}
                aria-label={`Rate ${idx} stars`}
                onClick={(e) => handleSetRating(e, c.id, idx)}
                onMouseEnter={() =>
                  setHoverRatings((s) => ({ ...s, [c._id]: idx }))
                }
                onMouseLeave={() =>
                  setHoverRatings((s) => ({ ...s, [c._id]: 0 }))
                }
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 2,
                  cursor: "pointer",
                }}
              >
                <Star
                  size={16}
                  fill={filled ? "currentColor" : "none"}
                  stroke="currentColor"
                  style={{
                    color: filled ? "#f59e0b" : "#d1d5db",
                  }}
                />
              </button>
            );
          })}
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", marginLeft: 6 }}
        >
          <div style={{ fontWeight: 700, fontSize: 13 }}>
            {(c.avgRating || 0).toFixed(1)}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            ({c.totalRatings || 0})
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={myCoursesStyles.pageContainer}>
        <div className={myCoursesStyles.mainContainer}>
          <h1 className={myCoursesStyles.header}>My Courses...</h1>
          <p className={myCoursesStyles.emptyText}>Loading your courses...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className={myCoursesStyles.pageContainer}>
        <div className={myCoursesStyles.mainContainer}>
          <h1 className={myCoursesStyles.header}>My Courses...</h1>
          <p className={myCoursesStyles.emptyText} style={{ color: "red" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }
  if (!courses || courses.length === 0) {
    return (
      <div className={myCoursesStyles.pageContainer}>
        <div className={myCoursesStyles.mainContainer}>
          <h1 className={myCoursesStyles.header}>My Courses</h1>
          <p className={myCoursesStyles.emptyText}>
            You haven't purchased any courses yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={myCoursesStyles.pageContainer}>
      <div className={myCoursesStyles.mainContainer}>
        <h1 className={myCoursesStyles.header}>My Courses</h1>

        <div className={myCoursesStyles.grid}>
          {courses.map((course, index) => (
            <div
              key={course.id ?? index}
              className={myCoursesStyles.courseCard}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`,
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleViewCourse(course.id);
              }}
              onClick={() => handleViewCourse(course.id)}
            >
              <div className={myCoursesStyles.imageContainer}>
                <img
                  src={course.image || undefined}
                  alt={course.name}
                  className={myCoursesStyles.courseImage}
                />
              </div>
              <div className={myCoursesStyles.courseContent}>
                <h3 className={myCoursesStyles.courseName}>{course.name}</h3>
                <div className={myCoursesStyles.teacherContainer}>
                  <User className={myCoursesStyles.teacherIcon} />
                  <span className={myCoursesStyles.teacherText}>
                    {course.teacher}
                  </span>
                </div>
                <div className={myCoursesStyles.infoContainer}>
                  <div className={myCoursesStyles.ratingContainer}>
                    {renderInteractiveStars(course)}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewCourse(course.id);
                  }}
                  className={myCoursesStyles.viewButton}
                >
                  <Play className={myCoursesStyles.buttonIcon} />
                  <span>View Course</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{myCoursesCustomStyles}</style>
    </div>
  );
};

export default MyCoursesPage;
