import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import CourseCard from "../components/CourseCard";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      let { data, error } = await supabase.from("courses").select("*");
      if (!error) setCourses(data);

      // check user enrolled courses
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let { data: enrollments } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user.id);

        if (enrollments) {
          setEnrolledCourses(enrollments.map((en) => en.course_id));
        }
      }

      setLoading(false);
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (course, priceToPay) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please login first!");
      return;
    }

    const { error } = await supabase.from("enrollments").insert([
      {
        student_id: user.id,
        course_id: course.id,
        paid_amount: priceToPay, // ✅ save final price (discount applied)
      },
    ]);

    if (error) {
      alert("Already enrolled or error occurred!");
    } else {
      setSelectedCourse(course);
      setShowModal(true);
      setEnrolledCourses((prev) => [...prev, course.id]);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading courses...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-6">📚 Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={enrolledCourses.includes(course.id)}
            onEnroll={handleEnroll}
          />
        ))}
      </div>

      {/* ✅ Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
            <h2 className="text-2xl font-bold mb-2">🎉 Enrolled Successfully!</h2>
            <p className="text-gray-700 mb-4">
              You have enrolled in{" "}
              <span className="font-semibold">{selectedCourse.title}</span>
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
