// src/pages/admin/ManageExamQuestions.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseclient.js";

function ManageExamQuestions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [attachedQuestions, setAttachedQuestions] = useState([]);

  // Manual add state
  const [newQ, setNewQ] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
    solution: "",
  });

  useEffect(() => {
    fetchExam();
    fetchAttachedQuestions();
  }, [examId]);

  // ✅ Exam info
  const fetchExam = async () => {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("id", examId)
      .single();

    if (!error && data) {
      setExam(data);
    }
  };

  // ✅ exam-এ already attached প্রশ্ন
  const fetchAttachedQuestions = async () => {
    const { data, error } = await supabase
      .from("exam_questions")
      .select("*")
      .eq("exam_id", examId);

    if (!error) setAttachedQuestions(data || []);
  };

  // ✅ Manual add (direct insert into exam_questions)
  const handleManualAdd = async () => {
    if (!newQ.question || !newQ.correct_answer) {
      alert("⚠️ Question text & correct answer required!");
      return;
    }

    const payload = {
      exam_id: examId,
      question: newQ.question,
      options: {
        a: newQ.option_a,
        b: newQ.option_b,
        c: newQ.option_c,
        d: newQ.option_d,
      },
      correct_answer: newQ.correct_answer,
      solution: newQ.solution || null, // ✅ new field
    };

    const { error } = await supabase.from("exam_questions").insert([payload]);

    if (error) {
      alert("❌ Failed: " + error.message);
      return;
    }

    alert("✅ Question added!");
    setNewQ({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_answer: "",
      solution: "",
    });
    fetchAttachedQuestions();
  };

  // ✅ Remove
  const handleRemove = async (id) => {
    if (!window.confirm("Remove this question from exam?")) return;
    const { error } = await supabase
      .from("exam_questions")
      .delete()
      .eq("id", id);

    if (!error) fetchAttachedQuestions();
  };

  return (
    <div className="p-6">
      {exam && (
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-purple-600">
            Manage Exam Questions – {exam.title}
          </h1>
        </div>
      )}

      {/* Manual Add */}
      <h2 className="text-lg font-bold text-pink-600 mt-6 mb-2">
        ✍️ Add Question Manually
      </h2>
      <div className="space-y-2 bg-white p-4 shadow rounded">
        <input
          type="text"
          placeholder="Question Text"
          value={newQ.question}
          onChange={(e) => setNewQ({ ...newQ, question: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Option A"
          value={newQ.option_a}
          onChange={(e) => setNewQ({ ...newQ, option_a: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Option B"
          value={newQ.option_b}
          onChange={(e) => setNewQ({ ...newQ, option_b: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Option C"
          value={newQ.option_c}
          onChange={(e) => setNewQ({ ...newQ, option_c: e.target.value })}
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Option D"
          value={newQ.option_d}
          onChange={(e) => setNewQ({ ...newQ, option_d: e.target.value })}
          className="w-full border p-2 rounded"
        />

        {/* ✅ Correct Answer Dropdown */}
        <select
          value={newQ.correct_answer}
          onChange={(e) =>
            setNewQ({ ...newQ, correct_answer: e.target.value })
          }
          className="w-full border p-2 rounded"
        >
          <option value="">Select Correct Answer</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>

        {/* ✅ Solution Textarea */}
        <textarea
          placeholder="Write solution/explanation here..."
          value={newQ.solution}
          onChange={(e) => setNewQ({ ...newQ, solution: e.target.value })}
          className="w-full border p-2 rounded"
          rows={3}
        ></textarea>

        <button
          onClick={handleManualAdd}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          ➕ Add Question
        </button>
      </div>

      {/* Already Attached */}
      <h2 className="text-lg font-bold text-blue-600 mt-6 mb-2">
        📋 Attached to Exam
      </h2>
      <ul className="space-y-2">
        {attachedQuestions.map((q) => (
          <li key={q.id} className="p-3 border rounded bg-gray-50">
            <p className="font-semibold">{q.question}</p>
            <ul className="ml-4 text-sm text-gray-700">
              <li>A: {q.options?.a}</li>
              <li>B: {q.options?.b}</li>
              <li>C: {q.options?.c}</li>
              <li>D: {q.options?.d}</li>
            </ul>
            <p className="text-green-600">✅ Correct: {q.correct_answer}</p>
            {q.solution && (
              <p className="text-blue-600 mt-1">📘 Solution: {q.solution}</p>
            )}
            <button
              onClick={() => handleRemove(q.id)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
            >
              ❌ Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManageExamQuestions;
