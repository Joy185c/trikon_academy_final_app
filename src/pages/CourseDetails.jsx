import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseclient.js";

function CourseDetails() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState(0);

  // ✅ Fetch Course + Content
  useEffect(() => {
    const fetchData = async () => {
      const { data: courseData } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();
      setCourse(courseData);

      const { data: lectureData } = await supabase
        .from("lectures")
        .select("*")
        .eq("course_id", courseId);
      setLectures(lectureData || []);

      const { data: assignmentData } = await supabase
        .from("assignments")
        .select("*")
        .eq("course_id", courseId);
      setAssignments(assignmentData || []);

      const { data: examData } = await supabase
        .from("exams")
        .select("*")
        .eq("course_id", courseId);

      if (examData) {
        const now = new Date();
        const processedExams = examData.map((exam) => {
          const start = new Date(exam.start_time);
          const end = new Date(exam.end_time);

          let status = "upcoming";
          if (now >= start && now <= end) status = "live";
          else if (now > end) status = "past";

          return { ...exam, status };
        });
        setExams(processedExams);
      }
    };

    fetchData();
  }, [courseId]);

  // ✅ Calculate Progress
  useEffect(() => {
    const totalTasks =
      lectures.length + assignments.length + exams.length;
    const completedTasks =
      lectures.filter((l) => l.completed).length +
      assignments.filter(
        (a) => a.status === "graded" || a.status === "submitted"
      ).length +
      exams.filter((e) => e.status === "past").length;

    if (totalTasks > 0) {
      setProgress(Math.round((completedTasks / totalTasks) * 100));
    } else {
      setProgress(0);
    }
  }, [lectures, assignments, exams]);

  // 🏆 Leaderboard Fetch
  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select(`
          score,
          user_id,
          users!inner (
            id,
            name,
            email
          ),
          exams!inner (
            course_id
          )
        `)
        .eq("exams.course_id", courseId);

      if (error) {
        console.error(error);
        return;
      }

      // ✅ highest score per user
      const scoresByUser = {};
      data.forEach((row) => {
        if (
          !scoresByUser[row.user_id] ||
          row.score > scoresByUser[row.user_id].score
        ) {
          scoresByUser[row.user_id] = {
            name: row.users.name || row.users.email,
            score: row.score,
          };
        }
      });

      // Array বানানো + sort
      const sorted = Object.values(scoresByUser).sort(
        (a, b) => b.score - a.score
      );

      setLeaderboard(sorted);
    };

    fetchLeaderboard();
  }, [courseId]);

  if (!course) {
    return <p className="text-center mt-10">Loading course details...</p>;
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 drop-shadow-lg">
          📘 {course.title}
        </h1>
        <p className="text-slate-600 mt-3">{course.description}</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <h2 className="font-semibold text-slate-700">Overall Progress</h2>
        <div className="w-full bg-slate-200 rounded-full h-5 mt-2 shadow-inner">
          <div
            className="h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm mt-2 text-slate-600">{progress}% completed</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        {["overview", "lectures", "assignments", "exams", "leaderboard"].map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full font-semibold shadow-md transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 flex items-center gap-2">
            📖 Overview
          </h2>
          <p>
            <strong>Instructor:</strong> {course.instructor || "Naushin Jannat"}
          </p>
          <p>
            <strong>Duration:</strong> {course.duration || "N/A"}
          </p>
          <p className="mt-3 text-slate-600">
            You are enrolled in this course. Complete lectures, assignments and
            exams to track your progress.
          </p>
        </div>
      )}

      {/* Lectures */}
      {activeTab === "lectures" && (
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 flex items-center gap-2">
            🎥 Lectures
          </h2>
          {lectures.length === 0 ? (
            <p className="text-slate-500">No lectures available.</p>
          ) : (
            <ul className="space-y-3">
              {lectures.map((lec) => (
                <li
                  key={lec.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <span className="font-medium">{lec.title}</span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      lec.completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {lec.completed ? "✅ Completed" : "⏳ Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Assignments */}
      {activeTab === "assignments" && (
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-indigo-600 flex items-center gap-2">
            📝 Assignments
          </h2>
          {assignments.length === 0 ? (
            <p className="text-slate-500">No assignments given yet.</p>
          ) : (
            <ul className="space-y-3">
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <span>{a.title}</span>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${
                      a.status === "graded"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {a.status || "Pending"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Exams */}
      {activeTab === "exams" && (
        <div className="space-y-6">
          {/* Live Exams */}
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
            <h3 className="text-lg font-semibold text-red-500 mb-3">
              🔴 Live Exams
            </h3>
            {exams.filter((e) => e.status === "live").length === 0 ? (
              <p className="text-slate-500">No live exams.</p>
            ) : (
              <ul className="space-y-3">
                {exams
                  .filter((e) => e.status === "live")
                  .map((e) => (
                    <li
                      key={e.id}
                      className="flex justify-between items-center p-4 border rounded-lg bg-gradient-to-r from-red-50 to-pink-50 hover:shadow-md"
                    >
                      <div>
                        <p className="font-semibold text-red-600">{e.title}</p>
                        <p className="text-sm text-slate-500">
                          {new Date(e.start_time).toLocaleString()} →{" "}
                          {new Date(e.end_time).toLocaleString()}
                        </p>
                      </div>
                      <Link
                        to={`/course-exam/${e.id}`}
                        className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        Start Exam
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
            <h3 className="text-lg font-semibold text-green-600 mb-3">
              🟢 Upcoming Exams
            </h3>
            {exams.filter((e) => e.status === "upcoming").length === 0 ? (
              <p className="text-slate-500">No upcoming exams.</p>
            ) : (
              <ul className="space-y-3">
                {exams
                  .filter((e) => e.status === "upcoming")
                  .map((e) => (
                    <li
                      key={e.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <span className="font-semibold text-slate-700">
                        {e.title}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(e.start_time).toLocaleString()} →{" "}
                        {new Date(e.end_time).toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Past Exams */}
          <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
            <h3 className="text-lg font-semibold text-purple-600 mb-3">
              🟣 Past Exams
            </h3>
            {exams.filter((e) => e.status === "past").length === 0 ? (
              <p className="text-slate-500">No past exams.</p>
            ) : (
              <ul className="space-y-3">
                {exams
                  .filter((e) => e.status === "past")
                  .map((e) => (
                    <li
                      key={e.id}
                      className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-all"
                    >
                      <span className="font-semibold text-slate-700">
                        {e.title}
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(e.start_time).toLocaleString()} →{" "}
                        {new Date(e.end_time).toLocaleString()}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === "leaderboard" && (
        <div className="bg-white p-6 shadow-xl rounded-2xl border border-slate-100">
          <h2 className="text-xl font-bold mb-4 text-yellow-600 flex items-center gap-2">
            🏆 Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-slate-500">SOORY! No results yet.</p>
          ) : (
            <ol className="space-y-3">
              {leaderboard.map((user, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-4 border rounded-lg hover:shadow-md transition-all"
                >
                  <span>
                    <strong className="text-lg text-indigo-600">
                      #{idx + 1}
                    </strong>{" "}
                    {user.name}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    {user.score} pts
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseDetails;
