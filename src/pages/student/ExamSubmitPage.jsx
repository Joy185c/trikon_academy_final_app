import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function ExamSubmitPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      setLoading(true);

      // ✅ Step 1: Fetch attempt info
      const { data: attemptData, error: attemptError } = await supabase
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
        .eq("id", attemptId)
        .single();

      if (attemptError) {
        console.error("❌ Error fetching attempt:", attemptError.message);
        setLoading(false);
        return;
      }

      // ✅ Step 2: Fetch answers
      const { data: answersData, error: answersError } = await supabase
        .from("attempt_answers")
        .select(
          `
          id,
          selected_option,
          is_correct,
          exam_questions (
            id,
            question,
            options,
            correct_answer,
            solution
          )
        `
        )
        .eq("attempt_id", attemptId);

      if (answersError) {
        console.error("❌ Error fetching answers:", answersError.message);
      }

      setAttempt(attemptData);
      setAnswers(answersData || []);
      setLoading(false);
    };

    fetchReview();
  }, [attemptId]);

  if (loading) return <p className="text-center mt-10">⏳ Loading review...</p>;
  if (!attempt) return <p className="text-center mt-10">❌ Attempt not found</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-2xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold">
          📖 {attempt.exams?.title} - Review
        </h1>
        <p className="mt-1 text-sm opacity-90">
          Submitted at:{" "}
          {attempt.submitted_at &&
            new Date(attempt.submitted_at).toLocaleString("en-GB")}
        </p>
        <p className="mt-2 font-semibold text-lg">
          Final Score:{" "}
          <span className="bg-white text-purple-700 px-3 py-1 rounded-lg shadow">
            {attempt.score}%
          </span>
        </p>
      </div>

      {/* ✅ Render answers */}
      {answers.map((ans, idx) => {
        const q = ans.exam_questions;
        const selectedKey = ans.selected_option;

        return (
          <div
            key={ans.id}
            className="p-5 mb-5 rounded-2xl bg-white shadow-md border hover:shadow-xl transition-all"
          >
            <p className="font-semibold text-lg mb-3">
              {idx + 1}. {q.question}
            </p>

            {/* Responsive grid options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(q.options || {}).map(([key, value]) => {
                const isSelected = selectedKey === key;
                const isCorrect =
                  ["a", "b", "c", "d"].includes(q.correct_answer?.toLowerCase())
                    ? key === q.correct_answer.toLowerCase()
                    : value === q.correct_answer;

                let optionClass =
                  "w-full p-4 rounded-xl border shadow-sm transition-all text-left";

                if (isCorrect) {
                  optionClass +=
                    " bg-green-100 text-green-700 border-green-400 font-semibold";
                } else if (isSelected && !isCorrect) {
                  optionClass +=
                    " bg-red-100 text-red-700 border-red-400 font-semibold";
                } else {
                  optionClass += " bg-gray-50 text-gray-600";
                }

                return (
                  <div key={key} className={optionClass}>
                    <div className="flex items-start gap-3">
                      <span className="font-bold">{key.toUpperCase()}.</span>
                      <span>{value}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ Solution */}
            {q.solution && (
              <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-gray-800 rounded">
                💡 <strong>Solution:</strong> {q.solution}
              </div>
            )}
          </div>
        );
      })}

      <button
        onClick={() => navigate("/exam-history")}
        className="mt-6 bg-gray-700 text-white px-6 py-3 rounded-lg shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105"
      >
        ⬅ Back to History
      </button>
    </div>
  );
}

export default ExamSubmitPage;
