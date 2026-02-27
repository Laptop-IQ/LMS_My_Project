import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post(
        "https://lms-my-project-eak1.onrender.com/user/register",
        formData,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/verify");
      }
    } catch (error) {
      toast.error("Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6fb] flex items-center justify-center px-6">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        {/* LEFT – Illustration */}
        <div className="hidden md:flex items-center justify-center bg-linear-to-br from-blue-50 to-cyan-400 p-10">
          <img
            src="/Learning-amico.svg"
            alt="Signup Illustration"
            className="w-full max-w-md"
          />
        </div>

        {/* RIGHT – Signup Form */}
        <div className="flex flex-col items-center justify-center px-10 py-14">
          <h2 className="text-3xl font-bold text-teal-600 mb-2">
            CREATE ACCOUNT
          </h2>

          <p className="text-gray-500 mb-8">
            Join us and start organizing your ideas
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            {/* Full Name */}
            <div>
              <Label className="text-sm text-gray-600">Full Name</Label>
              <Input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-2 h-12 w-full rounded-2xl px-5 bg-gray-50 border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="m@example.com"
                className="mt-2 h-12 w-full rounded-2xl px-5 bg-gray-50 border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label className="text-sm text-gray-600">Password</Label>
              <div className="relative mt-2">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="h-12 w-full rounded-2xl px-5 pr-12 bg-gray-50 border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            {/* Footer */}
            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
