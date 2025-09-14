import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";
import { Link } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndData = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (data.user) {
        let { data: enrolledCourses } = await supabase
          .from("enrollments")
          .select("courses(id, title, description, price, thumbnail)")
          .eq("student_id", data.user.id);

        if (enrolledCourses) setEnrollments(enrolledCourses);

        let { data: exams } = await supabase
          .from("exam_attempts")
          .select("id, paper_id, score, created_at")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (exams) setRecentExams(exams);
      }
      setLoading(false);
    };
    getUserAndData();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-10 text-blue-600 font-semibold animate-pulse">
        ⏳ Loading dashboard...
      </p>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-lg text-gray-600">
          ⚠️ Please login to access your dashboard.
        </p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Courses Enrolled",
      value: enrollments.length,
    },
    {
      title: "Last Enrolled",
      value:
        enrollments.length > 0
          ? enrollments[enrollments.length - 1].courses.title
          : "N/A",
    },
    {
      title: "Go to My Courses",
      value: (
        <Link
          to="/my-courses"
          className="inline-block mt-2 bg-white/70 backdrop-blur-sm text-purple-700 font-bold px-4 py-2 rounded-lg hover:bg-white/90 transition"
        >
          View Courses
        </Link>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow">
        👋 Welcome, {user.email}
      </h1>

      {/* Quick Stats (Glass Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="relative p-6 rounded-2xl shadow-xl text-center 
                       bg-white/20 backdrop-blur-lg border border-white/30 
                       hover:scale-105 transform transition duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-30 rounded-2xl"></div>
            <div className="relative z-10">
              <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
                {card.title}
              </h2>
              <p className="text-2xl md:text-3xl font-extrabold mt-3 text-indigo-700 drop-shadow">
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Enrolled Courses */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        📚 Your Enrolled Courses:
      </h2>
      {enrollments.length === 0 ? (
        <p className="text-gray-600">❌ You haven’t enrolled in any courses yet.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {enrollments.map((en) => (
            <Link
              key={en.courses.id}
              to={`/course/${en.courses.id}`}
              className="group block rounded-xl overflow-hidden shadow-md 
                         hover:shadow-xl transition transform hover:-translate-y-1
                         bg-white/40 backdrop-blur-md border border-white/50"
            >
              {/* Thumbnail */}
              {en.courses.thumbnail && (
                <div className="relative w-full h-40">
                  <img
                    src={en.courses.thumbnail}
                    alt={en.courses.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
              )}

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-blue-700 mb-1 group-hover:underline">
                  {en.courses.title}
                </h3>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {en.courses.description}
                </p>
                <p className="text-green-700 font-semibold mt-3">
                  {en.courses.price} Tk.
                </p>
              </div>
            </Link>
          ))}
        </ul>
      )}

      {/* Recent Exams */}
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {/* 📝 Recent Exam Attempts: */}
      </h2>
      {recentExams.length === 0 ? (
        <p className="text-gray-600">Hard work beats talent’ when talent doesn't work hard.</p>
      ) : (
        <ul className="space-y-3">
          {recentExams.map((exam) => (
            <li
              key={exam.id}
              className="flex justify-between items-center px-4 py-3 rounded-xl 
                         bg-white/30 backdrop-blur-lg border border-white/40 
                         shadow-sm hover:shadow-md transition"
            >
              <span className="font-medium text-gray-800">
                📘 Paper ID: {exam.paper_id}
              </span>
              <span className="text-green-700 font-bold">
                ✅ {exam.score}%
              </span>
              <span className="text-sm text-gray-600">
                {new Date(exam.created_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
