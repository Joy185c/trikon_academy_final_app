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

  // Import modal state
  const [showImport, setShowImport] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);

  // ✅ Filter + Dropdown data
  const [filterUniversity, setFilterUniversity] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [universities, setUniversities] = useState([]);
  const [years, setYears] = useState([]);

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

  // ✅ Manual add
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
      solution: newQ.solution || null,
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

  // ✅ Fetch distinct universities
  const fetchUniversities = async () => {
    const { data, error } = await supabase
      .from("question_bank")
      .select("university_id, university_name");

    if (!error && data) {
      // unique universities
      const unique = Array.from(
        new Map(data.map((item) => [item.university_id, item])).values()
      );
      setUniversities(unique);
    }
  };

  // ✅ Fetch distinct years for selected university
  const fetchYears = async (uniId) => {
    const { data, error } = await supabase
      .from("question_bank")
      .select("year_id")
      .eq("university_id", uniId);

    if (!error && data) {
      const unique = [...new Set(data.map((d) => d.year_id))];
      setYears(unique);
    }
  };

  // ✅ Fetch Question Bank (with filters)
  const fetchBankQuestions = async () => {
    setLoadingBank(true);

    let query = supabase.from("question_bank").select("*");

    if (filterUniversity) {
      query = query.eq("university_id", parseInt(filterUniversity));
    }
    if (filterYear) {
      query = query.eq("year_id", parseInt(filterYear));
    }

    const { data, error } = await query.limit(50);

    if (!error) setBankQuestions(data || []);
    setLoadingBank(false);
  };

  // ✅ Import from Question Bank
  const handleImportFromBank = async (bankQ) => {
    const payload = {
      exam_id: examId,
      question: bankQ.question,
      options: {
        a: bankQ.option_a,
        b: bankQ.option_b,
        c: bankQ.option_c,
        d: bankQ.option_d,
      },
      correct_answer: bankQ.correct_answer,
      solution: bankQ.solution || null,
    };

    const { error } = await supabase.from("exam_questions").insert([payload]);

    if (error) {
      alert("❌ Import failed: " + error.message);
      return;
    }

    alert("✅ Imported from Question Bank!");
    fetchAttachedQuestions();
  };

  // ✅ Load universities on import modal open
  useEffect(() => {
    if (showImport) {
      fetchUniversities();
    }
  }, [showImport]);

  // ✅ Update years when university changes
  useEffect(() => {
    if (filterUniversity) {
      fetchYears(filterUniversity);
    } else {
      setYears([]);
      setFilterYear("");
    }
  }, [filterUniversity]);

  return (
    <div className="p-6">
      {exam && (
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">
            Manage Exam Questions – {exam.title}
          </h1>

          {/* Import Button */}
          <button
            onClick={() => {
              setShowImport(true);
              fetchBankQuestions();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            📥 Import from Question Bank
          </button>
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
          onChange={(e) => setNewQ({ ...newQ, correct_answer: e.target.value })}
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

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-green-600">
                📥 Import from Question Bank
              </h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-red-600 font-bold"
              >
                ✖
              </button>
            </div>

            {/* ✅ Filter Form with dropdowns */}
            <div className="flex gap-2 mb-4">
              <select
                value={filterUniversity}
                onChange={(e) => setFilterUniversity(e.target.value)}
                className="border p-2 rounded flex-1"
              >
                <option value="">Select University</option>
                {universities.map((u) => (
                  <option key={u.university_id} value={u.university_id}>
                    {u.university_name || `University ${u.university_id}`}
                  </option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                disabled={!filterUniversity}
                className="border p-2 rounded flex-1"
              >
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={fetchBankQuestions}
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                🔍 Apply
              </button>
            </div>

            {loadingBank ? (
              <p className="text-center text-blue-600">
                ⏳ Loading questions...
              </p>
            ) : bankQuestions.length === 0 ? (
              <p className="text-center text-gray-500">
                ❌ No questions found in Question Bank
              </p>
            ) : (
              <ul className="space-y-3">
                {bankQuestions.map((q) => (
                  <li
                    key={q.id}
                    className="border p-3 rounded bg-gray-50 shadow-sm"
                  >
                    <p className="font-semibold">{q.question}</p>
                    <ul className="ml-4 text-sm text-gray-700">
                      <li>A: {q.option_a}</li>
                      <li>B: {q.option_b}</li>
                      <li>C: {q.option_c}</li>
                      <li>D: {q.option_d}</li>
                    </ul>
                    <p className="text-green-600">
                      ✅ Correct: {q.correct_answer}
                    </p>
                    {q.solution && (
                      <p className="text-blue-600 mt-1">📘 {q.solution}</p>
                    )}
                    <button
                      onClick={() => handleImportFromBank(q)}
                      className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                    >
                      📥 Import
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExamQuestions;
