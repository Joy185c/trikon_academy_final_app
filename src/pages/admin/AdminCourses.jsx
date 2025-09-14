// src/pages/admin/AdminCourses.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseclient.js";

function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ New course form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    coupon_code: "",
    discount_amount: "",
    duration: "",
    thumbnail: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  // 📌 Load courses
  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setCourses(data);
    setLoading(false);
  };

  // ➕ Add new course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const { error } = await supabase.from("courses").insert([form]);
    if (!error) {
      setForm({
        title: "",
        description: "",
        price: "",
        coupon_code: "",
        discount_amount: "",
        duration: "",
        thumbnail: "",
      });
      fetchCourses();
      alert("✅ Course added successfully!");
    } else {
      alert("❌ Error adding course: " + error.message);
    }
  };

  // ✏️ Update course title only (inline edit)
  const handleUpdateCourse = async (id, newTitle) => {
    const { error } = await supabase
      .from("courses")
      .update({ title: newTitle })
      .eq("id", id);
    if (!error) fetchCourses();
  };

  // 🗑️ Delete course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (!error) fetchCourses();
  };

  if (loading) return <p className="p-8">Loading courses...</p>;

  // ✅ Live final price calculation
  const finalPrice =
    (parseFloat(form.price) || 0) -
    (parseFloat(form.discount_amount) || 0);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">📚 Manage Courses</h1>

      {/* Add New Course */}
      <form
        onSubmit={handleAddCourse}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded"
      >
        <input
          type="text"
          placeholder="Course Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Coupon Code"
          value={form.coupon_code}
          onChange={(e) => setForm({ ...form, coupon_code: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Discount Amount"
          value={form.discount_amount}
          onChange={(e) =>
            setForm({ ...form, discount_amount: e.target.value })
          }
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Duration (e.g. 3 months)"
          value={form.duration}
          onChange={(e) => setForm({ ...form, duration: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Thumbnail URL"
          value={form.thumbnail}
          onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
          className="border px-3 py-2 rounded"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border px-3 py-2 rounded md:col-span-2"
        ></textarea>

        {/* ✅ Live Price Preview */}
        <div className="md:col-span-2 bg-white border rounded p-3 text-sm">
          <p>
            💰 Original Price:{" "}
            <span className="font-semibold">${form.price || 0}</span>
          </p>
          <p>
            🎟️ Discount:{" "}
            <span className="font-semibold">
              ${form.discount_amount || 0}
            </span>
          </p>
          <p>
            ✅ Final Price:{" "}
            <span className="font-bold text-green-600">
              ${finalPrice >= 0 ? finalPrice : 0}
            </span>
          </p>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 md:col-span-2"
        >
          Add Course
        </button>
      </form>

      {/* Courses List */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="p-3 text-left">Thumbnail</th>
            <th className="p-3 text-left">Course Title</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Coupon</th>
            <th className="p-3 text-left">Discount</th>
            <th className="p-3 text-left">Duration</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">
                {c.thumbnail ? (
                  <img
                    src={c.thumbnail}
                    alt="thumbnail"
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  "N/A"
                )}
              </td>
              <td className="p-3">
                <input
                  type="text"
                  defaultValue={c.title}
                  onBlur={(e) => handleUpdateCourse(c.id, e.target.value)}
                  className="border px-2 py-1 rounded w-full"
                />
              </td>
              <td className="p-3">${c.price}</td>
              <td className="p-3">{c.coupon_code || "-"}</td>
              <td className="p-3">
                {c.discount_amount ? `$${c.discount_amount}` : "-"}
              </td>
              <td className="p-3">{c.duration || "-"}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDeleteCourse(c.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-center text-gray-500">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminCourses;
