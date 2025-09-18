// src/pages/AdminDashboard.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";

function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalExams, setTotalExams] = useState(0);

  // ✅ Live Quiz states
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "A",
    solution: "",
  });

  useEffect(() => {
    // Students
    const fetchStudents = async () => {
      const { count } = await supabase
        .from("student_users")
        .select("*", { count: "exact", head: true })
        .eq("role", "student");
      setTotalStudents(count || 0);
    };

    // Courses
    const fetchCourses = async () => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true });
      setTotalCourses(count || 0);
    };

    // Exams
    const fetchExams = async () => {
      const { count } = await supabase
        .from("exams")
        .select("*", { count: "exact", head: true });
      setTotalExams(count || 0);
    };

    fetchStudents();
    fetchCourses();
    fetchExams();

    // ✅ Fetch quizzes
    fetchQuizzes();
  }, []);

  // ✅ Quiz handlers
  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("live_quiz")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setQuizzes(data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("live_quiz").insert([form]);
    if (error) {
      alert("❌ Failed to add quiz");
    } else {
      alert("✅ Quiz added!");
      setForm({
        question: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
        solution: "",
      });
      fetchQuizzes();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this quiz?")) return;
    const { error } = await supabase.from("live_quiz").delete().eq("id", id);
    if (!error) fetchQuizzes();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-rose-50">
      {/* 🔹 Header */}
      <header className="w-full flex items-center justify-center py-6 shadow-lg bg-gradient-to-r from-teal-100/70 via-emerald-100/50 to-rose-100/50 backdrop-blur-lg">
        <h1
          className="
            font-extrabold 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-teal-600 via-emerald-500 to-rose-500
            drop-shadow-md
            animate-pulse
            text-xl sm:text-3xl md:text-4xl lg:text-5xl
            text-center
            px-4
          "
        >
          🌟 Trikon Academy - Admin Dashboard
        </h1>
      </header>

      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300">
          <h2 className="text-lg font-semibold text-teal-600">👩‍🎓 Total Students</h2>
          <p className="text-4xl font-extrabold text-teal-800">{totalStudents}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300">
          <h2 className="text-lg font-semibold text-emerald-600">📚 Total Courses</h2>
          <p className="text-4xl font-extrabold text-emerald-800">{totalCourses}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition duration-300">
          <h2 className="text-lg font-semibold text-rose-600">📝 Total Exams</h2>
          <p className="text-4xl font-extrabold text-rose-800">{totalExams}</p>
        </div>
      </div>

      {/* 🔹 Manage Platform */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ⚡ Manage Platform
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          <Link
            to="/admin/users"
            className="p-6 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-teal-700 mb-2">👥 Manage Users</h3>
            <p className="text-gray-700 text-sm">
              View, edit roles, and manage all users.
            </p>
          </Link>

          <Link
            to="/admin/courses"
            className="p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-emerald-700 mb-2">📚 Manage Courses</h3>
            <p className="text-gray-700 text-sm">
              Add, edit or remove courses.
            </p>
          </Link>

          <Link
            to="/admin/exams"
            className="p-6 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-rose-700 mb-2">📝 Manage Exams</h3>
            <p className="text-gray-700 text-sm">
              Schedule and monitor exams.
            </p>
          </Link>

          <Link
            to="/admin/question-bank"
            className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-purple-700 mb-2">
              📑 Manage Question Bank
            </h3>
            <p className="text-gray-700 text-sm">
              Add, edit, and delete university questions.
            </p>
          </Link>

          {/* ✅ Payment Settings */}
          <Link
            to="/admin/bkash-settings"
            className="p-6 bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-pink-700 mb-2">⚙️ Payment Settings</h3>
            <p className="text-gray-700 text-sm">
              Update your bKash number for course payments.
            </p>
          </Link>

          {/* ✅ Enrollment Requests */}
          <Link
            to="/admin/payments"
            className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition"
          >
            <h3 className="font-bold text-yellow-700 mb-2">💳 Enrollment Requests</h3>
            <p className="text-gray-700 text-sm">
              Approve or reject student payment requests.
            </p>
          </Link>
        </div>
      </div>

      {/* 🔹 Manage Live Quiz */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Manage Live Quiz</h2>

        {/* Quiz Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 bg-white/60 p-4 rounded-xl shadow"
        >
          <input
            type="text"
            name="question"
            placeholder="Question"
            value={form.question}
            onChange={handleChange}
            className="border p-2 rounded col-span-2"
          />
          <input
            type="text"
            name="option_a"
            placeholder="Option A"
            value={form.option_a}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="option_b"
            placeholder="Option B"
            value={form.option_b}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="option_c"
            placeholder="Option C"
            value={form.option_c}
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="option_d"
            placeholder="Option D"
            value={form.option_d}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <select
            name="correct_answer"
            value={form.correct_answer}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="A">Correct: A</option>
            <option value="B">Correct: B</option>
            <option value="C">Correct: C</option>
            <option value="D">Correct: D</option>
          </select>
          <input
            type="text"
            name="solution"
            placeholder="Solution"
            value={form.solution}
            onChange={handleChange}
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white rounded px-4 py-2 col-span-2"
          >
            ➕ Add Quiz
          </button>
        </form>

        {/* Quiz List */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border bg-white/60 rounded-xl shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Question</th>
                <th className="border p-2">Answer</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((q) => (
                <tr key={q.id}>
                  <td className="border p-2">{q.question}</td>
                  <td className="border p-2">{q.correct_answer}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 p-4">
                    No quizzes added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
