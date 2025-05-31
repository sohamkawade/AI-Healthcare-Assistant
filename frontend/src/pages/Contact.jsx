import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaUser, FaPhoneAlt, FaQuestionCircle } from 'react-icons/fa';
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
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#22C55E',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          }
        }}
      />
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
          <h2 className="text-3xl font-semibold text-center text-black mb-2">Get in Touch</h2>
          {!isAuthenticated && (
            <div className="bg-yellow-100  text-yellow-700 p-4 mb-4 rounded">
              <p className="font-normal">Please login to send a message.</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition duration-300"
              >
                Login Now
              </button>
            </div>
          )}
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
                  disabled={!isAuthenticated}
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
                disabled={!isAuthenticated}
              ></textarea>
            </motion.div>

            <div className="flex justify-center">
              <motion.button
                type="submit"
                className={`px-6 py-3 rounded-lg shadow-lg font-semibold transition duration-300 ${
                  isAuthenticated 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-400 text-white cursor-not-allowed'
                }`}
                whileHover={{ scale: isAuthenticated ? 1.05 : 1 }}
                whileTap={{ scale: isAuthenticated ? 0.95 : 1 }}
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? 'Contact Us' : 'Please Login First'}
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
            <p className="text-gray-700 mt-2">Fill out the contact form, and we'll guide you through the appointment process.</p>
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