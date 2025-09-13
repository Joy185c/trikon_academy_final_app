import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function ExamHistoryPage() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("exam_attempts")
        .select(
          `
          id,
          score,
          submitted_at,
          exams (
            id,
            title
          )
        `
        )
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("❌ History fetch error:", error.message);
      } else {
        setAttempts(data || []);
      }

      setLoading(false);
    };

    fetchAttempts();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <p className="animate-pulse text-lg text-blue-600 font-semibold">
          ⏳ Loading your exam history...
        </p>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <h1 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-8 drop-shadow-md">
        📜 My Exam History
      </h1>

      {attempts.length === 0 ? (
        <p className="text-center text-gray-500">
          😔 No attempts found. Try giving your first exam!
        </p>
      ) : (
        <ul className="space-y-5">
          {attempts.map((att) => (
            <li
              key={att.id}
              className="p-5 bg-gradient-to-r from-indigo-50 via-white to-pink-50 rounded-2xl shadow-md hover:shadow-2xl transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300"
            >
              <div className="flex justify-between items-center">
                {/* Exam Details */}
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {att.exams?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {att.submitted_at &&
                      new Date(att.submitted_at).toLocaleString("en-GB")}
                  </p>
                  <p className="mt-1 text-blue-600 font-semibold">
                    🏆 Score: {att.score}%
                  </p>
                </div>

                {/* View Button */}
                <button
                  onClick={() => navigate(`/exam-submit/${att.id}`)}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300"
                >
                  📖 View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExamHistoryPage;
