import React from 'react';
import doctorImage from '../assets/about.jpg';
import robotImage from '../assets/about1.jpg';
import { FaHeartbeat, FaUserMd, FaBrain } from 'react-icons/fa';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-purple-900 mb-4">
            AI Healthcare Assistant
          </h1>
          <p className="text-base sm:text-lg text-purple-700 max-w-3xl mx-auto px-4">
            Empowering healthcare through innovation and intelligence. Our platform leverages cutting-edge AI to enhance patient care, streamline medical services, and provide accurate health insights.
          </p>
        </motion.section>

        {/* Image Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16"
        >
          <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src={doctorImage}
              alt="Doctor"
              className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <img
              src={robotImage}
              alt="AI Robot"
              className="w-full h-[250px] sm:h-[300px] md:h-[400px] object-cover transform hover:scale-105 transition-transform duration-300"
            />
          </div>
        </motion.section>

        {/* Key Features Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FaHeartbeat className="text-4xl md:text-5xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-purple-900 mb-2">Real-Time Health Monitoring</h3>
            <p className="text-purple-700 text-sm md:text-base">Get instant health insights and personalized recommendations.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <FaUserMd className="text-4xl md:text-5xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-purple-900 mb-2">Doctor Recommendations</h3>
            <p className="text-purple-700 text-sm md:text-base">Find the right specialists based on your health data.</p>
          </motion.div>
          <motion.div 
            whileHover={{ y: -5 }}
            className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1"
          >
            <FaBrain className="text-4xl md:text-5xl text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-semibold text-purple-900 mb-2">Smart Predictions</h3>
            <p className="text-purple-700 text-sm md:text-base">AI-powered analysis to predict health risks early.</p>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;

