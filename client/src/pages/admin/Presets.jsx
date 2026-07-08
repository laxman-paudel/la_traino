import { useState, useEffect } from "react";
import {
  getPresets,
  createPreset,
  updatePreset,
  deletePreset,
} from "../../api/admin";

export default function AdminPresets() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPresets()
      .then((res) => setPresets(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load presets"),
      )
      .finally(() => setLoading(false));
  }, []);

  function openAdd() {
    setForm({ name: "", description: "" });
    setModal("add");
  }

  function openEdit(preset) {
    setForm({ name: preset.name, description: preset.description || "" });
    setModal({ type: "edit", id: preset.id });
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    try {
      if (modal === "add") {
        const res = await createPreset({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setPresets((prev) => [...prev, res.data]);
      } else {
        const res = await updatePreset(modal.id, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        });
        setPresets((prev) =>
          prev.map((p) => (p.id === modal.id ? res.data : p)),
        );
      }
      setModal(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save preset");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this preset?")) return;
    try {
      await deletePreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete preset");
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Manage Presets</h1>
          <button
            type="button"
            onClick={openAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            + Add Preset
          </button>
        </div>
        <p className="text-gray-500 mb-8">
          Create, edit and delete preset workouts.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </div>
        )}

        {presets.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-gray-500">No presets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {preset.name}
                  </h3>
                  {preset.description && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {preset.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(preset)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(preset.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {modal === "add" ? "Add Preset" : "Edit Preset"}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
