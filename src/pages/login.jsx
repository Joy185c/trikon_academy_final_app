import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseclient.js";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP states
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // ✅ Step 1: Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Password login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log("✅ Password accepted, now sending OTP:", data.user);

    // Step 2: Send OTP (2FA)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setOtpSent(true);
    }

    setLoading(false);
  };

  // ✅ Step 3: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email", // email OTP (magic link / 6-digit code)
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("✅ OTP verified:", data.user);
      navigate("/dashboard");
    }

    setLoading(false);
  };

  // ✅ Forgot Password (Magic Link)
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

        {/* Step 1: Password form */}
        {!otpSent && (
          <form className="space-y-4" onSubmit={handlePasswordLogin}>
            <input
              type="email"
              placeholder="📧 Enter your Email"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="🔑 Enter your Password"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow hover:opacity-90 transition"
            >
              {loading ? "⏳ Verifying..." : "Login"}
            </button>
          </form>
        )}

        {/* Step 2: OTP verify form */}
        {otpSent && (
          <form className="space-y-4" onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="🔢 Enter OTP from Email"
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow hover:opacity-90 transition"
            >
              {loading ? "⏳ Checking OTP..." : "✅ Verify & Continue"}
            </button>
          </form>
        )}

        {/* Extra Links */}
        {!otpSent && (
          <p className="text-center text-gray-600 text-sm mt-4">
            Forgot password?{" "}
            <span
              onClick={handleForgotPassword}
              className="text-red-600 font-semibold hover:underline cursor-pointer"
            >
              Reset
            </span>
          </p>
        )}

        {!otpSent && (
          <p className="text-center text-gray-600 text-sm mt-6">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
