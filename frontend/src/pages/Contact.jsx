import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPhoneAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import BackButton from '../components/BackButton';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, phone, message } = formData;

    if (!name.trim()) {
      toast.error('Name is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Phone number must be a 10-digit number.');
      return false;
    }
    if (!message.trim()) {
      toast.error('Message cannot be empty.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('You must be logged in to send a message.');
      return;
    }

    if (!validateForm()) return;

    try {
      const response = await apiService.createContactMessage(formData);

      if (response.success) {
        toast.success('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
      } else {
        toast.error(response.message || 'An error occurred while sending your message.');
      }
    } catch (error) {
      toast.error('Error sending message. Please try again later.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Back Button */}
      <BackButton />

      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-semibold text-center text-black mb-6">Get in Touch</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full p-2 px-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-2 px-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className="w-full p-2 px-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter your message"
              className="w-full py-3 px-4 placeholder-gray-500 border rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none h-32"
            ></textarea>
          </motion.div>

          <div className="flex justify-center">
            <motion.button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-blue-700 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Contact;
