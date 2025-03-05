import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  // Validate email
  const validateEmail = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await apiService.forgotPassword(email);

      if (response?.success) {
        toast.success('Reset link sent to your email!');
        navigate('/login');
      } else {
        throw new Error(response?.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <div className="relative bg-white shadow-lg rounded-lg p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-black mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <motion.div
            className="mb-5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-black font-semibold mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
              placeholder="Enter your email"
            />
          </motion.div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-purple-600'} text-white font-semibold py-2 rounded-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105 shadow-lg`}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          {error && <p id="email-error" className="text-red-500 text-sm text-center mt-2">{error}</p>}
        </form>
        <p className="text-center mt-4 text-black">
          Remembered your password?{' '}
          <a href="/login" className="text-purple-600 hover:underline font-semibold">Login</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
