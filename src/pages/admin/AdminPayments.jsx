import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseclient";

function AdminPayments() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [modal, setModal] = useState({
    show: false,
    type: "", // success, error, warning
    message: "",
  });

  // fetch payment requests
  const fetchRequests = async () => {
    let { data, error } = await supabase
      .from("payment_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setRequests(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ✅ approve request
  const approveRequest = async (req) => {
    try {
      // check if already enrolled
      const { data: existing, error: checkError } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", req.student_id)
        .eq("course_id", req.course_id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existing) {
        // insert new enrollment
        const { error: enrollError } = await supabase
          .from("enrollments")
          .insert([
            {
              student_id: req.student_id,
              course_id: req.course_id,
              paid_amount: req.amount,
            },
          ]);

        if (enrollError) throw enrollError;
      }

      // update payment request status
      const { error: updateError } = await supabase
        .from("payment_requests")
        .update({ status: "Approved" })
        .eq("id", req.id);

      if (updateError) throw updateError;

      setModal({
        show: true,
        type: "success",
        message: "✅ Approved successfully!",
      });
      fetchRequests();
    } catch (err) {
      setModal({
        show: true,
        type: "error",
        message: "❌ Failed: " + err.message,
      });
    }
  };

  // reject request
  const rejectRequest = async (reqId) => {
    await supabase
      .from("payment_requests")
      .update({ status: "Rejected" })
      .eq("id", reqId);

    setModal({
      show: true,
      type: "warning",
      message: "❌ Rejected!",
    });
    fetchRequests();
  };

  if (loading) return <p className="text-center mt-10">Loading requests...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-4">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-indigo-700 drop-shadow">
        💳 Payment Requests
      </h2>

      {requests.length === 0 ? (
        <p className="text-center text-gray-600">No requests yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((req) => (
            <div
              key={req.id}
              className="relative bg-gradient-to-br from-white/80 to-indigo-50 backdrop-blur-xl border border-indigo-100 shadow-2xl rounded-2xl p-6 hover:scale-[1.02] transition transform"
            >
              {/* Course Name */}
              <h3 className="text-xl font-extrabold text-indigo-700 mb-2 flex items-center gap-2">
                📘 {req.course_name}
              </h3>

              {/* User Info */}
              <div className="mb-3">
                <p className="text-gray-800 font-semibold">{req.full_name}</p>
                <p className="text-sm text-gray-500">{req.gmail}</p>
              </div>

              {/* Highlighted Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <span className="text-xs uppercase text-gray-500 font-semibold">
                    Amount
                  </span>
                  <p className="text-lg font-bold text-green-700">
                    ৳{req.amount}
                  </p>
                </div>

                <div className="bg-pink-50 border border-pink-200 p-3 rounded-lg">
                  <span className="text-xs uppercase text-gray-500 font-semibold">
                    bKash Number
                  </span>
                  <p className="text-lg font-bold text-pink-700">
                    {req.bkash_number}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <span className="text-xs uppercase text-gray-500 font-semibold">
                    Contact Number
                  </span>
                  <p className="text-lg font-bold text-blue-700">
                    {req.contact_number}
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg sm:col-span-2">
                  <span className="text-xs uppercase text-gray-500 font-semibold">
                    Transaction ID
                  </span>
                  <p className="text-lg font-bold text-yellow-700 break-all">
                    {req.trx_id}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="mb-4">
                <span className="font-semibold text-gray-600">Status: </span>
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-lg shadow ${
                    req.status === "Pending"
                      ? "bg-yellow-500 text-white"
                      : req.status === "Approved"
                      ? "bg-green-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {req.status}
                </span>
              </div>

              {/* Actions */}
              {req.status === "Pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => approveRequest(req)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal */}
      {modal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-fadeIn">
            <h3
              className={`text-xl font-bold mb-3 ${
                modal.type === "success"
                  ? "text-green-600"
                  : modal.type === "error"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            >
              {modal.message}
            </h3>
            <button
              onClick={() => setModal({ show: false, type: "", message: "" })}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPayments;
