import React, { useState, useEffect } from "react";
import apiClient from "../lib/apiClient";

interface ResetPasswordPageProps {
  onNavigate?: (path: string) => void;
}

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-white",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  onNavigate,
}) => {
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL: /reset-password?token=xxx
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.newPassword || form.newPassword.length < 6)
      e.newPassword = "Password must be at least 6 characters";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!token) {
      setServerError("Invalid or missing reset token. Please request a new link.");
      return;
    }
    setIsLoading(true);
    setServerError("");
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: form.newPassword,
      });
      setSuccess(true);
    } catch {
      setServerError("This link has expired or is invalid. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen pt-[72px] bg-cream px-5 py-16">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">Account Recovery</p>
          <h1 className="font-serif text-4xl font-light text-charcoal">
            Reset Password
          </h1>
          <p className="text-sm text-text-light mt-2">
            {success
              ? "Your password has been updated"
              : "Enter your new password below"}
          </p>
        </div>

        <div className="bg-white border border-cream-dark rounded-sm p-8 shadow-soft">
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="font-serif text-xl text-charcoal mb-2">
                  Password Updated
                </p>
                <p className="text-sm text-text-light">
                  Your password has been reset successfully. You can now
                  sign in with your new password.
                </p>
              </div>
              <button
                onClick={() => onNavigate?.("/login")}
                style={{ backgroundColor: "#800020" }}
                className="w-full py-4 text-white text-xs tracking-widest uppercase font-sans rounded-sm mt-2"
              >
                Sign In
              </button>
            </div>
          ) : (
            /* Form state */
            <div className="flex flex-col gap-4">
              {!token && (
                <div className="bg-amber-50 border border-amber-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-amber-700">
                    No reset token found. Please use the link from your
                    email or request a new one.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-widest uppercase text-text-mid">
                  New Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={form.newPassword}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, newPassword: e.target.value }));
                    setErrors((p) => ({ ...p, newPassword: "" }));
                  }}
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500">{errors.newPassword}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-widest uppercase text-text-mid">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className={inputClass}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }));
                    setErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  <p className="text-xs text-red-600">{serverError}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isLoading || !token}
                style={{ backgroundColor: "#800020" }}
                className="w-full py-4 text-white text-xs tracking-widest uppercase font-sans rounded-sm disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Resetting…
                  </span>
                ) : (
                  "Reset Password"
                )}
              </button>

              <button
                onClick={() => onNavigate?.("/forgot-password")}
                className="text-xs text-center text-text-light hover:text-maroon transition-colors mt-2"
              >
                Request a new reset link
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};