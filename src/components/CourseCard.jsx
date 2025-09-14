import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseclient.js";
import { Dialog } from "@headlessui/react";

function CourseCard({ course, isEnrolled, onEnroll }) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [message, setMessage] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Fetch live enrolled count
  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      const { count, error } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id);

      if (!error && count !== null) {
        setEnrolledCount(count);
      }
    };

    fetchEnrollmentCount();
  }, [course.id]);

  const handleApplyCoupon = () => {
    if (
      couponInput.trim().toLowerCase() ===
      (course.coupon_code?.toLowerCase() || "")
    ) {
      setAppliedDiscount(course.discount_amount || 0);
      setMessage({ type: "success", text: "✅ Coupon applied successfully!" });
    } else {
      setAppliedDiscount(0);
      setMessage({ type: "error", text: "❌ Invalid coupon code" });
    }
  };

  const handleEnrollConfirm = async () => {
    await onEnroll(course, Math.max(0, course.price - appliedDiscount));
    setEnrolledCount((prev) => prev + 1); // 🔥 Increase locally
    setIsModalOpen(false);
  };

  const finalPrice = Math.max(0, course.price - appliedDiscount);

  return (
    <div
      className="relative bg-white/20 backdrop-blur-lg border border-white/30
                 rounded-2xl shadow-lg overflow-hidden transform 
                 transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      {/* Thumbnail */}
      {course.thumbnail && (
        <div className="relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          <span className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            🎓 Course
          </span>
          {/* 🔥 Enrollment count badge */}
          <span className="absolute bottom-2 right-2 bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full shadow">
            👥 {enrolledCount} Enrolled
          </span>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-2 line-clamp-1">
          {course.title}
        </h2>
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {course.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          {appliedDiscount > 0 ? (
            <div>
              <span className="text-red-600 font-bold text-lg mr-2">
                ${finalPrice}
              </span>
              <span className="line-through text-gray-400">${course.price}</span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              ${course.price}
            </span>
          )}

          {appliedDiscount > 0 && (
            <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              🔥 Sale
            </span>
          )}
        </div>

        {course.duration && (
          <p className="text-xs text-gray-600 mb-4">⏳ {course.duration}</p>
        )}

        {/* Coupon */}
        {!isEnrolled && course.coupon_code && (
          <div className="mb-4">
            <div className="flex">
              <input
                type="text"
                placeholder="Enter coupon"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="border px-3 py-2 rounded-l-lg w-full text-sm focus:ring-2 focus:ring-yellow-400 outline-none"
              />
              <button
                onClick={handleApplyCoupon}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 
                           text-white px-4 py-2 rounded-r-lg hover:from-yellow-600 
                           hover:to-orange-600 transition font-semibold"
              >
                Apply
              </button>
            </div>
            {message && (
              <p
                className={`mt-2 text-sm ${
                  message.type === "success"
                    ? "text-green-600 font-medium"
                    : "text-red-500 font-medium"
                }`}
              >
                {message.text}
              </p>
            )}
          </div>
        )}

        {/* Button */}
        {isEnrolled ? (
          <button
            disabled
            className="w-full bg-gray-400/80 text-white px-4 py-2 
                       rounded-xl cursor-not-allowed font-semibold shadow-inner"
          >
            ✅ Enrolled
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 
                       to-purple-600 text-white px-4 py-2 rounded-xl font-bold 
                       shadow-md hover:from-blue-700 hover:to-purple-700 
                       transition duration-300"
          >
            🚀 Enroll Now
          </button>
        )}
      </div>

      {/* 🔹 Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Modal Content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white/90 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto shadow-xl border border-white/30">
            <Dialog.Title className="text-xl font-bold text-center text-blue-600">
              🎓 ফ্রি এনরোলমেন্ট
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-center text-gray-700">
              এই কোর্সে এনরোল করা সম্পূর্ণ <span className="font-bold text-green-600">ফ্রি</span>!  
              <br /> সবার জন্য উন্মুক্ত। এখনই এনরোল করুন।
            </Dialog.Description>

            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                ❌ বাতিল
              </button>
              <button
                onClick={handleEnrollConfirm}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                ✅ এনরোল করুন
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

export default CourseCard;
