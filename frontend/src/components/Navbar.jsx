import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleDropdownEnter = (dropdown) => {
    setActiveDropdown(dropdown); // Show the dropdown on hover
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null); // Hide the dropdown when mouse leaves
  };

  const handleDropdownItemClick = (path) => {
    setActiveDropdown(null); // Close the dropdown
    setMobileMenuOpen(false); // Close mobile menu
    navigate(path); // Navigate to selected path
  };

  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-700 p-4 shadow-lg relative">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <img src={logo} alt="Nearest Doctor Logo" className="h-10 w-10 mr-2 brightness-200" />
          <div className="text-white font-bold text-2xl">
            <Link to="/">Nearest Doctor</Link>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link to="/about" className="text-white text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer">About</Link>
          <Link to="/contact" className="text-white text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer">Contact</Link>

          {/* Features Dropdown */}
          <div
            className="relative dropdown"
            onMouseEnter={() => handleDropdownEnter('features')}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="text-white text-lg font-medium focus:outline-none transition duration-300 transform hover:scale-105 cursor-pointer"
            >
              Features
            </button>
            <div
              className={`absolute z-10 bg-white text-black shadow-lg mt-2 rounded transition-all ease-in-out duration-500 max-h-0 overflow-hidden ${activeDropdown === 'features' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/video-consultation')}
              >
                Video Consultation
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/medication-reminder')}
              >
                Medication Reminder
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/health-tracker')}
              >
                Health Tracker
              </div>
            </div>
          </div>

          {/* Health Management Dropdown */}
          <div
            className="relative dropdown"
            onMouseEnter={() => handleDropdownEnter('healthManagement')}
            onMouseLeave={handleDropdownLeave}
          >
            <button
              className="text-white text-lg font-medium focus:outline-none transition duration-300 transform hover:scale-105 cursor-pointer"
            >
              Health Management
            </button>
            <div
              className={`absolute z-10 bg-white text-black shadow-lg mt-2 rounded transition-all ease-in-out duration-500 max-h-0 overflow-hidden ${activeDropdown === 'healthManagement' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/billing-dashboard')}
              >
                Billing Dashboard
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/engagement-hub')}
              >
                Engagement Hub
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/chatbot')}
              >
                Chatbot
              </div>
            </div>
          </div>

          <Link to="/dashboard" className="text-white text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer">Dashboard</Link>
          <Link to="/appointment" className="text-white text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer">Appointment</Link>
          <Link to="/login" className="text-white text-lg font-medium transition duration-300 hover:scale-105 cursor-pointer">Login</Link>
        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMobileMenu} className="text-white text-2xl focus:outline-none">
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Profile Icon */}
        <button onClick={handleProfileClick} className="text-white ml-4 hover:text-blue-300 transition duration-300 flex items-center">
          <FaUserCircle className="text-3xl transition-transform duration-300 ease-in-out hover:scale-110 cursor-pointer" />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-800 text-white space-y-4 py-4 px-6 transition-transform transform translate-y-0">
          <Link to="/about" className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer" onClick={() => handleDropdownItemClick('/about')}>About</Link>
          <Link to="/contact" className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer" onClick={() => handleDropdownItemClick('/contact')}>Contact</Link>

          {/* Features Dropdown for Mobile */}
          <div className="relative">
            <button
              className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer"
              onClick={() => handleDropdownEnter('features')}
            >
              Features
            </button>
            <div
              className={`bg-white text-black mt-2 rounded shadow-lg cursor-pointer ${activeDropdown === 'features' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/video-consultation')}
              >
                Video Consultation
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/medication-reminder')}
              >
                Medication Reminder
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/health-tracker')}
              >
                Health Tracker
              </div>
            </div>
          </div>

          {/* Health Management Dropdown for Mobile */}
          <div className="relative">
            <button
              className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer"
              onClick={() => handleDropdownEnter('healthManagement')}
            >
              Health Management
            </button>
            <div
              className={`bg-white text-black mt-2 rounded shadow-lg cursor-pointer ${activeDropdown === 'healthManagement' ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/billing-dashboard')}
              >
                Billing Dashboard
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/engagement-hub')}
              >
                Engagement Hub
              </div>
              <div
                className="block px-4 py-2 hover:bg-blue-100 transition duration-200 cursor-pointer scale-95 hover:scale-105"
                onClick={() => handleDropdownItemClick('/chatbot')}
              >
                Chatbot
              </div>
            </div>
          </div>

          <Link to="/dashboard" className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer" onClick={() => handleDropdownItemClick('/dashboard')}>Dashboard</Link>
          <Link to="/appointment" className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer" onClick={() => handleDropdownItemClick('/appointment')}>Appointment</Link>
          <Link to="/login" className="block text-lg font-medium transition duration-300 hover:underline cursor-pointer" onClick={() => handleDropdownItemClick('/login')}>Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
