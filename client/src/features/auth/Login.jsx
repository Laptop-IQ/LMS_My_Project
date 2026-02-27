import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { getData } from "@/context/userContext";
import { TOKEN_KEY } from "@/constants/auth";

const Login = () => {
  const navigate = useNavigate();

  const context = getData();
  const setUser = context?.setUser;

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) navigate("/", { replace: true });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "https://lms-my-project-eak1.onrender.com/user/login",
        formData,
      );

      if (res.data?.success) {
        // 🔐 Store accessToken (important!)
        localStorage.setItem(TOKEN_KEY, res.data.accessToken); // ✅ use accessToken
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (setUser) setUser(res.data.user);

        toast.success("Login successful");
        navigate("/", { replace: true });
      } else {
        toast.error(res.data?.message || "Invalid login credentials");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Login failed. Try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6fb] flex items-center justify-center px-6">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-xl grid md:grid-cols-2 overflow-hidden">
        {/* LEFT */}
        <div className="hidden md:flex items-center justify-center bg-linear-to-br from-blue-100 to-cyan-400 p-10">
          <img
            src="/Thesis-amico.svg"
            alt="Login"
            className="w-full max-w-md"
          />
        </div>

        {/* RIGHT */}
        <div className="flex flex-col justify-center px-10 py-14">
          <h2 className="text-3xl font-bold text-teal-600 text-center mb-2">
            USER LOGIN
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Welcome back! Please login to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div>
              <Label>Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <p className="text-center text-sm">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-teal-600">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
