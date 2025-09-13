import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

import Navbar from "./components/Navbar";  // ✅ Navbar থাকবে
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Profile from "./pages/Profile";
import MyCourses from "./pages/MyCourses";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔥 Question Bank System
import QuestionBank from "./pages/QuestionBank";
import QuestionPapers from "./pages/QuestionPapers";
import Exam from "./pages/Exam";

// 🆕 Exam History
import ExamHistoryPage from "./pages/student/ExamHistoryPage";

// 🆕 Exam Submit Page
import ExamSubmitPage from "./pages/student/ExamSubmitPage";

// 🆕 Enrolled Course Details
import CourseDetails from "./pages/CourseDetails";

// 🆕 Course Exam Taking Page
import ExamTakingPage from "./pages/student/ExamTakingPage";

// 🆕 Admin Panel
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import AdminExams from "./pages/admin/AdminExams";
import AdminQuestionBank from "./pages/admin/AdminQuestionBank";
import ManageCourseQuestions from "./pages/admin/ManageCourseQuestions";
import ManageExams from "./pages/admin/ManageExams";
import ManageExamQuestions from "./pages/admin/ManageExamQuestions";

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: student } = await supabase
        .from("student_users")
        .select("status")
        .eq("email", user.email)
        .single();

      if (student?.status === "paused") {
        await supabase.auth.signOut();
        navigate("/login");
        alert("⚠️ Your account is paused by admin.");
      }
    };

    // 🔹 Run once on app load
    checkStatus();

    // 🔹 Realtime subscription
    const channel = supabase
      .channel("user-status-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "student_users",
        },
        async (payload) => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;

          if (
            payload.new.email === user.email &&
            payload.new.status === "paused"
          ) {
            await supabase.auth.signOut();
            navigate("/login");
            alert("⚠️ Your account was paused by admin.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  return (
    <>
      <Navbar /> {/* ✅ Navbar থাকবে */}
      <Routes>
        {/* 🌍 Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />

        {/* 🔑 Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <AdminRoute>
              <CourseManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId/questions"
          element={
            <AdminRoute>
              <ManageCourseQuestions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/courses/:courseId/exams"
          element={
            <AdminRoute>
              <ManageExams />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exams"
          element={
            <AdminRoute>
              <AdminExams />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/exams/:examId/questions"
          element={
            <AdminRoute>
              <ManageExamQuestions />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/question-bank"
          element={
            <AdminRoute>
              <AdminQuestionBank />
            </AdminRoute>
          }
        />

        {/* 🔒 Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute>
              <MyCourses />
            </ProtectedRoute>
          }
        />

        {/* 📚 Question Bank */}
        <Route
          path="/question-bank"
          element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/question-papers/:uniId"
          element={
            <ProtectedRoute>
              <QuestionPapers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/exam/:paperId"
          element={
            <ProtectedRoute>
              <Exam />
            </ProtectedRoute>
          }
        />

        {/* 🆕 Course Exam Taking Page */}
        <Route
          path="/course-exam/:examId"
          element={
            <ProtectedRoute>
              <ExamTakingPage />
            </ProtectedRoute>
          }
        />

        {/* 🆕 Exam History */}
        <Route
          path="/exam-history"
          element={
            <ProtectedRoute>
              <ExamHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* 🆕 Exam Submit Page */}
        <Route
          path="/exam-submit/:attemptId"
          element={
            <ProtectedRoute>
              <ExamSubmitPage />
            </ProtectedRoute>
          }
        />

        {/* 🆕 Course Details */}
        <Route
          path="/course/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

export default App;
