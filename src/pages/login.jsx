// src/pages/Login.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ context থেকে login আনবো

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ এখন context থেকে login ব্যবহার করছি
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password); // ✅ AuthContext থেকে কল
      console.log("✅ Login successful:", user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  // 🔄 Forgot password
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email first!");
      return;
    }

    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password",
    });

    if (error) {
      setError(error.message);
    } else {
      alert("📩 Password reset link sent to your email!");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
      <div className="bg-white/40 backdrop-blur-lg shadow-xl rounded-2xl p-8 w-full max-w-md border border-white/50">
        <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent bg-clip-text mb-6">
          🔑 Login
        </h2>

        <h1 className="text-center text-2xl font-bold text-blue-700 mb-4">
          Trikon Academy
        </h1>

        {error && (
          <p className="bg-red-100 border border-red-400 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            ⚠️ {error}
          </p>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="📧 Enter your Email"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="🔑 Enter your Password"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow hover:opacity-90 transition"
          >
            {loading ? "⏳ Logging in..." : "Login"}
          </button>
        </form>

        {/* Forgot password */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Forgot password?{" "}
          <span
            onClick={handleForgotPassword}
            className="text-red-600 font-semibold hover:underline cursor-pointer"
          >
            Reset
          </span>
        </p>

        {/* Signup link */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
