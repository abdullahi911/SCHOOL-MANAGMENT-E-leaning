import React, { useState, useEffect } from "react";
import supabase from "../lib/supabase";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: "", avatar_at: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        navigate("/signin");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error(profileError);
        setError("Could not load profile");
      } else if (profileData) {
        setProfile({
          full_name: profileData.full_name || "",
          avatar_at: profileData.avatar_at || ""
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [navigate]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      // Local preview immediately
      setProfile({ ...profile, avatar_at: URL.createObjectURL(file) });
    }
  };

  const uploadAvatar = async (userId) => {
    if (!avatarFile) return profile.avatar_at;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile);

    if (uploadError) {
      throw new Error(`Avatar upload failed: ${uploadError.message}. Make sure the 'avatars' storage bucket is created in Supabase.`);
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) return;

    try {
      let finalAvatarUrl = profile.avatar_at;
      
      // Upload file if one was selected
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(user.id);
      }

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      let updateError;
      
      if (existingProfile) {
        // Update existing
        const { error } = await supabase
          .from("profiles")
          .update({
            full_name: profile.full_name,
            avatar_at: finalAvatarUrl
          })
          .eq("id", user.id);
        updateError = error;
      } else {
        // Create new
        const { error } = await supabase
          .from("profiles")
          .insert([{
            id: user.id,
            full_name: profile.full_name,
            avatar_at: finalAvatarUrl,
            role: user.email === "apdilaahiapdi143@gmail.com" ? "admin" : "unknown"
          }]);
        updateError = error;
      }

      if (updateError) {
        throw updateError;
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="text-center mt-10 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Profile Settings</h1>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
          Profile updated successfully! Refreshing...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={profile.avatar_at || "https://via.placeholder.com/100"}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 shadow-sm"
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500 mb-2">Upload a new avatar from your device.</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={profile.full_name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
