import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseclient.js";
import trikonLogo from "../assets/trikonlogo.png";

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile) setRole(profile.role);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/courses", label: "Courses" },
    ...(user
      ? [
          { path: "/my-courses", label: "My Courses" },
          { path: "/dashboard", label: "Dashboard" },
          { path: "/question-bank", label: "Question Bank" },
          { path: "/exam-history", label: "Exam History" },
          { path: "/profile", label: "Profile" },
          ...(role === "admin"
            ? [{ path: "/admin", label: "Admin Dashboard" }]
            : []),
        ]
      : [
          { path: "/login", label: "Login" },
          { path: "/register", label: "Register" },
        ]),
  ];

  return (
    <nav className="bg-gradient-to-r from-emerald-700/80 via-teal-600/80 to-green-700/80 
      text-white px-6 py-3 shadow-lg sticky top-0 z-50 backdrop-blur-xl border-b border-white/20">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center space-x-2 group hover:scale-105 transition-transform"
        >
          <img
            src={trikonLogo}
            alt="Trikon Logo"
            className="h-9 w-auto drop-shadow-lg"
          />
          <span className="text-xl font-extrabold tracking-wide drop-shadow-md 
            group-hover:text-yellow-300 transition-colors">
            Trikon Academy
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center font-medium relative">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setActiveItem(item.label)}
              className={`relative text-sm transition-all duration-300 
                ${
                  activeItem === item.label
                    ? "text-yellow-300 border-b-2 border-yellow-300 pb-0.5"
                    : "hover:text-yellow-200"
                }
              `}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 
              rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all 
              duration-300 text-white font-semibold text-sm"
            >
              Logout
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md bg-white/20 hover:bg-white/30 transition"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 space-y-2 
          bg-gradient-to-br from-emerald-700/95 via-teal-600/95 to-green-700/95 
          backdrop-blur-xl rounded-lg p-3 shadow-lg w-full animate-slideDown">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveItem(item.label);
                setMenuOpen(false);
              }}
              className={`block px-3 py-2 rounded-lg text-center font-medium text-sm
                transition-all duration-300 
                ${
                  activeItem === item.label
                    ? "bg-white/30 text-yellow-300 scale-105 shadow-md"
                    : "bg-white/10 hover:bg-white/20"
                }`}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-lg text-center font-semibold text-sm
              bg-gradient-to-r from-red-500 to-red-600 text-white 
              hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              Logout
            </button>
          )}
        </div>
      )}

      {/* Slide Animation */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
