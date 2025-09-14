import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseclient.js";

function ExamHistory() {
  const [attempts, setAttempts] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // 🔹 get student id (mapping from students table)
        const { data: studentRow, error: studentError } = await supabase
          .from("students")
          .select("id")
          .eq("auth_id", authUser.id) // if you have auth_id column
          .single();

        if (studentError || !studentRow) {
          console.error("❌ No matching student found:", studentError?.message);
          return;
        }

        // 🔹 fetch attempts
        const { data, error } = await supabase
          .from("attempts")
          .select(
            `
            id,
            score,
            created_at,
            paper_id,
            questions ( title )
          `
          )
          .eq("user_id", studentRow.id)
          .order("created_at", { ascending: false });

        if (!error) setAttempts(data || []);
        else console.error("❌ Error fetching attempts:", error.message);
      }
    };
    getData();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-gray-600 text-lg">Please login to view history.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">📊 Exam History</h1>

      {attempts.length === 0 ? (
        <p className="text-gray-600">❌ No exam attempts found.</p>
      ) : (
        <table className="w-full border border-gray-200 shadow">
          <thead className="bg-blue-100">
            <tr>
              <th className="p-3 border">#</th>
              <th className="p-3 border">Exam</th>
              <th className="p-3 border">Score</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a, idx) => (
              <tr key={a.id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">{a.questions?.title || "Unknown"}</td>
                <td className="p-2 border">{a.score}</td>
                <td className="p-2 border">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="p-2 border">
                  <Link
                    to={`/exam/${a.paper_id}?review=true`}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExamHistory;
