import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ChangePassword = () => {
  const { email } = useParams();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.post(
        `http://localhost:8000/user/change-password/${email}`,
        {
          newPassword,
          confirmPassword,
        },
      );

      setSuccess(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Change Password
        </h2>
        <p className="text-center text-gray-600">
          Set a new password for{" "}
          <span className="font-semibold text-yellow-600">{email}</span>
        </p>

        {error && (
          <p className="text-red-500 text-center font-medium bg-red-100 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-center font-medium bg-green-100 p-2 rounded">
            {success}
          </p>
        )}

        <div className="space-y-5">
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-yellow-400 focus:ring-yellow-300"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-yellow-400 focus:ring-yellow-300"
          />
          <Button
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold rounded-lg py-3"
            disabled={isLoading}
            onClick={handleChangePassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Changing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
