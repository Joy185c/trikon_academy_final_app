import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx"; // ✅ আমরা context use করব

export default function SignUp() {
  const { register } = useAuth(); // AuthContext থেকে register আসবে
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(name, email, password); // ✅ AuthContext এর register ব্যবহার
      alert("✅ Signup successful! Please check your email.");
    } catch (err) {
      console.error("Signup Error:", err);
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSignUp}
        className="bg-white shadow-lg rounded-2xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-600">
          Signup
        </h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-3 border rounded bg-blue-50"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 border rounded bg-blue-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 border rounded bg-blue-50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Signing up..." : "Signup"}
        </button>
      </form>
    </div>
  );
}
