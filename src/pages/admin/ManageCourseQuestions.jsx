import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { BlockMath } from "react-katex"; // ✅ KaTeX support
import "katex/dist/katex.min.css";

function ManageCourseQuestions() {
  const { courseId } = useParams(); 
  const [questions, setQuestions] = useState([]);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedUni, setSelectedUni] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBankIds, setSelectedBankIds] = useState([]);

  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    solution: "", // ✅ added solution field
  });

  useEffect(() => {
    fetchCourseQuestions();
    fetchUniversities();
  }, [courseId]);

  // 🔹 Load course-specific questions
  const fetchCourseQuestions = async () => {
    const { data, error } = await supabase
      .from("course_questions")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (!error) setQuestions(data || []);
  };

  // 🔹 Load universities
  const fetchUniversities = async () => {
    const { data, error } = await supabase.from("universities").select("*");
    if (!error) setUniversities(data || []);
  };

  // 🔹 Load years based on university
  const fetchYears = async (uniId) => {
    const { data, error } = await supabase
      .from("years")
      .select("*")
      .eq("university_id", uniId);
    if (!error) setYears(data || []);
  };

  // 🔹 Load questions from bank
  const fetchBankQuestions = async () => {
    if (!selectedUni || !selectedYear) return;
    const { data, error } = await supabase
      .from("question_bank")
      .select("*")
      .eq("university_id", selectedUni)
      .eq("year_id", selectedYear);
    if (!error) setBankQuestions(data || []);
  };

  // 🔹 Add custom question
  const handleAddCustom = async (e) => {
    e.preventDefault();
    const payload = { ...form, course_id: courseId };
    const { error } = await supabase.from("course_questions").insert([payload]);
    if (!error) {
      alert("✅ Question added to course!");
      setForm({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        solution: "", // reset solution
      });
      fetchCourseQuestions();
    } else {
      alert("❌ " + error.message);
    }
  };

  // 🔹 Import from question bank
  const handleImport = async () => {
    if (selectedBankIds.length === 0) {
      alert("⚠️ No questions selected!");
      return;
    }

    const selectedQuestions = bankQuestions.filter((q) =>
      selectedBankIds.includes(q.id)
    );

    const payload = selectedQuestions.map((q) => ({
      course_id: courseId,
      question: q.question,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      solution: q.solution || "", // ✅ copy solution also
    }));

    const { error } = await supabase.from("course_questions").insert(payload);
    if (!error) {
      alert("✅ Imported successfully!");
      setSelectedBankIds([]);
      fetchCourseQuestions();
    } else {
      alert("❌ Import failed: " + error.message);
    }
  };

  // 🔹 Delete question
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    const { error } = await supabase
      .from("course_questions")
      .delete()
      .eq("id", id);
    if (!error) fetchCourseQuestions();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-600">
        📘 Manage Course Questions
      </h1>

      {/* Add Custom Question */}
      <form
        onSubmit={handleAddCustom}
        className="grid gap-2 bg-gray-50 p-4 rounded mb-6 max-w-xl"
      >
        <textarea
          placeholder="Question"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
          className="border px-3 py-2 rounded"
        ></textarea>

        {["a", "b", "c", "d"].map((opt) => (
          <input
            key={opt}
            type="text"
            placeholder={`Option ${opt.toUpperCase()}`}
            value={form[`option_${opt}`]}
            onChange={(e) =>
              setForm({ ...form, [`option_${opt}`]: e.target.value })
            }
            className="border px-3 py-2 rounded"
          />
        ))}

        <select
          value={form.correct_answer}
          onChange={(e) =>
            setForm({ ...form, correct_answer: e.target.value })
          }
          className="border px-3 py-2 rounded"
        >
          <option value="A">Correct: A</option>
          <option value="B">Correct: B</option>
          <option value="C">Correct: C</option>
          <option value="D">Correct: D</option>
        </select>

        {/* ✅ Solution Box */}
        <textarea
          placeholder="Solution / Explanation (LaTeX supported)"
          value={form.solution}
          onChange={(e) => setForm({ ...form, solution: e.target.value })}
          className="border px-3 py-2 rounded"
        ></textarea>

        {form.solution && (
          <div className="p-2 bg-white border rounded">
            <BlockMath math={form.solution} />
          </div>
        )}

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Add Custom Question
        </button>
      </form>

      {/* Import from Question Bank */}
      <div className="mb-6">
        <h2 className="font-bold mb-2 text-blue-600">
          📚 Import from Question Bank
        </h2>

        <div className="flex gap-2 mb-3">
          <select
            value={selectedUni}
            onChange={(e) => {
              setSelectedUni(e.target.value);
              fetchYears(e.target.value);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select University</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Select Year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.year_name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchBankQuestions}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load
          </button>
        </div>

        {bankQuestions.length > 0 && (
          <>
            <table className="min-w-full bg-white shadow rounded mb-2">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2">Select</th>
                  <th className="p-2">Question</th>
                  <th className="p-2">Answer</th>
                </tr>
              </thead>
              <tbody>
                {bankQuestions.map((q) => (
                  <tr key={q.id} className="border-b">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedBankIds.includes(q.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBankIds([...selectedBankIds, q.id]);
                          } else {
                            setSelectedBankIds(
                              selectedBankIds.filter((id) => id !== q.id)
                            );
                          }
                        }}
                      />
                    </td>
                    <td className="p-2">{q.question}</td>
                    <td className="p-2">{q.correct_answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleImport}
              className="bg-purple-600 text-white px-4 py-2 rounded"
            >
              📥 Import Selected
            </button>
          </>
        )}
      </div>

      {/* Course Questions List */}
      <h2 className="font-bold mb-2 text-indigo-600">📋 Course Questions</h2>
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">Question</th>
            <th className="p-2 text-left">Answer</th>
            <th className="p-2 text-left">Solution</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className="border-b">
              <td className="p-2">{q.question}</td>
              <td className="p-2 text-green-600">{q.correct_answer}</td>
              <td className="p-2 text-gray-700">
                {q.solution ? <BlockMath math={q.solution} /> : "—"}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(q.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  ❌ Delete
                </button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No course questions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ManageCourseQuestions;
