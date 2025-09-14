// src/pages/admin/AdminExams.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseclient.js";

function AdminExams() {
  const [papers, setPapers] = useState([]);
  const [newPaper, setNewPaper] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  // 📌 Load Exams
  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("exams")
      .select("id, title, course_id")
      .order("created_at", { ascending: false });
    if (!error) setPapers(data);
    setLoading(false);
  };

  // 📌 Load Courses
  const fetchCourses = async () => {
    const { data, error } = await supabase.from("courses").select("id, title");
    if (!error) setCourses(data);
  };

  // ➕ Add Exam
  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!newPaper.trim() || !selectedCourse) return;

    const { error } = await supabase
      .from("exams")
      .insert([{ title: newPaper, course_id: selectedCourse }]);
    if (!error) {
      setNewPaper("");
      setSelectedCourse("");
      fetchExams();
    }
  };

  // ✏️ Update Exam Title
  const handleUpdateExam = async (id, newTitle) => {
    const { error } = await supabase
      .from("exams")
      .update({ title: newTitle })
      .eq("id", id);
    if (!error) fetchExams();
  };

  // 🗑️ Delete Exam
  const handleDeleteExam = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (!error) fetchExams();
  };

  if (loading) return <p className="p-8">Loading exams...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">📝 Manage Exams</h1>

      {/* Add New Exam */}
      <form onSubmit={handleAddExam} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New exam/paper title"
          value={newPaper}
          onChange={(e) => setNewPaper(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">Select Course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add
        </button>
      </form>

      {/* Exam List */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left">Exam Title</th>
            <th className="p-3 text-left">Course</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {papers.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-3">
                <input
                  type="text"
                  defaultValue={p.title}
                  onBlur={(e) => handleUpdateExam(p.id, e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </td>
              <td className="p-3">
                {courses.find((c) => c.id === p.course_id)?.title || "—"}
              </td>
              <td className="p-3 flex gap-2">
                <Link
                  to={`/admin/exams/${p.id}/questions`}
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                >
                  Manage Questions
                </Link>
                <button
                  onClick={() => handleDeleteExam(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {papers.length === 0 && (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                No exams found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminExams;
