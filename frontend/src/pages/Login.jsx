import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import apiService from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setToken } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      toast.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.login(email, password);

      if (response?.success && response?.data?.token) {
        const token = response.data.token;
        
        localStorage.setItem('token', token);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('user', JSON.stringify(decodedToken));

        setToken(token);
        setUser(decodedToken);

        // Show success toast and wait for it to be visible
        toast.success('Logged in successfully!', {
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

        // Wait for 1 second before navigating
        setTimeout(() => {
          navigate('/profile');
        }, 1000);
      } else {
        throw new Error(response?.message || 'Login failed. Invalid response format.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan px-4 py-8 sm:px-6 lg:px-8">
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
          },
          warning: {
            style: {
              background: '#F97316',
              color: '#fff',
            },
          },
        }}
      />
      <motion.div
        className="bg-white shadow-lg rounded-lg p-4 sm:p-6 lg:p-5 w-full max-w-sm mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-2xl sm:text-2xl lg:text-2xl font-bold text-center text-black mb-4 sm:mb-5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          Login to Your Account
        </motion.h2>

        {/* Error message */}
        {error && <motion.p
          aria-live="assertive"
          className="text-red-600 text-center mb-3 text-sm sm:text-sm lg:text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label htmlFor="email" className="block text-black text-sm font-semibold">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div
            className="space-y-1.5"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label htmlFor="password" className="block text-black text-sm font-semibold">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
              placeholder="Enter your password"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-2 text-sm rounded-lg font-semibold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-all duration-300 transform hover:scale-105`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="text-center mt-3 text-sm text-black font-medium">
          Don&apos;t have an account?{' '}
          <span className="text-blue-700 font-medium">Choose an option to register:</span>
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mt-3">
          <motion.a
            href="/signup"
            className="w-full p-2 text-sm text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Patient Registration
          </motion.a>
          <motion.a
            href="/doctor-signup"
            className="w-full p-2 text-sm text-center bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Doctor Registration
          </motion.a>
        </div>

        <p className="text-center mt-3 text-sm text-gray-600 font-medium">
          <a
            href="/forgot-password"
            className="text-purple-600 hover:text-purple-800 transition-all duration-300 transform hover:underline"
          >
            Forgot Password?
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
