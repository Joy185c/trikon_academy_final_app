import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

function Profile() {
  const { user, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-lg text-gray-600">
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
      .from("student_users")
      .update({ full_name: fullName })
      .eq("id", user.id);

    if (error) {
      setMessage("❌ Failed to update name. Try again!");
    } else {
      setMessage("✅ Name updated successfully!");

      // 🔹 update local user state so it stays after save
      // fetch fresh data from student_users
      const { data: updatedUser, error: fetchError } = await supabase
        .from("student_users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!fetchError && updatedUser) {
        setFullName(updatedUser.full_name);
      }

      setEditing(false);
    }

    setSaving(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md text-center border border-white/40">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-6">
          👤 My Profile
        </h1>

        {/* Full Name */}
        {editing ? (
          <div className="mb-4">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        ) : (
          <p className="text-lg mb-2">
            <strong>Name:</strong> {fullName || "N/A"}
          </p>
        )}

        {/* Email */}
        <p className="text-lg mb-2">
          <strong>Email:</strong> {user.email}
        </p>

        {/* Role */}
        <p className="text-lg mb-6">
          <strong>Role:</strong> {user.role || "student"}
        </p>

        {/* Buttons */}
        {editing ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              {saving ? "⏳ Saving..." : "💾 Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            ✏️ Edit Name
          </button>
        )}

        {/* Message */}
        {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

export default Profile;
