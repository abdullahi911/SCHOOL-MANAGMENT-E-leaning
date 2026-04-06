// Header.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import gatewayLogo from "../images/gatewayLogo.jpeg";
import { CiMenuBurger } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { FiSun, FiMoon } from "react-icons/fi";

const Header = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  // Initialize Dark Mode
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

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
    
    const handleProfileUpdate = () => fetchUser();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <img src={gatewayLogo} alt="Gateway Logo" className="h-14 w-14 object-contain cursor-pointer" />
          </Link>
          <div className="hidden sm:flex gap-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-700 hover:text-white rounded transition-colors">Home</Link>
            <Link to="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-700 hover:text-white rounded transition-colors">Dashboard</Link>
            <Link to="/elearning" className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-700 hover:text-white rounded transition-colors">E-Learning</Link>
          </div>
        </div>

        {/* Right: Theme Toggle / Profile / SignIn-SignUp */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
          </button>
          {!user && (
            <div className="hidden sm:flex gap-2">
              <Link to="/signin" className="px-3 py-2 text-sm font-medium hover:bg-blue-700 rounded transition-colors">Sign In</Link>
              <Link to="/signup" className="px-3 py-2 text-sm font-medium bg-yellow-500 text-blue-900 rounded hover:bg-yellow-400 font-semibold transition-colors">Sign Up</Link>
            </div>
          )}

          {user && (
            <div className="relative flex items-center gap-2">
              {/* Welcome Name */}
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">
                Welcome, {profile?.full_name || user.email.split("@")[0]}
              </span>

              {/* Avatar */}
              <img
                src={profile?.avatar_url || user.user_metadata?.avatar_url || "https://via.placeholder.com/40"}
                alt="Profile"
                className="h-10 w-10 rounded-full ring-2 ring-blue-500 hover:ring-blue-700 transition cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-white">{profile?.full_name || user.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{profile?.role}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm"
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
            className="sm:hidden p-2 rounded-md text-gray-600 dark:text-gray-300"
          >
            {mobileMenuOpen ? <IoMdClose className="w-6 h-6" /> : <CiMenuBurger className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
          <Link to="/" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Home</Link>
          <Link to="/dashboard" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
          <Link to="/elearning" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">E-Learning</Link>
          {!user && (
            <>
              <Link to="/signin" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Sign In</Link>
              <Link to="/signup" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Sign Up</Link>
            </>
          )}
          {user && (
            <>
              <Link to="/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Profile</Link>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Logout</button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;