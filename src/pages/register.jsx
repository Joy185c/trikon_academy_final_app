// src/pages/Register.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext"; // ✅ context থেকে register আনবো

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth(); // ✅ AuthContext এর register()
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const user = await register(name, email, password); // ✅ context এর ফাংশন
      console.log("✅ User registered:", user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-100 via-teal-100 to-blue-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          📝 Register
        </h2>

        {error && (
          <p className="bg-red-100 border border-red-400 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            ⚠️ {error}
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            type="text"
            placeholder="Full Name"
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl shadow hover:opacity-90 transition"
          >
            {loading ? "⏳ Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 font-semibold hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
