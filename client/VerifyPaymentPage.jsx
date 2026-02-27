import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "@/constants/auth";

const API_BASE = "https://lms-my-project-eak1.onrender.com";


const VerifyPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const safeNavigate = (url) => {
      if (!cancelled) navigate(url, { replace: true });
    };

    const verifyAndRedirect = async () => {
      const params = new URLSearchParams(location.search);
      const session_id = params.get("session_id")?.trim();
      const payment_status = params.get("payment_status");

      if (payment_status === "cancel") {
        safeNavigate("/checkout");
        return;
      }

      if (!session_id) {
        safeNavigate("/mycourses?payment_status=Unpaid");
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        safeNavigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${API_BASE}/api/booking/confirm`, {
          params: { session_id },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000,
        });

        if (res?.data?.success) {
          safeNavigate("/mycourses?payment_status=Paid");
        } else {
          safeNavigate("/mycourses?payment_status=Unpaid");
        }
      } catch (err) {
        safeNavigate("/mycourses?payment_status=Unpaid");
      }
    };

    verifyAndRedirect();
    return () => {
      cancelled = true;
    };
  }, [location.search, navigate]);

  return null;
};

export default VerifyPaymentPage;
