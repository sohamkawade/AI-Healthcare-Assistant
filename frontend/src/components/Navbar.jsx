import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle, FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleNavigate = (path) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
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
    handleNavigate("/profile");
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

        <div className="flex items-center space-x-4">
          <button
            onClick={handleProfileClick}
            className="text-purple-700 hover:text-purple-900 transition duration-300 flex items-center"
          >
            <FaUserCircle className="text-3xl transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
