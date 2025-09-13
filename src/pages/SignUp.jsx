import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("🔹 Signup form submitted:", { name, email, password });

    try {
      // Step 1: Supabase Auth signup with metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // ✅ save name in metadata
          },
        },
      });

      console.log("🔹 Supabase signUp response:", data, signUpError);

      if (signUpError) {
        setError(`Auth error: ${signUpError.message}`);
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError("Signup failed: No user returned.");
        setLoading(false);
        return;
      }

      // Step 2: Insert into custom table (optional)
      const { error: dbError } = await supabase.from("students").insert([
        {
          auth_id: data.user.id,
          name: name,
          email: email,
        },
      ]);

      console.log("🔹 DB Insert response:", dbError);

      if (dbError) {
        setError(`Database insert error: ${dbError.message}`);
        setLoading(false);
        return;
      }

      alert("✅ Signup successful! Please check your email for confirmation.");
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Unexpected error occurred. Check console for details.");
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
