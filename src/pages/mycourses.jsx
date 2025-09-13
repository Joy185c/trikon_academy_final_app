import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

function MyCourses() {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      let { data, error } = await supabase
        .from("enrollments")
        .select("courses(id, title, description, price, thumbnail)")
        .eq("student_id", user.id);

      if (!error && data) {
        setMyCourses(data.map((en) => en.courses));
      }
      setLoading(false);
    };

    fetchMyCourses();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-blue-600 font-semibold animate-pulse">
        ⏳ Loading your courses...
      </p>
    );

  if (myCourses.length === 0)
    return (
      <p className="text-center mt-10 text-gray-600">
        ❌ You haven’t enrolled in any courses yet.
      </p>
    );

  return (
    <div className="p-8 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-transparent bg-clip-text drop-shadow">
        🎓 My Courses
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {myCourses.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="group relative block rounded-2xl shadow-md 
                       overflow-hidden bg-white/30 backdrop-blur-lg border border-white/40
                       hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02] transition duration-300"
          >
            {/* Thumbnail */}
            {course.thumbnail && (
              <div className="relative w-full h-48 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
              </div>
            )}

            {/* Content */}
            <div className="p-6 relative z-10">
              <h2 className="text-lg font-bold text-blue-800 mb-2 group-hover:underline">
                {course.title}
              </h2>
              <p className="text-sm text-gray-700 line-clamp-2">
                {course.description}
              </p>
              <p className="text-green-700 font-semibold mt-3">
                💲 {course.price} Tk.
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MyCourses;
