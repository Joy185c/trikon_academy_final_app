// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";

function AdminRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLoading(false);
        return;
      }

      setUser(user);

      // ✅ profiles থেকে role + secret_code চেক
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, secret_code")
        .eq("id", user.id)
        .single();

      if (!profileError && profile) {
        if (
          profile.role === "admin" &&
          profile.secret_code === "540274tiptip"
        ) {
          setIsAdmin(true);
        }
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600">
          Checking admin access...
        </p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
