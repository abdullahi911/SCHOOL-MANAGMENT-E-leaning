// Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import gatewayLogo from "../images/gatewayLogo.jpeg";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";

const Header = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user and profile
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => fetchUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={gatewayLogo} alt="Gateway Logo" className="h-14 w-14 object-contain cursor-pointer" />
          </Link>
          <div className="hidden sm:flex gap-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors">Home</Link>
            <Link to="/dashboard" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors">Dashboard</Link>
            <Link to="/elearning" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors">E-Learning</Link>
          </div>
        </div>

        {/* Right: Profile / SignIn-SignUp */}
        <div className="flex items-center gap-4">
          {!user && (
            <div className="hidden sm:flex gap-2">
              <Link to="/signin" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors">Sign In</Link>
              <Link to="/signup" className="px-3 py-2 text-sm font-medium bg-yellow-500 text-blue-900 rounded hover:bg-yellow-400 font-semibold transition-colors">Sign Up</Link>
            </div>
          )}

          {user && (
            <div className="relative flex items-center gap-2">
              {/* Welcome Name */}
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                Welcome, {profile?.full_name || user.email.split("@")[0]}
              </span>

              {/* Avatar */}
              <img
                src={profile?.avatar_at || user.user_metadata?.avatar_url || "https://via.placeholder.com/40"}
                alt="Profile"
                className="h-10 w-10 rounded-full ring-2 ring-blue-500 hover:ring-blue-700 transition cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold">{profile?.full_name || user.email}</p>
                    <p className="text-sm text-gray-500">{profile?.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-md text-gray-600"
          >
            {mobileMenuOpen ? <IoMdClose className="w-6 h-6" /> : <CiMenuBurger className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-sm">
          <Link to="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Home</Link>
          <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Dashboard</Link>
          <Link to="/elearning" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">E-Learning</Link>
          {!user && (
            <>
              <Link to="/signin" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sign In</Link>
              <Link to="/signup" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;