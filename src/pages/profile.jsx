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

  const [openSection, setOpenSection] = useState(null); 
  const [showPasswordBox, setShowPasswordBox] = useState(false); 

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
      setShowPasswordBox(false);
    }
    setUpdatingPassword(false);
  };

  const Section = ({ title, children }) => (
    <div className="border border-white/20 rounded-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpenSection(openSection === title ? null : title)}
        className="w-full text-left px-4 py-3 bg-white/10 text-white font-semibold hover:bg-white/20 transition flex justify-between items-center"
      >
        {title}
        <span>{openSection === title ? "▲" : "▼"}</span>
      </button>
      {openSection === title && (
        <div className="px-4 py-3 text-sm text-gray-200 bg-black/30">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      {/* Profile Card */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl 
                      p-5 sm:p-6 w-full max-w-md text-center">
        
        {/* Profile Picture */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 
                          flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg 
                          border-4 border-white/20">
            {user.email.charAt(0).toUpperCase()}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-6">
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

        {/* Message */}
        {message && (
          <p className="mt-4 text-xs sm:text-sm text-white bg-black/40 px-3 py-2 rounded-lg shadow-inner">
            {message}
          </p>
        )}

        {/* Extra Sections */}
        <div className="mt-6 text-left">
          <Section title="📌 FAQs (প্রশ্নোত্তর)">
            <ul className="list-disc ml-5 space-y-2">
              <li>ভর্তি কোর্স কিভাবে যোগ দেব? 👉 Online form পূরণ করুন।</li>
              <li>Payment Method কী? 👉 Bkash, Nagad, Rocket।</li>
              <li>Refund Policy কী? 👉 Admission fee refundable না।</li>
              <li>Class কিভাবে হবে (Online/Offline)? 👉 Zoom + Recorded Classes।</li>
            </ul>
          </Section>

          <Section title="ℹ️ About Us (আমাদের সম্পর্কে)">
            <p><strong>Academy Mission:</strong> শিক্ষার্থীদের স্মার্টলি ভর্তি পরীক্ষার জন্য প্রস্তুত করা।</p>
            <p><strong>Vision & Goals:</strong> প্রতিটি শিক্ষার্থীকে স্বপ্নের বিশ্ববিদ্যালয়ে পৌঁছে দেওয়া।</p>
            <p><strong>Teacher Profiles:</strong> Expert Faculty (Medical + University Graduates)।</p>
            <p><strong>Success Statistics:</strong> গত বছর ৮০% শিক্ষার্থী সফলভাবে ভর্তি হয়েছে।</p>
          </Section>

          <Section title="📜 Policies">
            <p><strong>Privacy Policy:</strong> আমরা আপনার ডাটা সুরক্ষিত রাখি।</p>
            <p><strong>Refund Policy:</strong> নির্দিষ্ট ক্ষেত্রে আংশিক refund হতে পারে।</p>
            <p><strong>Terms & Conditions:</strong> কোর্স চলাকালীন নিয়মাবলী মেনে চলতে হবে।</p>
          </Section>

          <Section title="📞 Contact Us">
            <p><strong>Phone:</strong> +880 15217 02979</p>
            <p><strong>Email:</strong> joy185c@gmail.com</p>
            <p><strong>Address:</strong> MBSTU, Tangail, Dhaka, Bangladesh</p>
          </Section>
        </div>

        {/* 🔽 Update Password Moved to Bottom */}
        <div className="mt-6">
          <button
            onClick={() => setShowPasswordBox(!showPasswordBox)}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2 rounded-lg 
                       hover:opacity-90 transition text-sm sm:text-base shadow-md"
          >
            {showPasswordBox ? "❌ Cancel" : "🔒 Update Password"}
          </button>

          {showPasswordBox && (
            <div className="mt-4 text-left bg-black/40 rounded-lg p-4">
              <h2 className="text-lg sm:text-xl font-semibold text-pink-300 mb-3">
                Change Your Password
              </h2>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300/40 rounded-lg 
                           focus:ring-2 focus:ring-purple-400 outline-none 
                           text-sm sm:text-base bg-white/70 text-gray-900 mb-3"
              />
              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg 
                           hover:opacity-90 transition text-sm sm:text-base shadow-md"
              >
                {updatingPassword ? "⏳ Updating..." : "Save New Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
