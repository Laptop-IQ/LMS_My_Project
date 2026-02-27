import React, { useState, useEffect } from "react";
import { homeCoursesStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { Star, User, ArrowRight } from "lucide-react";
import { toast, ToastContainer, Slide } from "react-toastify";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = "https://online-course-n9hd.onrender.com";

const HomeCourses = () => {
  const navigate = useNavigate();
  const { title, course: courseFont, detail } = homeCoursesStyles.fonts;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSignedIn = !!localStorage.getItem(TOKEN_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

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
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/course/public`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch courses from server");
        }
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const items = (json && (json.items || json.courses || [])) || [];
        const mapped = items.map((c) => ({
          id: c._id || c.id,
          name: c.name,
          teacher: c.teacher,
          image: c.image,
          price: c.price || {
            original: c.price?.original,
            sale: c.price?.sale,
          },
          isFree:
            c.pricingType === "free" ||
            !c.price ||
            (c.price && !c.price.sale && !c.price.original),
          avgRating:
            typeof c.avgRating !== "undefined" ? c.avgRating : c.rating || 0,
          totalRatings:
            typeof c.totalRatings !== "undefined"
              ? c.totalRatings
              : c.ratingCount || 0,
          courseType: c.courseType || "regular",
        }));
        setCourses(mapped.slice(0, 8));
      })
      .catch((err) => {
        console.error("Failed to load courses", err);
        if (mounted) setError("Failed to load server");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const showLoginToast = () => {
    toast.error("Please login to access this course", {
      position: "top-right",
      transition: Slide,
      autoClose: 3000,
      theme: "dark",
    });
  };

  const handleCourseClick = (id) => {
    if (!token) {
      showLoginToast();
      return;
    }
    navigate(`/course/${id}`);
  };

  const handleBrowseClick = () => {
    if (!token) {
      toast.error("Please login to access courses", {
        position: "top-right",
        transition: Slide,
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    navigate("/courses");
  };

const submitRatingToServer = async (courseId, ratingValue, comment = "") => {
  if (!token) {
    showLoginToast(); // prompt login if not authenticated
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
        c.id === courseId
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

  const renderInteractiveStars = (course) => {
    const userRating = userRatings[course.id] || 0;
    const hover = hoverRatings[course.id] || 0;
    const baseDisplay = userRating || Math.round(course.avgRating || 0);
    const displayRating = hover || baseDisplay;

    return (
      <div
        className={homeCoursesStyles.starsContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={homeCoursesStyles.interactiveStars}>
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1;
            const filled = idx <= displayRating;

            return (
              <button
                key={i}
                aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
                onClick={(e) => handleSetRating(e, course.id, idx)}
                onMouseEnter={() =>
                  setHoverRatings((s) => ({ ...s, [course.id]: idx }))
                }
                onMouseLeave={() =>
                  setHoverRatings((s) => ({ ...s, [course.id]: 0 }))
                }
                className={`${homeCoursesStyles.starButton} ${
                  filled
                    ? homeCoursesStyles.starButtonActive
                    : homeCoursesStyles.starButtonInactive
                }`}
                style={{ background: "transparent" }}
              >
                <Star
                  size={16}
                  fill={filled ? "currentColor" : "none"}
                  stroke="currentColor"
                  className={homeCoursesStyles.starIcon}
                />
              </button>
            );
          })}
        </div>

        <div
          style={{
            marginLeft: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {(course.avgRating || 0).toFixed(1)}
          </span>
          <span style={{ color: "#6b7280", fontSize: 12 }}>
            ({course.totalRatings || 0})
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={homeCoursesStyles.container}>
        <div className={homeCoursesStyles.mainContainer}>
          <div className={homeCoursesStyles.header}>
            <h2 className={`${title} ${homeCoursesStyles.title}`}>
              <Star className={homeCoursesStyles.titleIcon} />
              Explore Top Courses
              <Star className={homeCoursesStyles.titleIcon} />
            </h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">Loading courses...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <div className={homeCoursesStyles.coursesGrid}>
              {courses.map((course) => {
                const isFree = !!course.isFree || !course.price;

                return (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course.id)}
                    className={homeCoursesStyles.courseCard}
                  >
                    <div className={homeCoursesStyles.imageContainer}>
                      <img
                        src={course.image}
                        alt={course.name}
                        className={homeCoursesStyles.courseImage}
                        loading="lazy"
                      />
                    </div>

                    <div className={homeCoursesStyles.courseInfo}>
                      <h3
                        className={`${courseFont} ${homeCoursesStyles.courseName}`}
                      >
                        {course.name}
                      </h3>

                      <div
                        className={`${detail} ${homeCoursesStyles.teacherInfo}`}
                      >
                        <User
                          size={15}
                          className={homeCoursesStyles.teacherIcon}
                        />
                        <span className={homeCoursesStyles.teacherName}>
                          {course.teacher}
                        </span>
                      </div>

                      <div className={homeCoursesStyles.ratingContainer}>
                        {renderInteractiveStars(course)}
                      </div>

                      <div className={homeCoursesStyles.pricingContainer}>
                        {isFree ? (
                          <span className={homeCoursesStyles.freePrice}>
                            Free
                          </span>
                        ) : (
                          <span className={homeCoursesStyles.price}>
                            ₹{course.price?.sale ?? course.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={homeCoursesStyles.ctaContainer}>
          <div className={homeCoursesStyles.ctaWrapper}>
            <div
              className={homeCoursesStyles.ctaGlow}
              style={{
                zIndex: 0,
                background:
                  "conic-gradient(from 0deg, rgba(236,72,153,0.9), rgba(99,102,241,0.9), rgba(139,92,246,0.9), rgba(236,72,153,0.9))",
                filter: "blur(5px)",
                opacity: 0.8,
              }}
            />
            <button
              onClick={handleBrowseClick}
              className={homeCoursesStyles.ctaButton}
            >
              <span className={homeCoursesStyles.ctaButtonContent}>
                <span className={homeCoursesStyles.ctaText}>
                  Discover Courses
                </span>
                <ArrowRight className={homeCoursesStyles.ctaIcon} />
              </span>
            </button>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        transition={Slide}
      />
    </>
  );
};

export default HomeCourses;
