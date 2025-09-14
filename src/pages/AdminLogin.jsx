// src/components/AdminLogin.jsx
import { useState } from "react";
import { supabase } from "../lib/supabaseclient.js";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Step 1: Sign in user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(`❌ Login failed: ${authError.message}`);
        return;
      }

      if (!data?.user) {
        setError("⚠️ No user returned from Supabase!");
        return;
      }

      // Step 2: Fetch user role + secret_code from profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, secret_code")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError) {
        setError("⚠️ Error fetching user profile!");
        return;
      }

      if (!profile) {
        setError("⚠️ Profile not found for this user!");
        return;
      }

      // Step 3: Secret code check
      if (profile.secret_code !== secretCode) {
        setError("🚫 Invalid secret code!");
        return;
      }

      // Step 4: Role check
      if (profile.role !== "admin") {
        setError("🚫 You are not authorized to access Admin Panel.");
        await supabase.auth.signOut();
        return;
      }

      // ✅ Success → Redirect
      navigate("/admin");
    } catch (err) {
      console.error("Unexpected Error:", err);
      setError("🚨 Something went wrong, check console.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-lg rounded-xl p-8 w-96"
      >
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
          🔐 Admin Login
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />

        <input
          type="text"
          placeholder="Enter Secret Code"
          value={secretCode}
          onChange={(e) => setSecretCode(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
