import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import apiService from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import "react-toastify/dist/ReactToastify.css";
import BackButton from '../components/BackButton';

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
      toast.error('Email and password are required.', {theme:"colored"});
      setLoading(false);
      return;
    }

    try {
      const data = await apiService.login(email, password);

      if (data && typeof data === 'string' && data.startsWith('eyJ')) {
        const token = data;

        localStorage.setItem('token', token);
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        localStorage.setItem('user', JSON.stringify(decodedToken));

        setToken(token);
        setUser(decodedToken);

        toast.success('Logged in successfully!', {theme:"colored"});
        navigate('/dashboard');
      } else {
        throw new Error('Login failed, unexpected response format. Missing token.');
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage, {theme:"colored"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Back Button */}
      <BackButton />
      <motion.div
        className="bg-white shadow-lg rounded-lg p-7 max-w-lg"
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
          Login to Your Account
        </motion.h2>

        {/* Error message */}
        {error && <motion.p
          aria-live="assertive"
          className="text-red-600 text-center mb-4 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.p>}

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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
              placeholder="Enter your email"
            />
          </motion.div>

          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label htmlFor="password" className="block text-black font-semibold mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 text-gray-800"
              placeholder="Enter your password"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-lg font-semibold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} transition-all duration-300 transform hover:scale-105`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="text-center mt-2 text-black font-medium">
          Don’t have an account?{' '}
          <span className="text-blue-700 font-medium">Choose an option to register:</span>
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <motion.a
            href="/signup"
            className="w-full sm:w-1/2 p-2 text-center bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Patient Registration
          </motion.a>
          <motion.a
            href="/doctor-signup"
            className="w-full sm:w-1/2 p-2 text-center bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Doctor Registration
          </motion.a>
        </div>

        <p className="text-center mt-4 text-gray-600 font-medium">
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
