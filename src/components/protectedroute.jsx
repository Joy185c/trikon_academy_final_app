import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ plural ঠিক করুন (আপনার ফোল্ডার নাম check করে দেখুন)

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
