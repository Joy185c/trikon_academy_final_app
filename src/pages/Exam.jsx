import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

function Exam() {
  const { paperId } = useParams();
  const [searchParams] = useSearchParams();
  const reviewMode = searchParams.get("review") === "true";

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [user, setUser] = useState(null);
  const [examInfo, setExamInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // Timer

  // ✅ Get logged in user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  // ✅ Fetch Exam Info
  useEffect(() => {
    const fetchExamInfo = async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", paperId)
        .single();

      if (!error && data) {
        setExamInfo(data);
        const now = new Date();
        if (new Date(data.start_time) <= now && new Date(data.end_time) >= now) {
          const diff = Math.floor((new Date(data.end_time) - now) / 1000);
          setTimeLeft(diff);
        }
      }
    };
    fetchExamInfo();
  }, [paperId]);

  // ✅ Timer countdown
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0 && !submitted) {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  // ✅ Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("paper_id", paperId);

      if (!error && data) setQuestions(data);
    };
    fetchQuestions();
  }, [paperId]);

  // ✅ Answer select handler
  const handleAnswer = (qid, option) => {
    if (reviewMode || submitted) return;
    setAnswers({ ...answers, [qid]: option });
  };

  // ✅ Submit Exam
  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct_option) correct++;
    });

    setScore(correct);
    setSubmitted(true);

    if (user && !reviewMode) {
      await supabase.from("exam_attempts").insert([
        {
          student_id: user.id,
          paper_id: paperId,
          score: correct,
          total: questions.length,
          answers,
        },
      ]);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">
        {reviewMode ? "📜 Exam Review" : "📝 Exam"}
      </h1>

      {examInfo && (
        <div className="mb-4 text-gray-600">
          <p><strong>Exam:</strong> {examInfo.title}</p>
          {timeLeft !== null && !submitted && (
            <p className="text-red-600 font-bold">
              ⏳ Time Left: {formatTime(timeLeft)}
            </p>
          )}
        </div>
      )}

      {!submitted ? (
        <>
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-4 mb-4 shadow rounded-lg">
              <h2 className="text-lg font-semibold mb-2">
                {idx + 1}. {q.question}
              </h2>
              <div className="space-y-2">
                {["a", "b", "c", "d"].map((opt) => (
                  <label
                    key={opt}
                    className={`block p-2 border rounded cursor-pointer ${
                      answers[q.id] === opt
                        ? "bg-blue-100 border-blue-500"
                        : "bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="mr-2"
                      disabled={reviewMode}
                    />
                    {q[opt]}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {!reviewMode && questions.length > 0 && (
            <button
              onClick={handleSubmit}
              className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Submit Exam 🚀
            </button>
          )}
        </>
      ) : (
        <div className="bg-white shadow p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            ✅ Exam Submitted!
          </h2>
          <p className="text-lg">
            Score: <strong>{score}</strong> / {questions.length}
          </p>

          <h3 className="mt-6 text-xl font-semibold text-blue-700">
            📊 Answers & Solutions
          </h3>
          <ul className="mt-4 space-y-4 text-left">
            {questions.map((q, idx) => (
              <li key={q.id} className="p-4 bg-gray-50 rounded">
                <p className="font-semibold">
                  {idx + 1}. {q.question}
                </p>
                <p>
                  ✅ Correct Answer: <span className="text-green-600">{q[q.correct_option]}</span>
                </p>
                <p>
                  ❌ Your Answer:{" "}
                  <span
                    className={
                      answers[q.id] === q.correct_option
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {answers[q.id] ? q[answers[q.id]] : "Not Answered"}
                  </span>
                </p>
                {q.solution && (
                  <p className="mt-2 text-blue-700">
                    💡 Solution: {q.solution}
                  </p>
                )}
                {q.solution_image && (
                  <img
                    src={q.solution_image}
                    alt="solution"
                    className="mt-2 max-h-48 border rounded"
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Exam;
