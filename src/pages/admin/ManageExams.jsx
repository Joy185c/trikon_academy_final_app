import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseclient.js";

function ManageExams() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    exam_type: "MCQ",
    start_time: "",
    end_time: "",
    total_marks: 100,
  });

  const [editingExam, setEditingExam] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (form.course_id) {
      fetchExams(form.course_id);
    } else {
      setExams([]);
    }
  }, [form.course_id]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, title")
      .order("created_at", { ascending: true });
    if (!error) setCourses(data || []);
  };

  const fetchExams = async (courseId) => {
    const { data, error } = await supabase
      .from("exams")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });
    if (!error) setExams(data || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.course_id) {
      alert("⚠️ Please select a course first!");
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      // ❌ don't convert to UTC → keep as local ISO string
      start_time: form.start_time,
      end_time: form.end_time,
      total_marks: parseInt(form.total_marks, 10),
    };

    const { data, error } = await supabase.from("exams").insert([payload]).select();
    if (!error && data) {
      alert("✅ Exam created!");
      fetchExams(form.course_id);
      setForm({
        ...form,
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        total_marks: 100,
      });
    } else {
      alert("❌ " + error.message);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", examId);
    if (!error) {
      setExams(exams.filter((exam) => exam.id !== examId));
    } else {
      alert("❌ " + error.message);
    }
  };

  const handleEditSave = async () => {
    const payload = {
      ...editingExam,
      title: editingExam.title.trim(),
      description: editingExam.description.trim(),
      start_time: editingExam.start_time,
      end_time: editingExam.end_time,
      total_marks: parseInt(editingExam.total_marks, 10),
    };

    const { error } = await supabase
      .from("exams")
      .update(payload)
      .eq("id", editingExam.id);

    if (!error) {
      alert("✅ Exam updated!");
      fetchExams(form.course_id);
      setEditingExam(null);
    } else {
      alert("❌ " + error.message);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-6 text-center">
        📘 Manage Exams
      </h1>

      {/* Create Exam Form */}
      <form
        onSubmit={handleCreate}
        className="grid gap-3 bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6 mb-10 max-w-2xl mx-auto border border-purple-100"
      >
        <select
          value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
          required
        >
          <option value="">-- Select Course --</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Exam Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          required
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
        ></textarea>

        <select
          value={form.exam_type}
          onChange={(e) => setForm({ ...form, exam_type: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option value="MCQ">MCQ</option>
          <option value="WRITTEN">WRITTEN</option>
          <option value="MIXED">MIXED</option>
        </select>

        <input
          type="datetime-local"
          value={form.start_time}
          onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-400 outline-none"
          required
        />

        <input
          type="datetime-local"
          value={form.end_time}
          onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
          required
        />

        <input
          type="number"
          placeholder="Total Marks"
          value={form.total_marks}
          onChange={(e) => setForm({ ...form, total_marks: e.target.value })}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90 transition"
        >
          ➕ Create Exam
        </button>
      </form>

      {/* Exam List */}
      <h2 className="text-2xl font-bold text-indigo-600 mb-4 text-center">
        📋 Existing Exams
      </h2>
      {exams.length === 0 ? (
        <p className="text-gray-500 text-center">❌ No exams found for this course.</p>
      ) : (
        <ul className="space-y-4 max-w-3xl mx-auto">
          {exams.map((exam) => (
            <li
              key={exam.id}
              className="p-5 rounded-2xl shadow-md bg-white hover:shadow-xl transition border border-gray-100"
            >
              <p className="font-bold text-lg text-purple-700">{exam.title}</p>
              <p className="text-gray-700">{exam.description}</p>
              <p className="text-sm text-gray-600 mt-1">
                Type: <span className="font-semibold">{exam.exam_type}</span> | Marks:{" "}
                {exam.total_marks}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(exam.start_time).toLocaleString()} →{" "}
                {new Date(exam.end_time).toLocaleString()}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to={`/admin/exams/${exam.id}/questions`}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1.5 rounded-lg shadow hover:opacity-90 transition"
                >
                  ⚙️ Manage Questions
                </Link>

                <button
                  onClick={() => setEditingExam(exam)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-1.5 rounded-lg shadow hover:opacity-90 transition"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(exam.id)}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-1.5 rounded-lg shadow hover:opacity-90 transition"
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {editingExam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-lg">
            <h2 className="font-bold text-xl mb-4 text-purple-600">✏️ Edit Exam</h2>

            <input
              type="text"
              value={editingExam.title}
              onChange={(e) =>
                setEditingExam({ ...editingExam, title: e.target.value })
              }
              className="border w-full px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-purple-400 outline-none"
            />

            <textarea
              value={editingExam.description}
              onChange={(e) =>
                setEditingExam({ ...editingExam, description: e.target.value })
              }
              className="border w-full px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-pink-400 outline-none"
            ></textarea>

            <input
              type="datetime-local"
              value={editingExam.start_time.slice(0, 16)}
              onChange={(e) =>
                setEditingExam({ ...editingExam, start_time: e.target.value })
              }
              className="border w-full px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-purple-400 outline-none"
            />

            <input
              type="datetime-local"
              value={editingExam.end_time.slice(0, 16)}
              onChange={(e) =>
                setEditingExam({ ...editingExam, end_time: e.target.value })
              }
              className="border w-full px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-pink-400 outline-none"
            />

            <input
              type="number"
              value={editingExam.total_marks}
              onChange={(e) =>
                setEditingExam({ ...editingExam, total_marks: e.target.value })
              }
              className="border w-full px-4 py-2 rounded-lg mb-3 focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setEditingExam(null)}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg shadow hover:opacity-90"
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-lg shadow hover:opacity-90"
              >
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageExams;
