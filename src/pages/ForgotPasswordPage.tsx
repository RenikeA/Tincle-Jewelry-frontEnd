import React, { useState } from "react";
import apiClient from "../lib/apiClient";

interface ForgotPasswordPageProps {
  onNavigate?: (path: string) => void;
}

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-white",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigate,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await apiClient.post("/auth/forgot-password", { email });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
            Forgot Password
          </h1>
          <p className="text-sm text-text-light mt-2">
            {sent
              ? "Check your inbox for a reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>
        </div>

        <div className="bg-white border border-cream-dark rounded-sm p-8 shadow-soft">
          {sent ? (
            /* Success state */
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-2xl">
                ✓
              </div>
              <div>
                <p className="font-serif text-xl text-charcoal mb-2">
                  Email Sent
                </p>
                <p className="text-sm text-text-light">
                  We sent a password reset link to{" "}
                  <span className="text-charcoal font-medium">{email}</span>.
                  Check your inbox and spam folder.
                </p>
              </div>
              <button
                onClick={() => onNavigate?.("/login")}
                style={{ backgroundColor: "#800020" }}
                className="w-full py-4 text-white text-xs tracking-widest uppercase font-sans rounded-sm mt-2"
              >
                Back to Sign In
              </button>
              <button
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="text-xs text-text-light hover:text-maroon transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            /* Form state */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-widest uppercase text-text-mid">
                  Email Address
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="adaeze@email.com"
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                />
                {error && (
                  <p className="text-xs text-red-500">{error}</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                style={{ backgroundColor: "#800020" }}
                className="w-full py-4 text-white text-xs tracking-widest uppercase font-sans rounded-sm disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending…
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <button
                onClick={() => onNavigate?.("/login")}
                className="text-xs text-center text-text-light hover:text-maroon transition-colors mt-2"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};