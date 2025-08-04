import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaMoneyBillWave,
  FaInfoCircle,
  FaPhoneAlt,
  FaVideo,
  FaPills,
  FaCalendarAlt,
  FaSignInAlt,
  FaHome,
  FaChartLine,
} from "react-icons/fa";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user, setUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

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
    <nav className="fixed top-0 left-0 right-0 z-50 p-4 font-sans border-b border-gray-400 pb-4 w-[90%] mx-auto bg-white">
      <div className="container mx-auto flex justify-between items-center bg-white">
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center ml-20">
          <NavLink
            to="/about"
            className={({isActive}) =>
              `block py-0.5 pr-4 pl-3 duration-100 ${
                isActive ? "bg-purple-300 text-purple-700 rounded-full" : "text-gray-800"
              } text-black hover:text-purple-700 text-lg font-medium transition duration-0 hover:scale-105 cursor-pointer`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `block py-0.5 pr-4 pl-3 duration-200 ${
                isActive ? "bg-purple-300 text-purple-700 rounded-full" : "text-gray-800"
              } text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer`
            }
          >
            Contact
          </NavLink>

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
            </div>
          </div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block py-0.5 pr-4 pl-3 duration-200 ${
                isActive ? "bg-purple-300 text-purple-700 rounded-full" : "text-gray-800"
              } text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/appointment"
            className={({ isActive }) =>
              `block py-0.5 pr-4 pl-3 duration-200 ${
                isActive ? "bg-purple-300 text-purple-700 rounded-full" : "text-gray-800"
              } text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer`
            }
          >
            Appointment
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `block py-0.5 pr-4 pl-3 duration-200 ${
                isActive ? "bg-purple-300 text-purple-700 rounded-full" : "text-gray-800"
              } text-black hover:text-purple-700 text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer`
            }
          >
            Login
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="mobile-menu-button text-black text-2xl focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Profile Section */}
        <div
          className="flex items-center space-x-4 relative"
          ref={profileDropdownRef}
        >
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
                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {user?.email}
                    </p>
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

      {/* Mobile Menu Sidebar */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header - Simplified */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-end">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-purple-100 transition-all duration-300 hover:scale-110 cursor-pointer"
                >
                  <FaTimes className="text-gray-600 text-base" />
                </button>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <div className="p-4 space-y-2">
              <Link
                to="/"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-purple-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                  <FaHome className="text-purple-600 text-base" />
                </div>
                <span className="font-medium">Home</span>
              </Link>

              <Link
                to="/about"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-blue-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                  <FaInfoCircle className="text-blue-600 text-base" />
                </div>
                <span className="font-medium">About</span>
              </Link>

              <Link
                to="/contact"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-green-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center group-hover:from-green-200 group-hover:to-emerald-200 transition-all duration-300">
                  <FaPhoneAlt className="text-green-600 text-base" />
                </div>
                <span className="font-medium">Contact</span>
              </Link>

              <Link
                to="/video-consultation"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-cyan-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-teal-100 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-teal-200 transition-all duration-300">
                  <FaVideo className="text-cyan-600 text-base" />
                </div>
                <span className="font-medium">Video Consultation</span>
              </Link>

              <Link
                to="/dashboard"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-violet-50 hover:text-indigo-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-indigo-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-violet-200 transition-all duration-300">
                  <FaChartLine className="text-indigo-600 text-base" />
                </div>
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                to="/appointment"
                className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-pink-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group-hover:from-pink-200 group-hover:to-rose-200 transition-all duration-300">
                  <FaCalendarAlt className="text-pink-600 text-base" />
                </div>
                <span className="font-medium">Appointment</span>
              </Link>

              {!user && (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-purple-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                    <FaSignInAlt className="text-purple-600 text-base" />
                  </div>
                  <span className="font-medium">Login</span>
                </Link>
              )}

              {user && (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-300 group hover:shadow-md hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-red-200"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center group-hover:from-red-200 group-hover:to-rose-200 transition-all duration-300">
                    <FaSignOutAlt className="text-red-600 text-base" />
                  </div>
                  <span className="font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
