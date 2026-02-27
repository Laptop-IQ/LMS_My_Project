import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { CheckCircle, Loader2, RotateCcw } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const VerifyOTP = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const { email } = useParams();
  const navigate = useNavigate();

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `http://localhost:8000/user/verify-otp/${email}`,
        {
          otp: finalOtp,
        },
      );
      setSuccessMessage(res.data.message);
      setIsVerified(true);
      setTimeout(() => {
        navigate(`/change-password/${email}`);
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const clearOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 bg-white rounded-xl shadow-lg p-10">
        {/* Left Illustration */}
        <div className="flex justify-center items-center">
          <VerifyOtpIllustration className="w-full max-w-sm" />
        </div>

        {/* Right Form */}
        <div className="flex flex-col justify-center max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            We've sent a 6-digit verification code to your email:{" "}
            <span className="font-semibold">{email}</span>
          </p>

          <Card className="shadow-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-yellow-500">
                Enter Verification Code
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                {isVerified
                  ? "Code verified successfully! Redirecting..."
                  : "Enter the 6-digit code sent to your email"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {successMessage && (
                <p className="text-green-600 text-center font-medium">
                  {successMessage}
                </p>
              )}

              {isVerified ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="bg-yellow-200 rounded-full p-3">
                    <CheckCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-yellow-700">
                    Verification Successful
                  </h3>
                  <p className="text-gray-700">
                    Your email has been verified. You will be redirected to
                    reset your password.
                  </p>
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    <span className="text-yellow-600 font-medium">
                      Redirecting...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-6">
                    {otp.map((digit, idx) => (
                      <Input
                        key={idx}
                        type="text"
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        maxLength={1}
                        ref={(el) => (inputRefs.current[idx] = el)}
                        className="w-14 h-14 text-center text-xl font-bold rounded-lg border border-gray-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300"
                      />
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={handleVerify}
                      disabled={isLoading || otp.some((d) => d === "")}
                      className="bg-yellow-400 hover:bg-yellow-500 w-full font-semibold text-white rounded-lg py-3"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Verifying
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearOtp}
                      disabled={isLoading || isVerified}
                      className="w-full rounded-lg border-yellow-400 text-yellow-600 hover:bg-yellow-100"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      Clear
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Wrong email?{" "}
                <Link
                  to="/forgot-password"
                  className="text-yellow-500 hover:underline font-semibold"
                >
                  Go back
                </Link>
              </p>
            </CardFooter>
          </Card>
          <p className="text-center text-xs text-gray-400 mt-4">
            For testing purposes, use code:{" "}
            <span className="font-mono font-semibold">123456</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;

// SVG Illustration Component for left side
const VerifyOtpIllustration = (props) => (
  <svg
    viewBox="0 0 480 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Phone Outline */}
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
