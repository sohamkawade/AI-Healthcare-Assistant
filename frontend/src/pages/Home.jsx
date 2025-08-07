import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaStethoscope,
  FaUserMd,
  FaUsers,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import aihome from "../assets/aihome.jpg";
import apiService from "../services/apiService";
import { toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiService.getDoctors();

        if (response && response.success) {
          const doctorsData = response.data || [];
          setDoctors(doctorsData);
        } else {
          setDoctors([]);
          toast.error("Failed to load doctors list. Please try again later.", {
            style: {
              background: "#EF4444",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "12px 24px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
          });
        }
        setLoading(false);
      } catch (error) {
        setDoctors([]);
        toast.error(
          `Error: ${
            error.message || "An error occurred while fetching doctors list."
          }`,
          {
            style: {
              background: "#EF4444",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "12px 24px",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
          }
        );
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan overflow-x-hidden">
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 py-8 md:py-12">
          {/* Left Content */}
          <div className="flex-1 w-full md:w-1/2 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4 md:space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-purple-900 leading-tight">
                Smart Healthcare
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-purple-700 animate-gradient">
                  Powered by AI
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-purple-700 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Experience modern healthcare with our AI-powered platform. Get
                instant medical insights and connect with expert doctors for
                personalized care.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center md:justify-start">
                <motion.button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-blue-600 text-white px-6 py-3.5 rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 text-base">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/aichat")}
                  className="w-full sm:w-auto bg-white text-purple-700 px-6 py-3.5 rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 group border-2 border-purple-700 hover:bg-purple-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaStethoscope className="text-lg" />
                  <span className="text-base">Ask AI</span>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            className="flex-1 w-full md:w-1/2 relative mt-8 md:mt-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute -inset-4">
                <div className="w-full h-full bg-gradient-to-r from-purple-700/20 via-blue-600/20 to-purple-700/20 rounded-full blur-3xl animate-pulse"></div>
              </div>

              {/* Main Image */}
              <div className="relative">
                <img
                  src={aihome}
                  alt="AI Healthcare"
                  className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Doctor List Section */}
        <div className="py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-4">
              Our Expert Doctors
            </h2>
            <p className="text-purple-700 max-w-2xl mx-auto px-4">
              Meet our team of experienced healthcare professionals ready to
              provide you with the best medical care.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                No doctors available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
              {doctors
                .slice(0, isMobile ? 4 : 9)
                .map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 max-w-[200px] mx-auto w-full"
                >
                  <div className="relative w-full h-52 sm:h-56">
                    {doctor.profilePicture ? (
                      <img
                        src={`http://localhost:5001${doctor.profilePicture}`}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaUserMd className="text-3xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="text-sm sm:text-base font-semibold text-purple-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-700 mt-1">{doctor.specialization}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="py-12 md:py-16 bg-white/50 rounded-2xl my-8 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-4">
              Our Impact
            </h2>
            <p className="text-purple-700 max-w-2xl mx-auto px-4">
              Making healthcare accessible to everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaUserMd className="text-3xl md:text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-2xl md:text-4xl font-bold text-purple-700 mb-2">10+</div>
              <div className="text-sm md:text-base text-gray-600">Doctors</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaUsers className="text-3xl md:text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-2xl md:text-4xl font-bold text-purple-700 mb-2">100+</div>
              <div className="text-sm md:text-base text-gray-600">Patients</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaRobot className="text-3xl md:text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-2xl md:text-4xl font-bold text-purple-700 mb-2">24/7</div>
              <div className="text-sm md:text-base text-gray-600">AI Support</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaCheckCircle className="text-3xl md:text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-2xl md:text-4xl font-bold text-purple-700 mb-2">98%</div>
              <div className="text-sm md:text-base text-gray-600">Satisfaction</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
