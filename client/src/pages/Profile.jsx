import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getProfile, updateProfile, uploadAvatar } from "../api/profile";
import PageHeader from "../components/PageHeader";

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-sm text-gray-900">{value || "\u2014"}</p>
    </div>
  );
}

function AvatarSection({ profileImage, name, onUpload }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      onUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  const src = preview || profileImage || null;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center">
          {src ? (
            <img src={src} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-indigo-500">
              {name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-indigo-700 transition cursor-pointer"
          aria-label="Change avatar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

export default function Profile() {
  const { user: authUser, loginAction } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    getProfile()
      .then((res) => {
        const u = res.data.user;
        setProfile(u);
        setForm({
          name: u.name || "",
          bio: u.bio || "",
          gender: u.gender || "",
          age: u.age || "",
          height: u.height || "",
          weight: u.weight || "",
          location: u.location || "",
          fitnessGoal: u.traineeProfile?.fitnessGoal || "",
        });
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.age) payload.age = Number(payload.age);
      if (payload.height) payload.height = Number(payload.height);
      if (payload.weight) payload.weight = Number(payload.weight);
      if (!payload.fitnessGoal) payload.fitnessGoal = undefined;
      if (!payload.gender) payload.gender = undefined;

      const res = await updateProfile(payload);
      setProfile(res.data.user);
      loginAction(localStorage.getItem("token"), { ...authUser, name: form.name });
      setEditing(false);
      addToast("Profile updated successfully", "success");
    } catch (err) {
      addToast(err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(image) {
    try {
      const res = await uploadAvatar(image);
      setProfile((prev) => ({ ...prev, profileImage: res.data.profileImage }));
      addToast("Avatar updated", "success");
    } catch {
      addToast("Failed to upload avatar", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Account Center" description="Manage your profile, avatar, and account settings" />

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <AvatarSection profileImage={profile.profileImage} name={profile.name} onUpload={handleAvatarUpload} />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                {profile.role === "TRAINER" ? "Trainer" : "Trainee"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
            <p className="text-gray-400 text-xs mt-1">Member since {memberSince}</p>
            <div className="mt-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <div className="flex-1 max-w-[200px] h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${profile.profileCompletion || 0}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-500">{profile.profileCompletion || 0}% complete</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="mt-4 px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition text-sm font-semibold shadow-sm cursor-pointer"
            >
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Information</h3>
        {editing ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" min="1" max="150" value={form.age} onChange={(e) => handleChange("age", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input type="number" min="0" step="0.1" value={form.height} onChange={(e) => handleChange("height", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input type="number" min="0" step="0.1" value={form.weight} onChange={(e) => handleChange("weight", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={form.location} onChange={(e) => handleChange("location", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm" placeholder="City, Country" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" placeholder="Tell us about yourself" />
            </div>
            {profile.role === "TRAINEE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
                <select value={form.fitnessGoal} onChange={(e) => handleChange("fitnessGoal", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                  <option value="">Select a goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm cursor-pointer">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-sm cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoField label="Full Name" value={profile.name} />
            <InfoField label="Email" value={profile.email} />
            {profile.bio && <div className="sm:col-span-2"><InfoField label="Bio" value={profile.bio} /></div>}
            {profile.gender && <InfoField label="Gender" value={profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)} />}
            {profile.age && <InfoField label="Age" value={String(profile.age)} />}
            {profile.height && <InfoField label="Height" value={`${profile.height} cm`} />}
            {profile.weight && <InfoField label="Weight" value={`${profile.weight} kg`} />}
            {profile.location && <InfoField label="Location" value={profile.location} />}
            {profile.traineeProfile?.fitnessGoal && (
              <InfoField label="Fitness Goal" value={profile.traineeProfile.fitnessGoal.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} />
            )}
          </div>
        )}
      </div>

      {profile.role === "TRAINER" && profile.trainerProfile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Trainer Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoField label="Trainer Code" value={profile.trainerProfile.trainerCode} />
            {profile.trainerProfile.specialties && <InfoField label="Specialization" value={profile.trainerProfile.specialties} />}
            {profile.trainerProfile.yearsExperience != null && <InfoField label="Years Experience" value={String(profile.trainerProfile.yearsExperience)} />}
          </div>
        </div>
      )}

      {profile.role === "TRAINEE" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Trainee Progress</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoField label="Linked Trainer" value={profile.linkedTrainer?.name || "Not linked"} />
            <InfoField label="Current Program" value={profile.traineeProfile?.selectedPreset?.name || "No program selected"} />
            <InfoField label="Workout Completion (30d)" value={`${profile.workoutCompletion || 0}%`} />
            <InfoField label="Diet Completion (30d)" value={`${profile.dietCompletion || 0}%`} />
          </div>
        </div>
      )}
    </div>
  );
}
