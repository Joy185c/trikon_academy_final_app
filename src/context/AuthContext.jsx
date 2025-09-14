import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // profiles থেকে ডেটা ফেচ
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email, role")
          .eq("id", authUser.id)
          .single();

        if (!profile) {
          // যদি profile না থাকে, insert করি
          await supabase.from("profiles").insert({
            id: authUser.id,
            full_name: authUser.email.split("@")[0],
            email: authUser.email,
            role: "student",
          });

          setUser({
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.email.split("@")[0],
            role: "student",
          });
        } else {
          setUser({
            id: authUser.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    getUserProfile();

    // Supabase auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUserProfile();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;

    // নতুন ইউজার এলে profile insert
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: name,
        email,
        role: "student",
      });
    }

    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
