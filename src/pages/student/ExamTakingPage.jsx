import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

function ExamTakingPage() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  // ✅ Load Exam Info
  useEffect(() => {
    const fetchExam = async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", examId)
        .single();

      if (error) {
        console.error("❌ Exam fetch error:", error.message);
      } else {
        setExam(data);
      }
    };

    fetchExam();
  }, [examId]);

  // ✅ Start Exam
  const handleStartExam = async () => {
    const { data, error } = await supabase
      .from("exam_questions")
      .select("id, question, options, correct_answer, solution")
      .eq("exam_id", examId);

    if (error) {
      console.error("❌ Question fetch error:", error.message);
      return;
    }

    setQuestions(data || []);

    let duration = exam?.duration
      ? exam.duration * 60
      : (new Date(exam.end_time) - new Date(exam.start_time)) / 1000;

    setTimeLeft(duration > 0 ? Math.floor(duration) : 0);
    setStarted(true);
  };

  // ✅ Timer
  useEffect(() => {
    if (!started || submitted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, submitted, timeLeft]);

  // ✅ Select Answer
  const handleSelect = (qId, ansKey) => {
    setAnswers((prev) => ({ ...prev, [qId]: ansKey }));
  };

  // ✅ Submit Exam
  const handleSubmit = async () => {
    if (submitted) return;

    let correct = 0,
      wrong = 0,
      skipped = 0;

    questions.forEach((q) => {
      const selectedKey = answers[q.id];
      if (!selectedKey) {
        skipped++;
        return;
      }

      const isCorrect = ["a", "b", "c", "d"].includes(
        q.correct_answer?.toLowerCase()
      )
        ? selectedKey === q.correct_answer.toLowerCase()
        : q.options[selectedKey] === q.correct_answer;

      if (isCorrect) correct++;
      else wrong++;
    });

    const percent = Math.round((correct / questions.length) * 100);

    // ✅ Save attempt
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ No logged in user found!");
      return;
    }

    const { data: attemptData, error: attemptError } = await supabase
      .from("exam_attempts")
      .insert([
        {
          exam_id: examId,
          student_id: user.id,
          submitted_at: new Date().toISOString(),
          score: percent,
        },
      ])
      .select("id")
      .single();

    if (attemptError || !attemptData) {
      console.error("❌ Error saving attempt:", attemptError?.message);
      return;
    }

    // ✅ Prepare answers
    const answerData = questions.map((q) => {
      const selectedKey = answers[q.id];
      const isCorrect = selectedKey
        ? ["a", "b", "c", "d"].includes(q.correct_answer?.toLowerCase())
          ? selectedKey === q.correct_answer.toLowerCase()
          : q.options[selectedKey] === q.correct_answer
        : false;

      return {
        attempt_id: attemptData.id,
        question_id: q.id,
        selected_option: selectedKey ?? null,
        is_correct: isCorrect,
      };
    });

    if (answerData.length > 0) {
      const { error: answerError } = await supabase
        .from("attempt_answers")
        .insert(answerData);

      if (answerError) {
        console.error("❌ Error saving answers:", answerError.message);
      }
    }

    // ✅ Update state
    setScore({
      correct,
      wrong,
      skipped,
      total: questions.length,
      percent,
      attemptId: attemptData.id,
    });
    setSubmitted(true);
  };

  if (!exam) return <p className="text-center mt-10">Loading exam...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-600 mb-2">{exam.title}</h1>
      <p className="text-gray-600 mb-4">
        Duration:{" "}
        {Math.round(
          exam?.duration
            ? exam.duration
            : (new Date(exam.end_time) - new Date(exam.start_time)) / 60000
        )}{" "}
        mins
      </p>

      {/* Start Button */}
      {!started && !submitted && (
        <div className="text-center">
          <button
            onClick={handleStartExam}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105"
          >
            🚀 Start Exam
          </button>
        </div>
      )}

      {/* Timer */}
      {started && !submitted && (
        <div className="mb-4 text-red-600 font-semibold">
          ⏳ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
        </div>
      )}

      {/* Questions */}
      {started &&
        questions.map((q, idx) => {
          const selectedKey = answers[q.id];
          return (
            <div
              key={q.id}
              className="p-5 mb-5 rounded-2xl bg-white shadow-md border hover:shadow-xl transition-all"
            >
              <p className="font-semibold text-lg mb-3">
                {idx + 1}. {q.question}
              </p>

              {/* Responsive Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(q.options || {}).map(([key, value]) => {
                  const isSelected = selectedKey === key;
                  const isAnswer =
                    ["a", "b", "c", "d"].includes(
                      q.correct_answer?.toLowerCase()
                    )
                      ? key === q.correct_answer.toLowerCase()
                      : value === q.correct_answer;

                  let optionClass =
                    "w-full p-4 rounded-xl border shadow-sm transition-all duration-300 cursor-pointer text-left";

                  if (submitted) {
                    if (isAnswer)
                      optionClass +=
                        " bg-green-100 text-green-700 border-green-400 font-semibold";
                    else if (isSelected && !isAnswer)
                      optionClass +=
                        " bg-red-100 text-red-700 border-red-400 font-semibold";
                    else optionClass += " bg-gray-50 text-gray-600";
                  } else {
                    optionClass += isSelected
                      ? " bg-blue-100 border-blue-500 text-blue-700 font-semibold scale-105"
                      : " hover:bg-gray-100 hover:scale-[1.02]";
                  }

                  return (
                    <label key={key} className={optionClass}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={key}
                        checked={isSelected}
                        disabled={submitted}
                        onChange={() => handleSelect(q.id, key)}
                        className="hidden"
                      />
                      <div className="flex items-start gap-3">
                        <span className="font-bold">{key.toUpperCase()}.</span>
                        <span>{value}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* ✅ Show Solution */}
              {submitted && q.solution && (
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-gray-800 rounded">
                  💡 <strong>Solution:</strong> {q.solution}
                </div>
              )}
            </div>
          );
        })}

      {/* Submit */}
      {started && !submitted && (
        <button
          onClick={handleSubmit}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-transform transform hover:scale-105"
        >
          Submit Exam
        </button>
      )}

      {/* Result Summary */}
      {submitted && score && (
        <div className="mt-6 p-6 bg-gray-100 rounded text-center shadow">
          <h2 className="text-xl font-bold text-purple-600">
            🎉 Exam Submitted!
          </h2>
          <p className="mt-2 font-semibold">Your Score: {score.percent}%</p>
          <p className="mt-1 text-green-600">✅ Correct: {score.correct}</p>
          <p className="mt-1 text-red-600">❌ Wrong: {score.wrong}</p>
          <p className="mt-1 text-yellow-600">⏭ Skipped: {score.skipped}</p>
          <p className="mt-1 text-gray-700">Total: {score.total}</p>

          <button
            onClick={() => navigate(`/exam-submit/${score.attemptId}`)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md"
          >
            📖 View Answer Review
          </button>

          <button
            onClick={() => navigate("/exam-history")}
            className="mt-4 ml-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 shadow-md"
          >
            📜 Exam History
          </button>
        </div>
      )}
    </div>
  );
}

export default ExamTakingPage;
