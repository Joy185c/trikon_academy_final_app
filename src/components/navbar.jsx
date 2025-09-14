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
          ...(role === "admin" ? [{ path: "/admin", label: "Admin Dashboard" }] : []),
        ]
      : [
          { path: "/login", label: "Login" },
          { path: "/register", label: "Register" },
        ]),
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white px-6 py-4 shadow-lg sticky top-0 z-50 backdrop-blur-lg">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="flex items-center space-x-2 group hover:scale-105 transition-transform"
        >
          <img
            src={trikonLogo}
            alt="Trikon Logo"
            className="h-10 w-auto drop-shadow-lg"
          />
          <span className="text-2xl font-extrabold tracking-wide drop-shadow-md group-hover:text-yellow-300 transition-colors">
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
              className={`relative transition-all duration-300 
                ${
                  activeItem === item.label
                    ? "scale-110 text-yellow-300 animate-pulse"
                    : "hover:scale-110 hover:text-yellow-200"
                }
              `}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="ml-4 px-5 py-1.5 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md hover:scale-110 hover:shadow-lg transition-all duration-300 text-white font-semibold"
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
        <div className="md:hidden mt-3 space-y-2 bg-white/10 backdrop-blur-lg rounded-lg p-4 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                setActiveItem(item.label);
                setMenuOpen(false);
              }}
              className={`block transition-all duration-300 ${
                activeItem === item.label
                  ? "scale-105 text-yellow-300 animate-pulse"
                  : "hover:scale-105 hover:text-yellow-200"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300 text-white font-semibold"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
