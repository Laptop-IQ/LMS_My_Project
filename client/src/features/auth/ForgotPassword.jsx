import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post(
        `http://localhost:8000/user/forgot-password`,
        { email },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate(`/verify-otp/${email}`);
        setEmail("");
      }
    } catch (error) {
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 shadow-lg rounded-xl border border-gray-100 p-10 bg-gray-50">
        {/* Left Illustration */}
        <div className="flex justify-center items-center">
          <ForgotPasswordIllustration className="w-full max-w-sm" />
        </div>

        {/* Right Form */}
        <div className="flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Forgot Password?
          </h2>
          <p className="text-gray-600 mb-8">
            Enter your email address and we’ll send you instructions to reset
            your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md w-full">
            <div>
              <Label htmlFor="email" className="text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="emailaddress@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 rounded-lg bg-white border border-gray-300 focus:border-yellow-400 focus:ring-yellow-300"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg py-3"
            >
              {isLoading ? "Sending reset link..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

// SVG Illustration Component
const ForgotPasswordIllustration = (props) => (
  <svg
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Phone outline */}
    <rect x="160" y="40" width="160" height="280" rx="20" fill="#FBBF24" />
    <rect x="170" y="50" width="140" height="260" rx="12" fill="#fff" />
    {/* Top bar */}
    <rect x="170" y="50" width="140" height="40" rx="10" fill="#FBBF24" />
    {/* Text "PASSWORD" */}
    <text
      x="250"
      y="80"
      textAnchor="middle"
      fontSize="14"
      fontWeight="600"
      fontFamily="monospace"
      fill="#fff"
      letterSpacing="0.2em"
    >
      PASSWORD
    </text>
    {/* Lock icon */}
    <rect x="210" y="110" width="60" height="60" rx="12" fill="#FBBF24" />
    <rect x="230" y="130" width="20" height="30" rx="4" fill="#333" />
    <circle cx="260" cy="130" r="8" fill="#333" />
    {/* Text "Forgot Password?" */}
    <text
      x="250"
      y="190"
      textAnchor="middle"
      fontSize="12"
      fontWeight="500"
      fontFamily="monospace"
      fill="#111827"
    >
      Forgot Password?
    </text>
    {/* Email input placeholder */}
    <rect x="190" y="210" width="100" height="20" rx="4" fill="#E5E7EB" />
    <text
      x="240"
      y="225"
      textAnchor="middle"
      fontSize="10"
      fill="#9CA3AF"
      fontFamily="monospace"
    >
      @mailaddress@mail.com
    </text>
    {/* Reset Password button */}
    <rect x="190" y="240" width="100" height="30" rx="6" fill="#FBBF24" />
    <text
      x="240"
      y="260"
      textAnchor="middle"
      fontWeight="700"
      fontSize="14"
      fill="white"
      fontFamily="monospace"
    >
      Reset Password
    </text>
    {/* Dots */}
    <circle cx="230" cy="280" r="4" fill="#D1D5DB" />
    <circle cx="250" cy="280" r="4" fill="#FBBF24" />
    <circle cx="270" cy="280" r="4" fill="#D1D5DB" />

    {/* Person sitting */}
    <circle cx="90" cy="280" r="50" fill="#FBBF24" />
    <rect x="55" y="230" width="70" height="80" rx="25" fill="#1F2937" />
    <circle cx="75" cy="260" r="10" fill="#1F2937" />
    <circle cx="105" cy="260" r="10" fill="#1F2937" />
    <path
      d="M75 295 Q90 280 105 295"
      stroke="#000"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);
