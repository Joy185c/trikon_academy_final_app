// src/pages/QuestionPapers.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function QuestionPapers() {
  const { uniId } = useParams(); // 🏫 University ID from URL
  const [university, setUniversity] = useState(null);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("read"); // read | exam
  const [answers, setAnswers] = useState({});

  // 🏫 Fetch University Info
  useEffect(() => {
    const fetchUniversity = async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("id", uniId)
        .single();

      if (!error) setUniversity(data);
    };
    fetchUniversity();
  }, [uniId]);

  // 📅 Fetch Years
  useEffect(() => {
    const fetchYears = async () => {
      const { data, error } = await supabase
        .from("years")
        .select("id, year_name")
        .eq("university_id", uniId)
        .order("year_name");

      if (!error) setYears(data);
    };
    fetchYears();
  }, [uniId]);

  // ❓ Fetch Questions when Year selected
  useEffect(() => {
    if (!selectedYear) return;

    const fetchQuestions = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("question_bank")
        .select("id, question, option_a, option_b, option_c, option_d, correct_answer, solution") // ✅ solution added
        .eq("university_id", uniId)
        .eq("year_id", selectedYear)
        .order("created_at", { ascending: false });

      if (!error) setQuestions(data || []);
      setLoading(false);
    };

    fetchQuestions();
  }, [uniId, selectedYear]);

  // Exam mode answer select
  const handleAnswer = (qId, opt) => {
    setAnswers({ ...answers, [qId]: opt });
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
        📚 {university?.name} - Question Bank
      </h1>

      {/* Dropdowns */}
      <div className="flex justify-center gap-4 mb-6">
        <select
          className="border rounded p-2"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_name}
            </option>
          ))}
        </select>

        <select
          className="border rounded p-2"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <option value="read">Read Mode</option>
          <option value="exam">Exam Mode</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center mt-10">⏳ Loading questions...</p>
      ) : questions.length === 0 ? (
        <p className="text-center text-gray-500">❌ No questions found.</p>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white shadow p-4 rounded-lg hover:bg-blue-50 transition"
            >
              <h2 className="text-lg font-semibold text-blue-700">
                {idx + 1}. {q.question}
              </h2>

              <div className="mt-2 space-y-2">
                {["A", "B", "C", "D"].map((opt) => {
                  const optionText = q[`option_${opt.toLowerCase()}`];
                  const selected = answers[q.id] === opt;

                  return (
                    <label
                      key={opt}
                      className={`block p-2 rounded cursor-pointer ${
                        mode === "exam" && selected
                          ? "bg-blue-100 border border-blue-500"
                          : "border"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        disabled={mode === "read"}
                        checked={selected}
                        onChange={() => handleAnswer(q.id, opt)}
                      />{" "}
                      {opt}. {optionText}
                    </label>
                  );
                })}
              </div>

              {/* ✅ Show answer & solution in Read mode only */}
              {mode === "read" && (
                <div className="mt-3">
                  <p className="text-green-600 font-semibold">
                    ✅ Correct Answer: {q.correct_answer}
                  </p>
                  {q.solution && (
                    <div className="mt-2 p-3 bg-gray-100 border rounded">
                      <p className="text-gray-700">
                        <span className="font-bold">💡 Solution:</span> {q.solution}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuestionPapers;
