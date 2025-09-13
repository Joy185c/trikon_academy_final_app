import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { BlockMath } from "react-katex"; // ✅ Import KaTeX
import "katex/dist/katex.min.css"; // ensure css loaded

function AdminQuestionBank() {
  const [universities, setUniversities] = useState([]);
  const [years, setYears] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [newUniversity, setNewUniversity] = useState("");
  const [newYear, setNewYear] = useState("");

  const [form, setForm] = useState({
    university_id: "",
    year_id: "",
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    solution: "", // ✅ নতুন ফিল্ড
  });

  useEffect(() => {
    fetchUniversities();
  }, []);

  // ✅ Universities
  const fetchUniversities = async () => {
    let { data, error } = await supabase.from("universities").select("*");
    if (!error) setUniversities(data || []);
  };

  const addUniversity = async () => {
    if (!newUniversity.trim()) return;
    const { error } = await supabase
      .from("universities")
      .insert([{ name: newUniversity }]);
    if (!error) {
      alert("✅ University added!");
      setNewUniversity("");
      fetchUniversities();
    }
  };

  // ✅ Years
  const fetchYears = async (uniId) => {
    let { data, error } = await supabase
      .from("years")
      .select("*")
      .eq("university_id", uniId)
      .order("year_name", { ascending: true });
    if (!error) setYears(data || []);
  };

  const addYear = async () => {
    if (!newYear.trim() || !form.university_id) {
      alert("⚠️ Select a university first");
      return;
    }
    const { error } = await supabase
      .from("years")
      .insert([{ university_id: form.university_id, year_name: newYear }]);

    if (!error) {
      alert("✅ Year added!");
      setNewYear("");
      fetchYears(form.university_id); // refresh dropdown
    }
  };

  // ✅ Questions
  const fetchQuestions = async () => {
    if (!form.university_id || !form.year_id) return;
    let { data, error } = await supabase
      .from("question_bank")
      .select("*")
      .eq("university_id", form.university_id)
      .eq("year_id", form.year_id)
      .order("created_at", { ascending: false });
    if (!error) setQuestions(data || []);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("question_bank").insert([form]);
    if (!error) {
      alert("✅ Question added!");
      setForm({
        ...form,
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        solution: "", // ✅ reset solution
      });
      fetchQuestions();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await supabase.from("question_bank").delete().eq("id", id);
    fetchQuestions();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        📖 Manage Question Bank
      </h1>

      {/* University Add */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="New University Name"
          value={newUniversity}
          onChange={(e) => setNewUniversity(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={addUniversity}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Add University
        </button>
      </div>

      {/* Select University */}
      <select
        value={form.university_id}
        onChange={(e) => {
          setForm({ ...form, university_id: e.target.value, year_id: "" });
          fetchYears(e.target.value);
          setQuestions([]);
        }}
        className="border px-3 py-2 rounded mb-3"
      >
        <option value="">Select University</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>

      {/* Year Add */}
      {form.university_id && (
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="New Year (e.g. 2023)"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            onClick={addYear}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Year
          </button>
        </div>
      )}

      {/* Select Year */}
      {form.university_id && (
        <div className="flex gap-2 mb-4">
          <select
            value={form.year_id}
            onChange={(e) => setForm({ ...form, year_id: e.target.value })}
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
            onClick={fetchQuestions}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load Questions
          </button>
        </div>
      )}

      {/* Question Add Form */}
      {form.university_id && form.year_id && (
        <form
          onSubmit={handleAddQuestion}
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

          {/* ✅ Live Preview */}
          {form.solution && (
            <div className="p-3 bg-white border rounded">
              <p className="text-gray-600 font-bold mb-2">Preview:</p>
              <BlockMath math={form.solution} />
            </div>
          )}

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Question
          </button>
        </form>
      )}

      {/* Questions List */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-2 text-left">Question</th>
            <th className="p-2 text-left">Options</th>
            <th className="p-2 text-left">Answer</th>
            <th className="p-2 text-left">Solution</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.id} className="border-b">
              <td className="p-2">{q.question}</td>
              <td className="p-2 text-sm">
                A. {q.option_a} <br />
                B. {q.option_b} <br />
                C. {q.option_c} <br />
                D. {q.option_d}
              </td>
              <td className="p-2 font-bold text-green-600">
                {q.correct_answer}
              </td>
              <td className="p-2 text-sm text-gray-700">
                {q.solution ? <BlockMath math={q.solution} /> : "—"}
              </td>
              <td className="p-2">
                <button
                  onClick={() => handleDelete(q.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No questions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminQuestionBank;
