// src/pages/QuestionBank.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function QuestionBank() {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🏫 Fetch Universities
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase.from("universities").select("*");
      if (error) {
        console.error("Error fetching universities:", error.message);
      } else {
        setUniversities(data);
      }
      setLoading(false);
    };

    fetchUniversities();
  }, []);

  // 🎨 Gradient color set
  const gradients = [
    "from-pink-500 via-red-400 to-yellow-400",
    "from-blue-500 via-indigo-400 to-purple-500",
    "from-green-400 via-teal-400 to-cyan-500",
    "from-yellow-400 via-orange-500 to-pink-500",
    "from-purple-500 via-pink-400 to-red-400",
  ];

  if (loading)
    return (
      <p className="text-center mt-10 text-blue-600 font-semibold animate-pulse">
        ⏳ Loading universities...
      </p>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg">
        🎓 Question Bank
      </h1>

      {universities.length === 0 ? (
        <p className="text-center text-gray-500">
          ❌ No universities found in database.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {universities.map((uni, idx) => (
            <Link
              key={uni.id}
              to={`/question-papers/${uni.id}`}
              className={`
                relative block h-24 rounded-xl shadow-md 
                bg-gradient-to-br ${gradients[idx % gradients.length]} 
                overflow-hidden transform hover:scale-105 
                transition duration-300
              `}
            >
              {/* Glossy shine effect */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm opacity-30 hover:opacity-50 transition"></div>

              {/* Centered varsity name */}
              <div className="relative flex items-center justify-center h-full px-2 text-center">
                <h2 className="text-xl font-extrabold text-white drop-shadow-lg leading-snug">
                  {uni.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionBank;
