import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";
import CourseCard from "../components/CourseCard";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showFreeModal, setShowFreeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // form fields
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [hscBatch, setHscBatch] = useState("");
  const [bkashNumber, setBkashNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // bkash admin number
  const [bkashAdminNumber, setBkashAdminNumber] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      let { data: coursesData } = await supabase.from("courses").select("*");
      setCourses(coursesData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        setUserId(user.id);

        // already enrolled
        let { data: enrollments } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user.id);

        if (enrollments) {
          setEnrolledCourses(enrollments.map((en) => en.course_id));
        }

        // pending requests
        let { data: requests } = await supabase
          .from("payment_requests")
          .select("course_id,status")
          .eq("student_id", user.id);

        if (requests) {
          setPendingRequests(
            requests.filter((r) => r.status === "Pending").map((r) => r.course_id)
          );
        }
      }

      // bkash number
      let { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "bkash_number")
        .single();

      if (setting) setBkashAdminNumber(setting.value);

      setLoading(false);
    };
    fetchCourses();
  }, []);

  // free enroll
  const handleFreeEnroll = async (course) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("enrollments").insert([
      {
        student_id: user.id,
        course_id: course.id,
        paid_amount: 0,
      },
    ]);

    if (!error) {
      setSelectedCourse(course);
      setShowFreeModal(true);
      setEnrolledCourses((prev) => [...prev, course.id]);
    }
  };

  // paid enroll
  const handlePaidEnroll = (course) => {
    setSelectedCourse(course);
    setShowPaymentModal(true);
  };

  // submit payment request
  const handlePaymentRequest = async () => {
    if (!fullName || !contactNumber || !hscBatch || !bkashNumber || !trxId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("payment_requests").insert([
      {
        student_id: user.id,
        course_id: selectedCourse.id,
        course_name: selectedCourse.title,
        gmail: user.email,
        amount: selectedCourse.price,
        trx_id: trxId,
        bkash_number: bkashNumber,
        status: "Pending",
        full_name: fullName,
        contact_number: contactNumber,
        hsc_batch: hscBatch,
      },
    ]);

    if (!error) {
      setPendingRequests((prev) => [...prev, selectedCourse.id]);
      setShowPaymentModal(false);
      setShowSuccessModal(true);

      // reset form
      setFullName("");
      setContactNumber("");
      setHscBatch("");
      setBkashNumber("");
      setTrxId("");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading courses...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-6">📚 Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const finalPrice =
            (parseFloat(course.price) || 0) - (parseFloat(course.discount_amount) || 0);

          const isEnrolled = enrolledCourses.includes(course.id);
          const isPending = pendingRequests.includes(course.id);

          return (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={isEnrolled}
              isPending={isPending}
              onEnroll={() =>
                finalPrice <= 0 ? handleFreeEnroll(course) : handlePaidEnroll(course)
              }
            />
          );
        })}
      </div>

      {/* Free Enroll Modal */}
      {showFreeModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
            <h2 className="text-2xl font-bold mb-2 text-green-600">🎉 Enrolled Successfully!</h2>
            <p className="text-gray-700 mb-4">
              You have enrolled in <span className="font-semibold">{selectedCourse.title}</span>{" "}
              for <span className="text-green-600">FREE</span> 🎁
            </p>
            <button
              onClick={() => setShowFreeModal(false)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-2xl p-8 w-[420px] relative">
            <h2 className="text-2xl font-extrabold text-center mb-2 text-purple-700">🚀 Enroll Request</h2>
            <p className="text-center text-gray-600 mb-4">
              Complete your payment to unlock{" "}
              <span className="font-semibold text-gray-800">{selectedCourse.title}</span>
            </p>

            {/* Payment Info */}
            <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg p-4 shadow-md mb-5 text-center">
              <p className="text-lg font-bold">Send Tk {selectedCourse.price}</p>
              <p className="text-sm">to bKash (Personal):</p>
              <p className="text-xl font-mono mt-1">{bkashAdminNumber || "01722052432"}</p>
            </div>

            {/* Form */}
            <div className="space-y-3">
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg" />
              <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg" />
              <input type="text" placeholder="HSC Batch (e.g. 2025)" value={hscBatch} onChange={(e) => setHscBatch(e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg" />
              <input type="email" value={userEmail} disabled className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg bg-gray-100" />
              <input type="text" placeholder="Your bKash Number" value={bkashNumber} onChange={(e) => setBkashNumber(e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg" />
              <input type="text" placeholder="Transaction ID" value={trxId} onChange={(e) => setTrxId(e.target.value)} className="w-full border-2 border-gray-200 px-3 py-2 rounded-lg" />
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <button onClick={handlePaymentRequest} className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-2 rounded-lg mr-2">
                ✅ Submit Request
              </button>
              <button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-400 text-white font-semibold py-2 rounded-lg ml-2">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
            <h2 className="text-2xl font-bold mb-2 text-yellow-600">⏳ Request Submitted!</h2>
            <p className="text-gray-700 mb-4">
              Your payment request for <span className="font-semibold">{selectedCourse.title}</span> has been submitted. Please wait for admin approval ✅
            </p>
            <button onClick={() => setShowSuccessModal(false)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
