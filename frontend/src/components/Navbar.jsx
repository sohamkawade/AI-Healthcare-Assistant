import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes, FaMoon } from "react-icons/fa";
import { MdWbSunny } from 'react-icons/md';
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleProfileClick = () => {
    navigate("/profile");
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
    setActiveDropdown(null); 
    setMobileMenuOpen(false); 
    navigate(path);
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {

    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <nav className="top-0 left-0 right-0 z-50 p-4 font-sans">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
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

        {/* Desktop Menu */}
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

          {/* Features Dropdown */}
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
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/health-tracker")}
              >
                Health Tracker
              </div>
            </div>
          </div>

          {/* Health Management Dropdown */}
          <div
            className="relative dropdown"
            onMouseEnter={() => handleDropdownEnter("healthManagement")}
            onMouseLeave={handleDropdownLeave}
          >
            <button className="text-black hover:text-purple-700 text-lg font-medium focus:outline-none transition duration-300 transform hover:scale-105 cursor-pointer">
              Health Management
            </button>
            <div
              className={`absolute z-10 bg-white text-black shadow-lg mt-2 rounded transition-all ease-in-out duration-500 max-h-0 overflow-hidden ${
                activeDropdown === "healthManagement"
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/billing-dashboard")}
              >
                Billing Dashboard
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/engagement-hub")}
              >
                Engagement Hub
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/chatbot")}
              >
                Chatbot
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

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="text-black text-2xl focus:outline-none"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Centered Icons and Links */}
        <div className="flex items-center space-x-4 ">
          {/* Dark/Light Mode Toggle Icon */}
          <button onClick={toggleDarkMode} className="text-2xl ">
            {isDarkMode ? (
              <MdWbSunny className="text-white transition duration-300" />
            ) : (
              <FaMoon className="text-black" />
            )}
          </button>

          {/* Profile Icon */}
          <button
            onClick={handleProfileClick}
            className="text-purple-700 hover:text-purple-900 transition duration-300 flex items-center"
          >
            <FaUserCircle className="text-3xl transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 text-black space-y-4 py-4 px-6 transition-transform transform translate-y-0">
          <Link
            to="/about"
            className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer"
            onClick={() => handleDropdownItemClick("/about")}
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer"
            onClick={() => handleDropdownItemClick("/contact")}
          >
            Contact
          </Link>

          {/* Features Dropdown for Mobile */}
          <div className="relative">
            <button
              className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer"
              onClick={() => handleDropdownEnter("features")}
            >
              Features
            </button>
            <div
              className={`bg-black text-black mt-2 rounded shadow-lg cursor-pointer ${
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
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick("/health-tracker")}
              >
                Health Tracker
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
