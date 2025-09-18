import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseclient.js";
import { useState } from "react";

function Profile() {
  const { user, loading } = useAuth();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      {/* Profile Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl 
                      p-6 sm:p-8 w-full max-w-sm sm:max-w-md text-center">
        
        {/* Profile Picture */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 
                          flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg 
                          border-4 border-white/20">
            {user.email.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">
          👤 My Profile
        </h1>

        {/* Full Name */}
        {editing ? (
          <div className="mb-3 sm:mb-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300/40 rounded-lg 
                         focus:ring-2 focus:ring-blue-400 outline-none 
                         text-sm sm:text-base bg-white/70 text-gray-900"
            />
          </div>
        ) : (
          <p className="text-sm sm:text-base mb-2 text-gray-200">
            <strong className="text-white">Name:</strong> {fullName || "N/A"}
          </p>
        )}

        {/* Email */}
        <p className="text-sm sm:text-base mb-2 text-gray-200">
          <strong className="text-white">Email:</strong> {user.email}
        </p>

        {/* Role */}
        <p className="text-sm sm:text-base mb-4 text-gray-200">
          <strong className="text-white">Role:</strong> {user.role || "student"}
        </p>

        {/* Edit Buttons */}
        {editing ? (
          <div className="flex gap-3 justify-center mb-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg 
                         hover:opacity-90 transition text-sm shadow-md"
            >
              {saving ? "⏳ Saving..." : "💾 Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-500/50 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2 rounded-lg 
                       hover:opacity-90 transition mb-5 text-sm sm:text-base shadow-md"
          >
            ✏️ Edit Name
          </button>
        )}

        {/* Update Password Section */}
        <div className="mt-4 sm:mt-6 text-left">
          <h2 className="text-lg sm:text-xl font-semibold text-indigo-300 mb-2">
            🔒 Update Password
          </h2>
          <div className="flex flex-col gap-2 sm:gap-3">
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300/40 rounded-lg 
                         focus:ring-2 focus:ring-purple-400 outline-none 
                         text-sm sm:text-base bg-white/70 text-gray-900"
            />
            <button
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg 
                         hover:opacity-90 transition text-sm sm:text-base shadow-md"
            >
              {updatingPassword ? "⏳ Updating..." : "Update Password"}
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <p className="mt-4 text-xs sm:text-sm text-white bg-black/40 px-3 py-2 rounded-lg shadow-inner">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Profile;
