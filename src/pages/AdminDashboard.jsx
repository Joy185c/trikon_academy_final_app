// src/pages/AdminDashboard.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";

function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalExams, setTotalExams] = useState(0);

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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-rose-50">
      {/* 🔹 Header */}
      <header className="w-full flex items-center justify-center py-6 shadow-lg bg-gradient-to-r from-teal-100/60 via-emerald-100/50 to-rose-100/50 backdrop-blur-lg">
        <h1
          className="
            font-extrabold 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-teal-600 via-emerald-500 to-rose-500
            drop-shadow-md
            animate-pulse
            text-lg sm:text-2xl md:text-3xl lg:text-4xl
            text-center
            px-4
          "
        >
          Trikon Academy - Admin Dashboard
        </h1>
      </header>

      {/* 🔹 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-300">
          <h2 className="text-lg font-semibold text-teal-600">👩‍🎓 Total Students</h2>
          <p className="text-4xl font-extrabold text-teal-800">{totalStudents}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-300">
          <h2 className="text-lg font-semibold text-emerald-600">📚 Total Courses</h2>
          <p className="text-4xl font-extrabold text-emerald-800">{totalCourses}</p>
        </div>

        <div className="bg-white/40 backdrop-blur-lg border border-white/30 p-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-300">
          <h2 className="text-lg font-semibold text-rose-600">📝 Total Exams</h2>
          <p className="text-4xl font-extrabold text-rose-800">{totalExams}</p>
        </div>
      </div>

      {/* 🔹 Manage Platform */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          ⚡ Manage Platform
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
