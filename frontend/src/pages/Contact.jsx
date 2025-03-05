import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPhoneAlt, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import contactImg from '../assets/contact.jpg';

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
    setIsAuthenticated(!!token);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, phone, message } = formData;
    if (!name.trim()) return toast.error('Name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error('Invalid email.');
    if (!/^[0-9]{10}$/.test(phone)) return toast.error('Phone must be 10 digits.');
    if (!message.trim()) return toast.error('Message cannot be empty.');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return toast.error('Login required to send messages.');
    if (!validateForm()) return;
    try {
      const response = await apiService.createContactMessage(formData);
      if (response.success) {
        toast.success('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(response.message || 'Error sending message.');
      }
    } catch {
      toast.error('Server error. Try again later.');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6">
      <div className="flex flex-col md:flex-row items-start w-full max-w-7xl gap-28 h-[600px]">
        {/* Left Section - Image */}
        <motion.div 
          className="md:w-1/2 p-4"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src={contactImg} 
            alt="Contact" 
            className="w-full h-[500px] object-cover rounded-lg " 
          />
        </motion.div>

        {/* Right Section - Contact Form */}
        <motion.div 
          className="md:w-1/2 bg-white p-8 rounded-lg shadow-lg w-full max-w-md mt-3"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-center text-black mb-6">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {['name', 'email', 'phone'].map((field, index) => (
              <motion.div 
                className="relative" 
                key={field}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {field === 'name' && <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />}
                {field === 'email' && <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />}
                {field === 'phone' && <FaPhoneAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />}
                <input
                  type={field === 'email' ? 'email' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={`Enter your ${field}`}
                  className="w-full p-2 px-10 border rounded-lg focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
                />
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Enter your message"
                className="w-full py-3 px-4 placeholder-gray-500 border rounded-lg text-gray-800 focus:ring-2 focus:ring-purple-500 resize-none h-32"
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

      {/* FAQ Section */}
      <div className="w-full max-w-7xl text-center mt-12">
        <h3 className="text-2xl font-semibold text-black mb-4">Frequently Asked Questions</h3>
        <div className="text-left space-y-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold flex items-center"><FaQuestionCircle className="mr-2 text-blue-600" /> How do I book an appointment?</h4>
            <p className="text-gray-700 mt-2">Fill out the contact form, and we’ll guide you through the appointment process.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold flex items-center"><FaQuestionCircle className="mr-2 text-blue-600" /> Is my data secure?</h4>
            <p className="text-gray-700 mt-2">Yes, we use advanced encryption to secure your data and communications.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold flex items-center"><FaQuestionCircle className="mr-2 text-blue-600" /> What happens after I send a message?</h4>
            <p className="text-gray-700 mt-2">Our team will review your message and get back to you within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;