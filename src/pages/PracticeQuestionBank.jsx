// src/pages/PracticeQuestions.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function PracticeQuestions() {
  const [universities, setUniversities] = useState([]);
  const [years, setYears] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const [mode, setMode] = useState(null); // "read" | "exam"
  const [showAnswers, setShowAnswers] = useState(false);

  // exam state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  // fetch universities
  useEffect(() => {
    fetchUniversities();
  }, []);

  const fetchUniversities = async () => {
    let { data, error } = await supabase.from("universities").select("*");
    if (error) console.error("❌ Error loading universities:", error.message);
    if (data) setUniversities(data);
  };

  const fetchYears = async (uniId) => {
    let { data, error } = await supabase
      .from("years")
      .select("*")
      .eq("university_id", uniId);

    if (error) console.error("❌ Error loading years:", error.message);
    if (data) setYears(data);
  };

  const fetchQuestions = async () => {
    if (!selectedUni || !selectedYear) return;

    let { data, error } = await supabase
      .from("question_bank")
      .select("*")
      .eq("university_id", selectedUni)
      .eq("year_id", selectedYear);

    console.log("🔍 Supabase Questions:", data);
    if (error) console.error("❌ Error loading questions:", error.message);

    if (data) {
      setQuestions(data);
      setMode(null);
      setScore(null);
      setAnswers({});
      setCurrentQ(0);
    }
  };

  const handleAnswer = (qid, ans) => {
    setAnswers({ ...answers, [qid]: ans });
  };

  const finishExam = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) correct++;
    });
    setScore(`${correct} / ${questions.length}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
        📝 Practice Questions
      </h1>

      {/* Selectors */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        <select
          onChange={(e) => {
            const uniId = parseInt(e.target.value);
            setSelectedUni(uniId);
            fetchYears(uniId);
          }}
          className="border px-4 py-2 rounded-lg shadow focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select University</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="border px-4 py-2 rounded-lg shadow focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Year</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.year_name}
            </option>
          ))}
        </select>

        <button
          onClick={fetchQuestions}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Load Questions
        </button>
      </div>

      {/* Mode Selector */}
      {questions.length > 0 && !mode && (
        <div className="flex gap-6 justify-center mb-6">
          <button
            onClick={() => setMode("read")}
            className="bg-gray-600 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-700 transition"
          >
            📖 Read Mode
          </button>
          <button
            onClick={() => setMode("exam")}
            className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
          >
            🏆 Start Exam
          </button>
        </div>
      )}

      {/* Read Mode */}
      {mode === "read" && (
        <div>
          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="mb-6 bg-yellow-500 text-white px-5 py-2 rounded-lg shadow hover:bg-yellow-600 transition"
          >
            {showAnswers ? "🙈 Hide Answers" : "👀 Show Answers"}
          </button>

          <div className="space-y-5">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="border p-5 rounded-xl shadow bg-white hover:shadow-lg transition"
              >
                <p className="font-semibold text-lg mb-3">
                  {i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-gray-50 shadow-sm">
                    A. {q.option_a}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 shadow-sm">
                    B. {q.option_b}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 shadow-sm">
                    C. {q.option_c}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 shadow-sm">
                    D. {q.option_d}
                  </div>
                </div>
                {showAnswers && (
                  <p className="text-green-700 font-medium mt-3">
                    ✅ Correct Answer: {q.correct_answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam Mode */}
      {mode === "exam" && (
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-2xl p-6">
          {score ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-3 text-green-700">
                🎉 Exam Finished!
              </h2>
              <p className="text-lg font-semibold">
                Your Score:{" "}
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                  {score}
                </span>
              </p>
              <button
                onClick={() => {
                  setMode(null);
                  setScore(null);
                }}
                className="mt-5 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                🔙 Back
              </button>
            </div>
          ) : (
            <>
              <p className="font-bold text-lg mb-4">
                Q{currentQ + 1}. {questions[currentQ].question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {["A", "B", "C", "D"].map((opt) => {
                  const isSelected =
                    answers[questions[currentQ].id] === opt;
                  return (
                    <div
                      key={opt}
                      onClick={() =>
                        handleAnswer(questions[currentQ].id, opt)
                      }
                      className={`cursor-pointer p-4 rounded-xl border shadow-sm transition ${
                        isSelected
                          ? "bg-blue-100 border-blue-400 text-blue-700 font-semibold"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span className="font-bold">{opt}.</span>{" "}
                      {questions[currentQ][`option_${opt.toLowerCase()}`]}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-6">
                <button
                  disabled={currentQ === 0}
                  onClick={() => setCurrentQ(currentQ - 1)}
                  className="bg-gray-500 text-white px-5 py-2 rounded-lg shadow disabled:opacity-50 hover:bg-gray-600 transition"
                >
                  ⬅ Prev
                </button>
                {currentQ === questions.length - 1 ? (
                  <button
                    onClick={finishExam}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
                  >
                    ✅ Finish
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQ(currentQ + 1)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Next ➡
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PracticeQuestions;
