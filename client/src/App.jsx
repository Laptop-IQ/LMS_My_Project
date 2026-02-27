import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ArrowUp } from "lucide-react";


import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faculty from "./pages/Faculty";
import Courses from "./pages/Courses";
import CourseDetailPageHome from "./pages/CourseDetailPageHome";
import CourseDetailPage from "./pages/CourseDetailPage";
import Mycourse from "./pages/Mycourse";
import VerifyPaymentPage from "../VerifyPaymentPage";


import Signup from "@/features/auth/Signup";
import Login from "@/features/auth/Login";
import VerifyEmail from "@/features/auth/VerifyEmail";
import Verify from "@/features/auth/Verify";
import ForgotPassword from "@/features/auth/ForgotPassword";
import VerifyOTP from "@/features/auth/VerifyOTP";
import ChangePassword from "@/features/auth/ChangePassword";
import AuthSuccess from "@/features/auth/AuthSuccess";

/* -------------------- Protected Route -------------------- */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return Boolean(token);
  };

  if (!isAuthenticated()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

/* -------------------- Scroll To Top Button -------------------- */
const ScrollTopButton = ({ threshold = 200, showOnMount = false }) => {
  const [visible, setVisible] = useState(!showOnMount);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-6 bottom-6 z-50 p-2 rounded-full backdrop-blur-sm
                 border border-white/20 shadow-lg transition-transform"
    >
      <ArrowUp className="w-6 h-6 text-sky-600" />
    </button>
  );
};

/* -------------------- Scroll On Route Change -------------------- */
const ScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/* -------------------- App -------------------- */
const App = () => {
  return (
    <>
      <ScrollToTopOnRouteChange />

      <Routes>
        {/* 🏠 PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/mycourses" element={<Mycourse />} />

        {/* 🔐 AUTH */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/verify/:token" element={<Verify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp/:email" element={<VerifyOTP />} />
        <Route path="/change-password/:email" element={<ChangePassword />} />

        <Route
          path="/auth-success"
          element={
            <ProtectedRoute>
              <AuthSuccess />
            </ProtectedRoute>
          }
        />

        {/* 📘 COURSES */}
        <Route path="/course/:id" element={<CourseDetailPageHome />} />
        <Route path="/courses/:id" element={<CourseDetailPage />} />
        <Route path="/booking/success" element={<VerifyPaymentPage />} />
        <Route path="/booking/cancel" element={<VerifyPaymentPage />} />
      </Routes>

      <ScrollTopButton threshold={250} />
    </>
  );
};

export default App;
