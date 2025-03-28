import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaStethoscope,
  FaArrowRight,
  FaStar,
  FaUserMd,
  FaUsers,
  FaRobot,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import aihome from "../assets/aihome.jpg";
import apiService from "../services/apiService";
import { toast } from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 py-12 md:py-20">
          {/* Left Content */}
          <div className="flex-1 w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 md:space-y-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-purple-900 leading-tight">
                Smart Healthcare
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-blue-600 to-purple-700 animate-gradient">
                  Powered by AI
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-purple-700 max-w-lg leading-relaxed">
                Experience modern healthcare with our AI-powered platform. Get
                instant medical insights and connect with expert doctors for
                personalized care.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-700 to-blue-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Get Started</span>
                  {/* <FaArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" /> */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-800 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </motion.button>
                <motion.button
                  onClick={() => navigate("/aichat")}
                  className="w-full sm:w-auto bg-white text-purple-700 px-8 py-4 rounded-xl font-medium hover:shadow-xl transition-all flex items-center justify-center gap-2 group border-2 border-purple-700 hover:bg-purple-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaStethoscope className="text-xl" />
                  Ask AI
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            className="flex-1 w-full md:w-1/2 relative"
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
              <div className="relative mt-12">
                <img
                  src={aihome}
                  alt="AI Healthcare"
                  className="w-full h-[300px] sm:h-[400px] md:h-[450px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Doctor List Section */}
        <div className="py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-purple-900 mb-4">
              Our Expert Doctors
            </h2>
            <p className="text-purple-700 max-w-2xl mx-auto">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.slice(0, 9).map((doctor, index) => (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden w-64 mx-auto hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative w-full h-56">
                    {doctor.profilePicture ? (
                      <img
                        src={`http://localhost:5001${doctor.profilePicture}`}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <FaUserMd className="text-4xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-purple-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-purple-700">{doctor.specialization}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="py-16 bg-white/50 rounded-2xl my-8 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-purple-900 mb-4">
              Our Impact
            </h2>
            <p className="text-purple-700 max-w-2xl mx-auto">
              Making healthcare accessible to everyone
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaUserMd className="text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-700 mb-2">10+</div>
              <div className="text-gray-600">Doctors</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaUsers className="text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-700 mb-2">
                100+
              </div>
              <div className="text-gray-600">Patients</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaRobot className="text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-700 mb-2">
                24/7
              </div>
              <div className="text-gray-600">AI Support</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-4 rounded-xl bg-white/80 shadow-sm hover:shadow-xl transition-shadow hover:bg-white"
            >
              <FaCheckCircle className="text-4xl text-purple-700 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-700 mb-2">95%</div>
              <div className="text-gray-600">Accuracy</div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
