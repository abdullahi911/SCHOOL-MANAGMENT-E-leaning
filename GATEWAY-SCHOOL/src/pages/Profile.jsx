import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";

const Profile = () => {
  const [profile, setProfile] = useState({
    full_name: "",
    avatar_url: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) setProfile(data);
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);

    // preview instantly
    setProfile(prev => ({
      ...prev,
      avatar_url: URL.createObjectURL(file)
    }));
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return profile.avatar_url;

    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `${userId}.${fileExt}`;

    await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();

    try {
      const avatar_url = await uploadAvatar(user.id);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          avatar_url
        })
        .eq("id", user.id);

      if (error) throw error;

      window.dispatchEvent(new Event("profileUpdated"));
      setMessage({ type: "success", text: "Profile updated successfully!" });

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Profile Settings
      </h1>

      {/* MESSAGE */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* AVATAR */}
        <div className="flex items-center gap-6">
          <img
            src={
              profile.avatar_url ||
              `https://ui-avatars.com/api/?name=${profile.full_name || "User"}`
            }
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow"
            alt="avatar"
          />

          <div>
            <p className="text-sm text-gray-500 mb-2">
              Upload new profile picture
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            value={profile.full_name || ""}
            onChange={(e) =>
              setProfile({ ...profile, full_name: e.target.value })
            }
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your name"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

      </form>
    </div>
  );
};

export default Profile;