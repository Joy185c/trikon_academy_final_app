import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseclient";

function CourseCard({ course, isEnrolled, isPending, onEnroll }) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [message, setMessage] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(0);

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

  // apply coupon
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

  // confirm enroll (direct call without form)
  const handleEnrollConfirm = async () => {
    const finalPrice = Math.max(0, course.price - appliedDiscount);
    await onEnroll(course, finalPrice, {}); // empty form data since not needed
    setEnrolledCount((prev) => prev + 1);
  }

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
                ৳{finalPrice}
              </span>
              <span className="line-through text-gray-400">৳{course.price}</span>
            </div>
          ) : (
            <span className="text-green-600 font-bold text-lg">
              ৳{course.price}
            </span>
          )}

          {appliedDiscount > 0 && (
            <span className="bg-gradient-to-r from-yellow-400 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
              🔥 Sale
            </span>
          )}
        </div>

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

        {/* Button State */}
        {isEnrolled ? (
          <button
            disabled
            className="w-full bg-gray-400/80 text-white px-4 py-2 
                       rounded-xl cursor-not-allowed font-semibold shadow-inner"
          >
            ✅ Enrolled
          </button>
        ) : isPending ? (
          <button
            disabled
            className="w-full bg-yellow-500 text-white px-4 py-2 
                       rounded-xl cursor-not-allowed font-semibold shadow-inner"
          >
            ⏳ Request Submitted
          </button>
        ) : (
          <button
            onClick={handleEnrollConfirm}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 
                       to-purple-600 text-white px-4 py-2 rounded-xl font-bold 
                       shadow-md hover:from-blue-700 hover:to-purple-700 
                       transition duration-300"
          >
            🚀 Enroll Now
          </button>
        )}
      </div>
    </div>
  )
}

export default CourseCard;
