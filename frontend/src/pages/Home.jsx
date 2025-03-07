import React from "react";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaStethoscope,
  FaFileMedical,
  FaCalendarCheck,
  FaHeadset,
  FaBrain,
  FaHeartbeat,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../pages/Home.css";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan flex flex-col items-center min-h-screen text-black">
      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center text-center p-8 mb-10">
        <motion.h1
          className="text-6xl font-bold mb-4 text-purple-800 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Revolutionizing Healthcare with AI
        </motion.h1>
        <motion.p
          className="text-xl mb-6 text-purple-600 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Expert medical assistance, anytime, anywhere
        </motion.p>
        <motion.h2
          className="text-3xl mb-6 text-purple-700 font-semibold"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join our community for better healthcare!
        </motion.h2>
        <motion.button
          onClick={handleGetStartedClick}
          className="bg-purple-600 text-white rounded-lg px-8 py-4 hover:bg-purple-700 transition-all duration-300 shadow-md transform hover:scale-105"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Get Started
        </motion.button>
      </div>

      {/* Features Section */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-8 mx-4 mb-10">
        {[
          {
            icon: <FaStethoscope className="text-purple-500 mr-2 text-4xl" />,
            text: "Symptom Checker",
          },
          {
            icon: <FaFileMedical className="text-purple-500 mr-2 text-4xl" />,
            text: "Medical Records Management",
          },
          {
            icon: <FaCalendarCheck className="text-purple-500 mr-2 text-4xl" />,
            text: "Appointment Booking",
          },
          {
            icon: <FaHeadset className="text-purple-500 mr-2 text-4xl" />,
            text: "24/7 Customer Support",
          },
          {
            icon: <FaBrain className="text-purple-500 mr-2 text-4xl" />,
            text: "AI-Powered Diagnostics",
          },
          {
            icon: <FaHeartbeat className="text-purple-500 mr-2 text-4xl" />,
            text: "Personalized Treatment Plans",
          },
        ].map(({ icon, text }, index) => (
          <motion.div
            key={index}
            className="flex items-center  bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="flex items-center">
              {icon}
              <span className="ml-2 text-lg">{text}</span>
            </div>
            
          </motion.div>
        ))}
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="bg-white p-10 rounded-lg shadow-lg mx-4 mb-10 border-t-4 border-purple-500"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold text-center mb-6 text-purple-800">
          What Our Users Say
        </h2>
        
        <a
          href="/aichat"
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          chat with us
        </a>
        <motion.p
          className="text-lg mb-4 flex items-center justify-center text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <FaCheckCircle className="text-purple-500 mr-2" />
          <em>
            "The AI Healthcare Assistant has transformed my healthcare
            experience!"
          </em>
        </motion.p>
        <motion.p
          className="text-lg mb-4 flex items-center justify-center text-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FaCheckCircle className="text-purple-500 mr-2" />
          <em>"I love how easy it is to access my medical records!"</em>
        </motion.p>
      </motion.div>
    </div>
  );
};
export default Home;
