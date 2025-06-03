import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Get logged in user's email if available
    const loggedInEmail = localStorage.getItem('userEmail');
    if (loggedInEmail) {
      setEmail(loggedInEmail);
    }
  }, []);

  const validateEmail = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      } else if (email.length > 100) {
        newErrors.email = 'Email address is too long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) {
      toast.error('Please fix the errors before submitting', {
        duration: 4000,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        toast.success('OTP sent successfully! Please check your email.', {
          duration: 5000,
          position: 'top-right',
        });
        // Navigate to reset password page with email
        navigate('/reset-password', { state: { email } });
      }
    } catch (error) {
      console.error('Error details:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            style: {
              background: '#22C55E',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#22C55E',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#EF4444',
            },
          },
          warning: {
            style: {
              background: '#F97316',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#F97316',
            },
          },
        }}
      />
      <motion.div
        className="bg-white shadow-lg rounded-lg p-7 max-w-lg w-full mx-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-3xl font-bold text-center text-black mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Forgot Password
        </motion.h2>

        <motion.p
          className="text-gray-600 text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Enter your email address to receive an OTP for password reset
        </motion.p>

          <form onSubmit={handleSubmit}>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-black font-semibold mb-2">Email</label>
              <input
              id="email"
                type="email"
                value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear error when user starts typing
                if (errors.email) {
                  setErrors({ ...errors, email: '' });
                }
              }}
              required
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
              }`}
                placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </motion.div>

          <motion.button
              type="submit"
              disabled={loading}
            className={`w-full p-2 rounded-lg font-semibold text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
            } transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </motion.button>
          </form>

        <div className="text-center mt-6">
          <p className="text-gray-600 font-medium">
            Remember your password?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-purple-600 hover:text-purple-800 transition-all duration-300 transform hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

