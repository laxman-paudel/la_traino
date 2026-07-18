import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { changePassword, getPreferences, updatePreferences } from "../api/profile";
import PageHeader from "../components/PageHeader";

const TABS = [
  { key: "security", label: "Security" },
  { key: "preferences", label: "Preferences" },
];

function Toggle({ label, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        id={id}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? "bg-indigo-600" : "bg-gray-200"
        }`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("security");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [preferences, setPreferences] = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "preferences") {
      setPrefsLoading(true);
      getPreferences()
        .then((res) => setPreferences(res.data.preferences))
        .catch(() => addToast("Failed to load preferences", "error"))
        .finally(() => setPrefsLoading(false));
    }
  }, [activeTab, addToast]);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast("Password updated successfully", "success");
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handlePrefToggle(key, value) {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    try {
      await updatePreferences({ [key]: value });
    } catch {
      setPreferences(preferences);
      addToast("Failed to update preference", "error");
    }
  }

  const isGoogleUser = user?.authProvider === "GOOGLE";

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Settings" description="Manage your account security and preferences" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                  activeTab === tab.key
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 lg:p-8">
          {activeTab === "security" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Password</h3>
              <p className="text-sm text-gray-500 mb-6">
                {isGoogleUser
                  ? "You signed up with Google and cannot change your password here."
                  : "Update your account password."}
              </p>

              {isGoogleUser ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  Your account uses Google authentication. Password management is handled by Google.
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                    />
                  </div>

                  {passwordError && (
                    <p className="text-sm text-red-600" role="alert">{passwordError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Preferences</h3>
              <p className="text-sm text-gray-500 mb-6">Customize your experience.</p>

              {prefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                </div>
              ) : preferences ? (
                <div className="divide-y divide-gray-100">
                  <div className="pb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notifications</p>
                    <Toggle label="Email notifications" checked={preferences.emailNotifications} onChange={(v) => handlePrefToggle("emailNotifications", v)} />
                    <Toggle label="Workout reminders" checked={preferences.workoutReminder} onChange={(v) => handlePrefToggle("workoutReminder", v)} />
                    <Toggle label="Diet reminders" checked={preferences.dietReminder} onChange={(v) => handlePrefToggle("dietReminder", v)} />
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Appearance</p>
                    <Toggle label="Dark mode (coming soon)" checked={preferences.theme === "dark"} onChange={(v) => handlePrefToggle("theme", v ? "dark" : "light")} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Failed to load preferences.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
