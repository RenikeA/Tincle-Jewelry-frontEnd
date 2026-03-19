import React, { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { UserService } from "../lib/api";
import { useUIStore } from "../store/uiStore";

interface AccountPageProps {
  onNavigate?: (path: string) => void;
}

const inputClass = [
  "w-full border border-cream-dark rounded-sm px-4 py-3",
  "text-sm font-sans text-charcoal bg-transparent",
  "focus:outline-none focus:border-maroon transition-colors",
  "placeholder:text-text-light",
].join(" ");

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const addToast = useUIStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "addresses"
  >("profile");

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen pt-[72px] bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl text-charcoal mb-2">
            Sign in to view your account
          </p>
          <button
            onClick={() => onNavigate?.("/login")}
            className="text-xs tracking-widest uppercase bg-maroon text-white px-8 py-3 hover:bg-maroon-dark transition-colors rounded-sm mt-4"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      await UserService.updateProfile(profileForm);
      addToast({ type: "success", message: "Profile updated successfully" });
    } catch {
      addToast({ type: "error", message: "Failed to update profile" });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async () => {
    const e: Record<string, string> = {};
    if (!passwordForm.currentPassword) e.currentPassword = "Required";
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6)
      e.newPassword = "At least 6 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setPasswordErrors(e);
    if (Object.keys(e).length > 0) return;

    setPasswordLoading(true);
    try {
      await UserService.changePassword(passwordForm);
      addToast({ type: "success", message: "Password changed successfully" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      addToast({ type: "error", message: "Current password is incorrect" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate?.("/");
  };

  const quickLinks = [
    {
      label: "Order History",
      desc: "Track and manage your orders",
      icon: "◻",
      path: "/orders",
    },
    {
      label: "Wishlist",
      desc: "Pieces you have saved",
      icon: "♡",
      path: "/wishlist",
    },
    {
      label: "Shop",
      desc: "Browse our collections",
      icon: "◇",
      path: "/shop",
    },
  ];

  return (
    <main className="min-h-screen pt-[72px] bg-cream">
      <div className="max-w-4xl mx-auto px-5 md:px-10 py-12">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="eyebrow mb-2">My Account</p>
            <h1 className="font-serif text-4xl font-light text-charcoal">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-text-light mt-1">{user.email}</p>
            {user.role === "ADMIN" && (
              <button
                onClick={() => onNavigate?.("/admin")}
                className="mt-3 text-xs tracking-widest uppercase bg-charcoal text-cream px-4 py-2 rounded-sm hover:bg-maroon transition-colors"
              >
                Admin Panel →
              </button>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-xs tracking-widest uppercase border border-cream-dark text-text-mid px-5 py-2.5 rounded-sm hover:border-red-400 hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {quickLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => onNavigate?.(link.path)}
              className="bg-white border border-cream-dark rounded-sm p-5 text-left hover:border-maroon hover:shadow-soft transition-all duration-300 group"
            >
              <span className="text-2xl text-maroon/30 group-hover:text-maroon/60 transition-colors">
                {link.icon}
              </span>
              <p className="font-serif text-lg text-charcoal mt-3 mb-1">
                {link.label}
              </p>
              <p className="text-xs text-text-light">{link.desc}</p>
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="bg-white border border-cream-dark rounded-sm">
          {/* Tabs */}
          <div className="flex border-b border-cream-dark">
            {(
              [
                { key: "profile", label: "Profile" },
                { key: "password", label: "Password" },
              ] as { key: typeof activeTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "px-6 py-4 text-xs tracking-widest uppercase font-sans transition-colors",
                  activeTab === tab.key
                    ? "text-maroon border-b-2 border-maroon -mb-px"
                    : "text-text-light hover:text-charcoal",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Profile tab */}
            {activeTab === "profile" && (
              <div className="flex flex-col gap-5 max-w-lg">
                <h2 className="font-serif text-xl text-charcoal">
                  Personal Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs tracking-widest uppercase text-text-mid">
                      First Name
                    </label>
                    <input
                      className={inputClass}
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder="John"
                      aria-label="First Name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs tracking-widest uppercase text-text-mid">
                      Last Name
                    </label>
                    <input
                      className={inputClass}
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm((p) => ({
                          ...p,
                          lastName: e.target.value,
                        }))
                      }
                      placeholder="Doe"
                      aria-label="Last Name"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    Email
                  </label>
                  <input
                    className={[inputClass, "opacity-60 cursor-not-allowed"].join(" ")}
                    value={user.email}
                    disabled
                    aria-label="Email"
                  />
                  <p className="text-xs text-text-light">
                    Email cannot be changed
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    Phone
                  </label>
                  <input
                    className={inputClass}
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm((p) => ({
                        ...p,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="08012345678"
                  />
                </div>
                <button
                  onClick={handleProfileSave}
                  disabled={profileLoading}
                  className="w-fit px-8 py-3 bg-maroon text-white text-xs tracking-widest uppercase font-sans hover:bg-maroon-dark transition-colors rounded-sm disabled:opacity-50"
                >
                  {profileLoading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}

            {/* Password tab */}
            {activeTab === "password" && (
              <div className="flex flex-col gap-5 max-w-lg">
                <h2 className="font-serif text-xl text-charcoal">
                  Change Password
                </h2>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    Current Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    New Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs tracking-widest uppercase text-text-mid">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
                <button
                  onClick={handlePasswordSave}
                  disabled={passwordLoading}
                  className="w-fit px-8 py-3 bg-maroon text-white text-xs tracking-widest uppercase font-sans hover:bg-maroon-dark transition-colors rounded-sm disabled:opacity-50"
                >
                  {passwordLoading ? "Saving…" : "Update Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};