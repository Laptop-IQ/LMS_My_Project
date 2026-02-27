import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, StarHalf, User, Search, X, SmilePlus } from "lucide-react";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  coursePageStyles,
  coursePageCustomStyles,
} from "../assets/dummyStyles";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = "https://projectbackend-theta.vercel.app";


const StarIcon = ({ filled = false, half = false, className = "" }) => {
  if (half) {
    return <StarHalf className={`w-4 h-4 ${className}`} fill="currentColor" />;
  }

  return (
    <Star
      className={`w-4 h-4 ${className}`}
      fill={filled ? "currentColor" : "none"}
    />
  );
};

const UserIcon = () => <User className={coursePageStyles.teacherIcon} />;
const SearchIcon = () => <Search className={coursePageStyles.searchIcon} />;

const RatingStars = ({
  courseId,
  userRating = 0,
  avgRating = 0,
  totalRatings = 0,
  onRate,
}) => {
  const [hover, setHover] = useState(0);
  const base = userRating || Math.round(avgRating || 0);
  const display = hover || base;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", gap: 6 }}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= display;
          return (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRate && onRate(courseId, idx);
              }}
              onMouseEnter={() => setHover(idx)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${idx} star${idx > 1 ? "s" : ""}`}
              style={{
                background: "transparent",
                border: "none",
                padding: 2,
                cursor: "pointer",
              }}
            >
              <StarIcon
                filled={filled}
                className={filled ? "text-yellow-400" : "text-gray-300"}
              />
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginLeft: 6 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          {(avgRating || 0).toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          ({totalRatings || 0})
        </div>
      </div>
    </div>
  );
};



const CoursePage = () => {
  const navigate = useNavigate();
  const isSignedIn = !!localStorage.getItem(TOKEN_KEY);

  const [ratings, setRatings] = useState(() => {
    try {
      const raw = localStorage.getItem("userCourseRatings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem("userCourseRatings", JSON.stringify(ratings));
    } catch {
      // ignore
    }
  }, [ratings]);

  // Fetch public courses
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/course/public`)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(txt || "Failed to fetch courses");
        }
        return res.json();
      })
      .then(async (json) => {
        if (!mounted) return;
        const raw = json.items || json.courses || [];
        // filter non-top (existing behavior)
        const regular = raw.filter((c) =>
          c.courseType ? c.courseType !== "top" : true,
        );

        const mapped = regular.map((c) => ({
          id: String(c._id || c.id || ""),
          name: c.name,
          teacher: c.teacher || c.instructor || "",
          category: c.category || "",
          image: c.image || "",
          isFree:
            c.pricingType === "free" ||
            !c.price ||
            (!c.price.sale && !c.price.original),
          price:
            c.price ||
            (c.originalPrice
              ? { original: c.originalPrice, sale: c.price }
              : {}),
          avgRating:
            typeof c.avgRating === "number"
              ? c.avgRating
              : typeof c.rating === "number"
                ? c.rating
                : parseFloat(c.rating) || 0,
          totalRatings:
            typeof c.totalRatings === "number"
              ? c.totalRatings
              : (c.ratingCount ?? 0),
          raw: c,
        }));

        setCourses(mapped);

        // if signed in, try to fetch my-rating per course (parallel)
        if (isSignedIn && mapped.length) {
          const promises = mapped.map(async (course) => {
            if (!course.id) return null;
            try {
          const headers = { "Content-Type": "application/json" };
              try {
          const token = localStorage.getItem(TOKEN_KEY);
                if (token) headers.Authorization = `Bearer ${token}`;
              } catch (e) {}
          const r = await fetch(
                `${API_BASE}/api/course/${course.id}/my-rating`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );
              if (!r.ok) return null;
          const d = await r.json().catch(() => null);
              if (d && d.success && d.myRating)
                return { courseId: course.id, rating: d.Rating.rating };
            } catch (err) {
              return null;
            }
            return null;
          });

          const results = await Promise.all(promises);
          const map = {};
          results.forEach((it) => {
            if (it && it.courseId) map[it.courseId] = it.rating;
          });
          if (mounted && Object.keys(map).length) {
            setRatings((prev) => ({ ...prev, ...map }));
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load courses:", err);
        if (mounted) setError(err.message || "Failed to load courses");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  // to send the rating to server
const submitRatingToServer = async (courseId, ratingValue, comment = "") => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    toast.error("Please sign in to submit the rating");
    return { success: false };
  }

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const res = await fetch(`${API_BASE}/api/ratings/rate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ courseId, rating: ratingValue, comment }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      if (res.status === 401) {
        toast.error("Access token is missing or invalid. Please login again.");
      }
      throw new Error(data.message || `Failed to rate (${res.status})`);
    }

    // Update courses with new avgRating / totalRatings
    const avg = data.avgRating ?? null;
    const total = data.totalRatings ?? null;

    if (avg !== null || total !== null) {
      setCourses((prev) =>
        prev.map((c) =>
          String(c.id) === String(courseId)
            ? {
                ...c,
                avgRating: avg ?? c.avgRating,
                totalRatings: total ?? c.totalRatings,
              }
            : c,
        ),
      );
    }

    // Save user's rating locally
    setRatings((prev) => ({ ...prev, [courseId]: ratingValue }));

    toast.success("Thanks for your rating!");
    return { success: true, avg, total };
  } catch (err) {
    console.error("submitRatingToServer:", err);
    toast.error(err.message || "Failed to submit rating");
    return { success: false, error: err };
  }
};


const handleRating = async (courseId, newRating, e) => {
  if (e && e.stopPropagation) {
    e.preventDefault();
    e.stopPropagation();
  }

  if (!isSignedIn) {
    toast.error("Please sign in to submit the rating");
    return;
  }

  // Optimistic UI update
  setRatings((prev) => ({ ...prev, [courseId]: newRating }));

  await submitRatingToServer(courseId, newRating);
};


  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const VISIBLE_COUNT = 8;
  const visibleCourses = showAll
    ? filteredCourses
    : filteredCourses.slice(0, VISIBLE_COUNT);

  const showLoginToast = () => {
    toast.error("Please login to access this course", {
      position: "top-right",
      transition: Slide,
      autoClose: 3000,
      theme: "dark",
    });
  };

  const openCourse = (courseId) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      showLoginToast();
      return;
    }

    navigate(`/courses/${courseId}`);
  };

  const isCourseFree = (course) => course.isFree || !course.price;

  const getPriceDisplay = (course) => {
    if (isCourseFree(course)) return "Free";
    const price = course.price || {};

    if (price.sale != null && price.sale !== 0) {
  return {
    current: `₹${price.sale}`,
    original:
      price.original && price.original > course.price.sale
        ? `₹${price.original}`
        : null,
  };
}

if (price.original != null) {
  return {
    current: `₹${price.original}`,
    original: null,
  };
}
    return "Free";
  };
  if (loading)
  return <div className="p-6 text-center">Loading courses...</div>;
if (error)
  return <div className="p-6 text-center text-red-500">{error}</div>;


  return (
    <div className={coursePageStyles.pageContainer}>
      <toast position="top-right" />
      <div className={coursePageStyles.headerContainer}>
        <div className={coursePageStyles.headerTransform}>
          <h1 className={coursePageStyles.headerTitle}>LEARN & GROW</h1>
        </div>
        <p className={coursePageStyles.headerSubtitle}>
          Master New Skills with Expert-Led Courses
        </p>

        <div className={coursePageStyles.searchContainer}>
          <div className={coursePageStyles.searchGradient} />
          <div className={coursePageStyles.searchInputContainer}>
            <div className={coursePageStyles.searchIconContainer}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search courses by name, instructor, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowAll(false);
              }}
              className={coursePageStyles.searchInput}
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowAll(false);
                }}
                className={coursePageStyles.clearButton}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {searchQuery && (
          <div className="text-center">
            <p className={coursePageStyles.resultsCount}>
              Found {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""} matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <div className={coursePageStyles.coursesGrid}>
        {filteredCourses.length === 0 ? (
          <div className={coursePageStyles.noCoursesContainer}>
            <SmilePlus className={coursePageStyles.noCoursesIcon} />
            <h3 className={coursePageStyles.noCoursesTitle}>
              No courses found
            </h3>
            <button
              onClick={() => {
                setSearchQuery("");
                setShowAll(false);
              }}
              className={coursePageStyles.noCoursesButton}
            >
              Show All Courses
            </button>
          </div>
        ) : (
          <div className={coursePageStyles.coursesGridContainer}>
            {visibleCourses.map((course, index) => {
              const userRating = ratings[course.id] || 0;
              const isFree = isCourseFree(course);
              const priceDisplay = getPriceDisplay(course);

              return (
                <div
                  key={course.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCourse(course.id)}
                  onKeyDown={(e) => e.key === "Enter" && openCourse(course.id)}
                  className={coursePageStyles.courseCard}
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className={coursePageStyles.courseCardInner}>
                    <div className={coursePageStyles.courseCardContent}>
                      <div className={coursePageStyles.courseImageContainer}>
                        <img
                          src={course.image}
                          alt={course.name}
                          className={coursePageStyles.courseImage}
                        />
                      </div>

                      <div className={coursePageStyles.courseInfo}>
                        <h3 className={coursePageStyles.courseName}>
                          {course.name}
                        </h3>

                        <div className={coursePageStyles.teacherContainer}>
                          <UserIcon />
                          <span className={coursePageStyles.teacherName}>
                            {course.teacher}
                          </span>
                        </div>

                        <div className={coursePageStyles.ratingContainer}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const filled = star <= userRating;
                            return (
                              <button
                                key={star}
                                onClick={(e) =>
                                  handleRating(course.id, star, e)
                                }
                                className={coursePageStyles.ratingStarButton}
                              >
                                <StarIcon
                                  filled={filled}
                                  className={
                                    filled ? "text-yellow-400" : "text-gray-300"
                                  }
                                />
                              </button>
                            );
                          })}
                        </div>
                        

                        <div className={coursePageStyles.priceContainer}>
                          {isFree ? (
                            <span className={coursePageStyles.priceFree}>
                              Free
                            </span>
                          ) : (
                            <>
                              <span className={coursePageStyles.priceCurrent}>
                                {priceDisplay.current}
                              </span>
                              {priceDisplay.original && (
                                <span
                                  className={coursePageStyles.priceOriginal}
                                >
                                  {priceDisplay.original}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ToastContainer />
      <style>{coursePageCustomStyles}</style>
    </div>
  );
};

export default CoursePage;
