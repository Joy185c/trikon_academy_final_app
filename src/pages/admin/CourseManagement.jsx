import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [duration, setDuration] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");

  // fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (!error) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // add course
  const handleAddCourse = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from("courses").insert([
      {
        title,
        description,
        price,
        thumbnail,
        duration,
        coupon_code: couponCode || null,
        discount_amount: discountAmount || null,
      },
    ]);

    if (error) {
      alert("Error adding course: " + error.message);
    } else {
      alert("✅ Course added successfully!");
      setCourses((prev) => [...prev, ...data]);

      // reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setThumbnail("");
      setDuration("");
      setCouponCode("");
      setDiscountAmount("");
    }
  };

  // delete course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      alert("Error deleting course: " + error.message);
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }
  };

  if (loading) return <p className="text-center mt-10">⏳ Loading courses...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
        🎓 Course Management
      </h1>

      {/* Add Course Form */}
      <form
        onSubmit={handleAddCourse}
        className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">➕ Add New Course</h2>

        <input
          type="text"
          placeholder="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          rows="3"
        ></textarea>

        <input
          type="number"
          placeholder="Price ($)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="text"
          placeholder="Thumbnail URL"
          value={thumbnail}
          onChange={(e) => setThumbnail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="text"
          placeholder="Duration (e.g. 3 months)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="text"
          placeholder="Coupon Code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="number"
          placeholder="Discount Amount (optional)"
          value={discountAmount}
          onChange={(e) => setDiscountAmount(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Course
        </button>
      </form>

      {/* Course List */}
      <h2 className="text-xl font-semibold mb-4 text-center">📋 All Courses</h2>
      {courses.length === 0 ? (
        <p className="text-center text-gray-500">❌ No courses found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow rounded-lg p-4 relative"
            >
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <h3 className="text-lg font-bold mt-2">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.description}</p>
              <p className="text-green-600 font-semibold mt-1">
                ${course.price || 0}
              </p>
              {course.coupon_code && (
                <p className="text-sm text-purple-600">
                  🎟 Coupon: {course.coupon_code} (-{course.discount_amount}$)
                </p>
              )}
              <p className="text-sm text-gray-500">
                ⏳ Duration: {course.duration || "N/A"}
              </p>

              <div className="mt-3 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleDelete(course.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    navigate(`/admin/courses/${course.id}/questions`)
                  }
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Manage Questions
                </button>
                <button
                  onClick={() => navigate(`/admin/courses/${course.id}/exams`)}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Manage Exams
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseManagement;
