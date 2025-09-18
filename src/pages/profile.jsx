import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseclient.js";
import { useState } from "react";

function Profile() {
  const { user, loading } = useAuth();

  // Full name update
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);

  // Password update
  const [newPassword, setNewPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-base md:text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-base md:text-lg text-gray-600">
          ⚠️ Please login to view your profile.
        </p>
      </div>
    );
  }

  // 🔹 Save Updated Name
  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      setMessage("❌ Failed to update name. Try again!");
    } else {
      const { data: updatedUser } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

      if (updatedUser) {
        setFullName(updatedUser.full_name);
        user.full_name = updatedUser.full_name;
        user.role = updatedUser.role;
      }

      setMessage("✅ Name updated successfully!");
      setEditing(false);
    }
    setSaving(false);
  };

  // 🔹 Update Password
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setMessage("⚠️ Please enter a new password");
      return;
    }
    setUpdatingPassword(true);
    setMessage("");

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage("❌ Failed to update password: " + error.message);
    } else {
      setMessage("✅ Password updated successfully!");
      setNewPassword("");
    }
    setUpdatingPassword(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 relative px-4">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/blueprint.png')] opacity-10"></div>

      <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg text-center border border-white/40 relative z-10">
        {/* Profile Picture */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-md">
            {user.email.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-4 sm:mb-6">
          👤 My Profile
        </h1>

        {/* Full Name */}
        {editing ? (
          <div className="mb-3 sm:mb-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm sm:text-base"
            />
          </div>
        ) : (
          <p className="text-sm sm:text-base mb-2">
            <strong>Name:</strong> {fullName || "N/A"}
          </p>
        )}

        {/* Email */}
        <p className="text-sm sm:text-base mb-2">
          <strong>Email:</strong> {user.email}
        </p>

        {/* Role */}
        <p className="text-sm sm:text-base mb-4">
          <strong>Role:</strong> {user.role || "student"}
        </p>

        {/* Edit Buttons */}
        {editing ? (
          <div className="flex gap-3 justify-center mb-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm"
            >
              {saving ? "⏳ Saving..." : "💾 Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition mb-5 text-sm sm:text-base"
          >
            ✏️ Edit Name
          </button>
        )}

        {/* Update Password Section */}
        <div className="mt-4 sm:mt-6 text-left">
          <h2 className="text-lg sm:text-xl font-semibold text-blue-700 mb-2">
            🔒 Update Password
          </h2>
          <div className="flex flex-col gap-2 sm:gap-3">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-sm sm:text-base"
            />
            <button
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
            >
              {updatingPassword ? "⏳ Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-xs sm:text-sm text-gray-800 bg-gray-100 p-2 rounded-lg">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;
