import React, { useState } from 'react';
import { FaHeartbeat, FaUserMd, FaLock, FaClock, FaUsers } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const About = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div
    className="flex justify-center p-10 items-center min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100"
    >
      {/* Back Button */}
      <BackButton />
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-5xl w-full mx-4 border-t-4 border-blue-500">
        <h2 className="text-5xl font-bold text-blue-700 mb-6">About Us</h2>

        {/* Introduction Section */}
        <section className="mb-6">
          <p className="text-lg text-gray-800 mb-4">
            Welcome to our AI Healthcare Assistant platform! Our mission is to provide accessible and advanced healthcare services utilizing the latest technologies. We believe that everyone deserves quality healthcare, and we strive to make that a reality through innovation and commitment.
          </p>
        </section>

        {/* Mission Statement */}
        <section className="mb-6">
          <h3 className="text-3xl font-semibold text-blue-600 mb-4">Our Mission</h3>
          <p className="text-lg text-gray-800 mb-4">
            Our goal is to empower individuals by providing them with intelligent solutions for illness detection, specialist recommendations, and appointment scheduling, all while ensuring secure medical record management. We aim to bridge the gap between technology and healthcare, enhancing patient experiences and outcomes.
          </p>
        </section>

        {/* Technology and Partnerships Section */}
        <section className="mb-6">
          <h3 className="text-3xl font-semibold text-blue-600 mb-4">Our Technology</h3>
          <p className="text-lg text-gray-800 mb-4">
            We leverage cutting-edge AI technologies, including machine learning and natural language processing, to enhance healthcare delivery. Our partnerships with leading healthcare institutions and tech innovators enable us to continuously improve our services and ensure the best outcomes for our users.
          </p>
        </section>

        {/* Key Features Section */}
        <h3 className="text-3xl font-semibold text-blue-600 mb-4">Why Choose Us?</h3>
        <ul className="list-disc list-inside mb-4 text-left text-lg text-gray-800">
          <li className="flex items-center mb-2">
            <FaHeartbeat className="mr-2 text-blue-600" /> Advanced AI technologies for accurate health assessments, enabling timely interventions.
          </li>
          <li className="flex items-center mb-2">
            <FaUserMd className="mr-2 text-blue-600" /> User-friendly interface for seamless navigation, ensuring a smooth experience for all users.
          </li>
          <li className="flex items-center mb-2">
            <FaLock className="mr-2 text-blue-600" /> Secure and private data management with blockchain, guaranteeing the integrity and confidentiality of medical records.
          </li>
          <li className="flex items-center mb-2">
            <FaClock className="mr-2 text-blue-600" /> 24/7 access to healthcare information and services, providing users with support whenever they need it.
          </li>
          <li className="flex items-center mb-2">
            <FaUsers className="mr-2 text-blue-600" /> Dedicated team of healthcare professionals and AI experts working tirelessly to enhance our platform and services.
          </li>
        </ul>

        {/* Testimonials Section */}
        <section className="mb-6">
          <h3 className="text-3xl font-semibold text-blue-600 mb-4">Testimonials</h3>
          <blockquote className="text-lg text-gray-800 italic mb-4">
            "The AI Healthcare Assistant has transformed how I access medical information! It’s user-friendly and has saved me countless hours."
          </blockquote>
          <blockquote className="text-lg text-gray-800 italic mb-4">
            "I love the advanced features! The appointment scheduling and specialist recommendations are game-changers."
          </blockquote>
        </section>

        {/* Call-to-Action Button */}
        <div className="text-center">
          <button 
            onClick={handleModalOpen} 
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transition duration-300"
          >
            Join Our Community
          </button>
        </div>
      </div>

      {/* Modal for Join Our Community */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-5 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Join Our Community</h2>
            <p className="mb-4 text-gray-800">Thank you for your interest! To join our community, please provide your email address below:</p>
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 p-2 rounded w-full mb-4"
            />
            <div className="flex justify-between">
              <button 
                onClick={handleModalClose} 
                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition duration-300"
              >
                Submit
              </button>
              <button 
                onClick={handleModalClose} 
                className="bg-red-600 text-black rounded-lg px-4 py-2 hover:bg-red-700 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
