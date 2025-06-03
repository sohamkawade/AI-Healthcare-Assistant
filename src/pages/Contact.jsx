import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPhoneAlt, FaQuestionCircle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import contactImg from '../assets/contact.jpg';
import axios from 'axios';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (decodedToken.exp < Date.now() / 1000) {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        } else {
          setIsAuthenticated(true);
          setUserEmail(decodedToken.email);
          setFormData(prev => ({ ...prev, email: decodedToken.email }));
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, phone, message } = formData;

    // Name validation - only letters and spaces allowed
    if (!name.trim()) {
      toast.error('Name is required.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }
    if (!/^[a-zA-Z\s]*$/.test(name)) {
      toast.error('Name can only contain letters and spaces.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }

    // Email validation
    if (!email.trim()) {
      toast.error('Email is required.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }

    // Check if email matches registered user's email
    if (email !== userEmail) {
      toast.error('Please use the email address you registered with.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }

    // Phone validation - exactly 10 digits
    if (!phone.trim()) {
      toast.error('Phone number is required.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }

    // Message validation
    if (!message.trim()) {
      toast.error('Message is required.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication first
    if (!isAuthenticated) {
      toast.error('Please login to send a message', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      navigate('/login');
      return;
    }

    // Then validate form
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(
        'http://localhost:5001/api/contacts/submit', 
        formData,
        { headers }
      );

      if (response.data.success) {
        toast.success('Message sent successfully!', {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#22C55E',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        navigate("/");
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        toast.error(response.data.message || 'Error sending message.', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Server error. Try again later.', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <div className="pt-20 md:pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Toaster />
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-900 mb-4">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-purple-700 max-w-2xl mx-auto">
              Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-6">
            {/* Contact Information and Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4 md:space-y-6"
            >
              {/* Contact Image */}
              <div className="relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src={contactImg}
                  alt="Contact Us"
                  className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover"
                />
              </div>

              {/* Contact Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaMapMarkerAlt className="text-purple-600 text-lg" />
                    </div>
                    <h3 className="text-base font-medium text-purple-900">Address</h3>
                  </div>
                  <p className="text-sm text-purple-700">123 Healthcare Street, Medical District, City, Country</p>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <FaClock className="text-purple-600 text-lg" />
                    </div>
                    <h3 className="text-base font-medium text-purple-900">Working Hours</h3>
                  </div>
                  <p className="text-sm text-purple-700">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-purple-700">Sat: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 md:p-5 lg:p-6 max-w-md mx-auto lg:mx-0 w-full"
            >
              {!isAuthenticated && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4">
                  <p className="text-yellow-800 text-sm mb-2">Please login to send a message.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors duration-300"
                  >
                    Login Now
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-xs font-medium text-purple-900 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-purple-500 text-sm" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      className="block w-full pl-9 pr-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-purple-900 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-purple-500 text-sm" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      className="block w-full pl-9 pr-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-purple-900 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhoneAlt className="text-purple-500 text-sm" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      className="block w-full pl-9 pr-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-medium text-purple-900 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <div className="absolute top-2 left-3 flex items-start pointer-events-none">
                      <FaQuestionCircle className="text-purple-500 text-sm" />
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={!isAuthenticated}
                      rows="3"
                      className="block w-full pl-9 pr-3 py-1.5 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none disabled:bg-gray-50 disabled:text-gray-500"
                      placeholder="How can we help you?"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: isAuthenticated ? 1.02 : 1 }}
                  whileTap={{ scale: isAuthenticated ? 0.98 : 1 }}
                  type="submit"
                  disabled={!isAuthenticated}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isAuthenticated 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAuthenticated ? 'Send Message' : 'Please Login First'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;