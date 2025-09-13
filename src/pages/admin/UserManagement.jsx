import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 সব student_users ফেচ করা
  useEffect(() => {
    const fetchUsers = async () => {
      let { data, error } = await supabase
        .from("student_users")
        .select("id, full_name, email, role, status, created_at");

      if (error) {
        console.error(error);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // 🔹 Pause / Unpause User
  const handlePause = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";

    const { error } = await supabase
      .from("student_users")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("❌ Failed to update status!");
    } else {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
      );
      alert(`✅ User ${newStatus === "paused" ? "paused" : "re-activated"}!`);
    }
  };

  // 🔹 User delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const { error } = await supabase.from("student_users").delete().eq("id", id);

    if (error) {
      alert("❌ Failed to delete user!");
    } else {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("✅ User deleted!");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading users...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">👥 User Management</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Full Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Status</th>
            <th className="border border-gray-300 px-4 py-2">Created</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">
                {user.full_name}
              </td>
              <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              <td className="border border-gray-300 px-4 py-2">{user.role}</td>
              <td className="border border-gray-300 px-4 py-2">
                {user.status || "active"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                <button
                  onClick={() => handlePause(user.id, user.status)}
                  className={`px-3 py-1 rounded text-white ${
                    user.status === "paused" ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                >
                  {user.status === "paused" ? "Unpause" : "Pause"}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;
