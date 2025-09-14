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
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        // ✅ profiles থেকে role + secret_code চেক
        let { data: profile, error } = await supabase
          .from("profiles")
          .select("role, secret_code")
          .eq("id", data.user.id)
          .single();

        if (
          !error &&
          profile?.role === "admin" &&
          profile?.secret_code === "540274tiptip"
        ) {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Checking admin access...</p>;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
