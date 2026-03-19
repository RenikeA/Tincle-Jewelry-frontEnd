import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";

type AuthMode = "login" | "register";

interface AuthPageProps {
  onNavigate?: (path: string) => void;
  initialMode?: AuthMode;
}

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-white",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

export const AuthPage: React.FC<AuthPageProps> = ({
  onNavigate,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
      clearError();
    };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Invalid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Password must be at least 6 characters";
    if (mode === "register") {
      if (!form.firstName.trim()) e.firstName = "First name is required";
      if (!form.lastName.trim()) e.lastName = "Last name is required";
      if (form.confirmPassword !== form.password)
        e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    let success = false;
    if (mode === "login") {
      success = await login({ email: form.email, password: form.password });
    } else {
      success = await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
    }
    if (success) onNavigate?.("/");
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    clearError();
  };

  return (
    <main className="min-h-screen pt-[72px] bg-cream px-5 py-16">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">
            {mode === "login" ? "Welcome Back" : "Join Us"}
          </p>
          <h1 className="font-serif text-4xl font-light text-charcoal">
            {mode === "login" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-sm text-text-light mt-2">
            {mode === "login"
              ? "Access your Tincle account"
              : "Begin your jewelry journey"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-cream-dark rounded-sm p-8 shadow-soft">
          {/* Mode tabs */}
          <div className="flex mb-8 border-b border-cream-dark">
            {(["login", "register"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={[
                  "flex-1 pb-3 text-xs tracking-widest uppercase font-sans transition-colors",
                  mode === m
                    ? "text-maroon border-b-2 border-maroon -mb-px"
                    : "text-text-light hover:text-charcoal",
                ].join(" ")}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          {/* Register fields */}
          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    First Name
                  </label>
                  <input
                    className={inputClass}
                    value={form.firstName}
                    onChange={set("firstName")}
                    placeholder="Adaeze"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    Last Name
                  </label>
                  <input
                    className={inputClass}
                    value={form.lastName}
                    onChange={set("lastName")}
                    placeholder="Okonkwo"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 mb-4">
                <label className="text-xs tracking-widest uppercase text-text-mid">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="08012345678"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs tracking-widest uppercase text-text-mid">
              Email
            </label>
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={set("email")}
              placeholder="adaeze@email.com"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 mb-4">
            <label className="text-xs tracking-widest uppercase text-text-mid">
              Password
            </label>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          {mode === "register" && (
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs tracking-widest uppercase text-text-mid">
                Confirm Password
              </label>
              <input
                type="password"
                className={inputClass}
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          )}

          {/* Server error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-sm px-4 py-3 mb-4">
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Forgot password */}
          {mode === "login" && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => onNavigate?.("/forgot-password")}
                className="text-xs text-text-light hover:text-maroon transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{ backgroundColor: "#800020" }}
            className="w-full py-4 text-white text-xs tracking-widest uppercase font-sans rounded-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {mode === "login" ? "Signing in…" : "Creating account…"}
              </span>
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          {/* Switch mode */}
          <p className="text-center text-xs text-text-light mt-6">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => switchMode("register")}
                  className="text-maroon hover:underline"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("login")}
                  className="text-maroon hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>

        {/* Trust */}
        <p className="text-center text-xs text-text-light mt-6">
          🔒 Your data is safe and encrypted
        </p>
      </div>
    </main>
  );
};