import React from 'react';
import doctorImage from '../assets/about.jpg';
import robotImage from '../assets/about1.jpg';
import { FaHeartbeat, FaUserMd, FaBrain } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <section className="text-center py-12">
          <h1 className="text-6xl font-bold text-blue-700 mb-4 animate-fade-in">AI Healthcare Assistant</h1>
          <p className="text-lg text-gray-800 max-w-3xl mx-auto">
            Empowering healthcare through innovation and intelligence. Our platform leverages cutting-edge AI to enhance patient care, streamline medical services, and provide accurate health insights.
          </p>
        </section>

        {/* Image Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center">
            <img
              src={doctorImage}
              alt="Doctor"
              className="rounded-lg shadow-lg "
            />
          </div>
          <div className="text-center">
            <img
              src={robotImage}
              alt="AI Robot"
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Key Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition">
            <FaHeartbeat className="text-blue-600 text-4xl mb-4" />
            <h3 className="text-2xl font-semibold text-blue-700">Real-Time Health Monitoring</h3>
            <p className="text-gray-800">Get instant health insights and personalized recommendations.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition">
            <FaUserMd className="text-blue-600 text-4xl mb-4" />
            <h3 className="text-2xl font-semibold text-blue-700">Doctor Recommendations</h3>
            <p className="text-gray-800">Find the right specialists based on your health data.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition">
            <FaBrain className="text-blue-600 text-4xl mb-4" />
            <h3 className="text-2xl font-semibold text-blue-700">Smart Predictions</h3>
            <p className="text-gray-800">AI-powered analysis to predict health risks early.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;

