import { getData } from "@/context/userContext";
import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY } from "@/constants/auth";
import { toast } from "sonner";

const AuthSuccess = () => {
  const { setUser } = getData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const accessToken = params.get("token");

      if (!accessToken) {
        toast.error("Authentication failed");
        navigate("/login", { replace: true });
        return;
      }

      // ✅ Save token (same key everywhere)
      localStorage.setItem(TOKEN_KEY, accessToken);

      try {
        const res = await axios.get("http://localhost:8000/auth/me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data?.success) {
          // ✅ Save user everywhere
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));

          toast.success("Login successful");
          navigate("/", { replace: true });
        } else {
          throw new Error("User fetch failed");
        }
      } catch (error) {
        console.error("Auth error:", error);
        localStorage.removeItem(TOKEN_KEY);
        toast.error("Authentication failed");
        navigate("/login", { replace: true });
      }
    };

    handleAuth();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
      Logging you in...
    </div>
  );
};

export default AuthSuccess;
