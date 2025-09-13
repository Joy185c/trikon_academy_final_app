import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    // Supabase signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // profile table এ save হবে
      },
    });

    if (error) {
      setError(error.message);
    } else {
      console.log("User registered:", data.user);
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Register</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
          <input name="email" type="email" placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
          <input name="password" type="password" placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400" />
          <button type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
