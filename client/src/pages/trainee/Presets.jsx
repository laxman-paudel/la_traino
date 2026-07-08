import { useState, useEffect } from "react";
import { fetchPresets, selectPreset } from "../../api/preset";
import { fetchMe } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Presets() {
  const { loginAction } = useAuth();
  const { addToast } = useToast();

  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    fetchPresets()
      .then((res) => setPresets(res.data.presets))
      .catch(() => setError("Failed to load presets"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(presetId) {
    setError("");
    setSuccess("");
    setSelecting(presetId);
    try {
      await selectPreset(presetId);
      const res = await fetchMe();
      const token = localStorage.getItem("token");
      loginAction(token, res.data.user);
      setSuccess("Preset selected successfully!");
      addToast("Preset selected successfully", "success");
      const updated = await fetchPresets();
      setPresets(updated.data.presets);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to select preset");
      addToast(err.response?.data?.error || "Failed to select preset", "error");
    } finally {
      setSelecting(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Workout Presets
        </h1>
        <p className="text-gray-500 mb-8">
          Choose a preset workout routine to follow.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm"
          >
            {success}
          </div>
        )}

        {presets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No workout presets available.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`bg-white rounded-2xl border-2 p-6 transition ${
                  preset.isSelected
                    ? "border-indigo-500 shadow-md"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {preset.name}
                  </h2>
                  {preset.isSelected && (
                    <StatusBadge variant="primary">Selected</StatusBadge>
                  )}
                </div>

                {preset.description && (
                  <p className="text-gray-500 text-sm mb-4">
                    {preset.description}
                  </p>
                )}

                <div className="text-sm text-gray-400 mb-5">
                  {preset.days.length}{" "}
                  {preset.days.length === 1 ? "workout day" : "workout days"}
                </div>

                {!preset.isSelected && (
                  <button
                    type="button"
                    onClick={() => handleSelect(preset.id)}
                    disabled={selecting === preset.id}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    {selecting === preset.id ? "Selecting..." : "Choose Preset"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
