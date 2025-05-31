import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaUser, FaMoneyBillWave } from "react-icons/fa";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, setUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setIsProfileDropdownOpen(false);
    navigate(path);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleDropdownEnter = (dropdown) => {
    setActiveDropdown(dropdown);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  const handleDropdownItemClick = (path) => {
    handleNavigate(path);
    setActiveDropdown(null);
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="top-0 left-0 right-0 z-50 p-4 font-sans border-b border-gray-400 pb-4 w-[90%] mx-auto">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src={logo}
            alt="Nearest Doctor Logo"
            className="h-10 w-10 mr-2 backdrop-brightness-100"
          />
          <div className="text-purple-700 font-bold text-2xl">
            <Link to="/">Nearest Doctor</Link>
          </div>
        </div>

        <div className="hidden md:flex space-x-8 items-center ml-20">
          <Link
            to="/about"
            className="text-black text-lg font-medium hover:text-purple-700 transition duration-300 hover:scale-105 cursor-pointer"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-black text-lg font-medium hover:text-purple-700 transition duration-300 hover:scale-105 cursor-pointer"
          >
            Contact
          </Link>

          <div
            className="relative dropdown"
            onMouseEnter={() => handleDropdownEnter("features")}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="text-black hover:text-purple-700 text-lg font-medium focus:outline-none transition duration-300 transform hover:scale-105 cursor-pointer">
              Features
            </button>
            <div
              className={`absolute z-10 bg-white text-black shadow-lg mt-2 rounded transition-all ease-in-out duration-500 max-h-0 overflow-hidden ${
                activeDropdown === "features"
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/video-consultation")}
              >
                Video Consultation
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/medication-reminder")}
              >
                Medication Reminder
              </div>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer"
          >
            Dashboard
          </Link>
          <Link
            to="/appointment"
            className="text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer"
          >
            Appointment
          </Link>
          <Link
            to="/login"
            className="text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer"
          >
            Login
          </Link>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-black text-2xl focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <div className="flex items-center space-x-4 relative" ref={profileDropdownRef}>
          <button
            onClick={handleProfileClick}
            className="text-purple-700 hover:text-purple-900 transition duration-300 flex items-center focus:outline-none"
          >
            {user?.profilePicture ? (
              <img
                src={`http://localhost:5001${user.profilePicture}`}
                alt="Profile"
                className="w-12 h-12 object-cover rounded-full shadow-lg"
              />
            ) : (
              <FaUserCircle className="text-purple-600 w-10 h-10 p-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg" />
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && user && (
            <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 transform transition-all duration-300 ease-in-out translate-x-4">
              {/* User Info Section */}
              <div className="px-3 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  {user?.profilePicture ? (
                    <img
                      src={`http://localhost:5001${user.profilePicture}`}
                      alt="Profile"
                      className="w-10 h-10 object-cover rounded-full shadow-lg border-2 border-white"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center shadow-lg border-2 border-white">
                      <FaUserCircle className="text-white text-lg" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Options */}
              <div className="py-1">
                <button
                  onClick={() => handleNavigate("/profile")}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200 group"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                    <FaUser className="text-purple-600 text-xs" />
                  </div>
                  <span className="font-medium">My Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50 flex items-center gap-2 transition-colors duration-200 group"
                >
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors duration-200">
                    <FaSignOutAlt className="text-red-600 text-xs" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
