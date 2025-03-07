import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const { registerUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthdate: '',
    contactNumber: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { firstName, lastName, email, password, birthdate, contactNumber, address } = formData;
    const nameRegex = /^[A-Za-z]+$/;

    if (!firstName || !lastName || !email || !password || !address || !birthdate || !contactNumber) {
      toast.error('All fields are required', {theme:"colored"});
      return false;
    }

    if (!nameRegex.test(firstName)) {
      toast.error('First name should not contain numbers or special characters', { theme: 'colored' });
      return false;
    }
  
    if (!nameRegex.test(lastName)) {
      toast.error('Last name should not contain numbers or special characters', { theme: 'colored' });
      return false;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', {theme:"colored"});
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email',{theme:"colored"});
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber)) {
      toast.error('Please enter a valid 10-digit contact number',{theme:"colored"});
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiService.registerPatient(formData);

      if (response?.success) {
        const userData = response.data;

        if (!userData?.token) {
          throw new Error("Token is missing from registration response.");
        }

        toast.success("Registration successful! You can now log in.", {theme:"colored"});
        localStorage.setItem("authToken", userData.token);
        registerUser(userData);
        navigate("/login")

        const profileResponse = await apiService.getProfile(userData.token);
        if (profileResponse?.success) {
          registerUser(profileResponse.data);
          navigate("/login");
          
        } else {
          toast.error("Failed to retrieve your profile information.",{theme:"colored"});
        }
      } else {
        toast.error("Registration failed. Please try again.",{theme:"colored"});
      }
    } catch (error) {
      console.error("Registration Error:", error.message);
      toast.error(error.message || "An unexpected error occurred.",{theme:"colored"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <motion.div
        className="w-2/5 max-w-2xl p-7 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Patient Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Inputs */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div>
              <label className="block text-black">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          {/* Email and Password Inputs */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <label className="block text-black">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black">Password</label>
              <input
                type="password"
                name="password"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          {/* Contact Number and Birth Date */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div>
              <label className="block text-black">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black">Birth Date</label>
              <input
                type="date"
                name="birthdate"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.birthdate}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          {/* Address Input */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-black">Address</label>
            <input
              type="text"
              name="address"
              className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-2 mt-6 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform transition duration-300 ease-in-out hover:scale-105"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        {/* Login Redirect */}
        <p className="text-center mt-2 text-black font-medium">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:underline"
          >
            Login here
          </a>
        </p>
      </motion.div>

      {/* Toast for notifications */}
      <ToastContainer />
    </div>
  );
};

export default Signup;
