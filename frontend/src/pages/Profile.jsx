import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { FaUserMd, FaEnvelope, FaMapMarkerAlt, FaPhone, FaCalendarAlt } from 'react-icons/fa'; 
import { GraduationCap, HeartPulse } from "lucide-react";
import { motion } from 'framer-motion'; 

const Profile = () => {
  const { user, setUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiService.getProfile();
        if (response && response.data) {
          const userData = response.data;
          const userType = userData.specialization ? 'doctor' : 'patient';

          setUser({
            ...userData,
            userType: userType,
          });
          setProfileLoading(false);
        } else {
          toast.error('Error fetching profile data.');
          setProfileLoading(false);
        }
      } catch (error) {
        if (error.message.includes('expired')) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Error: ' + error.message);
        }
        setProfileLoading(false);
      }
    };

    if (!user) {
      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [navigate, user, setUser]);

  if (loading || profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100">
        <motion.div
          animate={{ scale: 1.2 }}
          initial={{ scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="text-center text-purple-600 font-semibold text-lg"
        >
          Loading your profile...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center text-red-600 font-semibold text-lg"
        >
          Profile data not available. Please refresh your page.
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan ">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-white shadow-xl rounded-xl w-full max-w-xl p-6 space-y-4 border-t-4 border-purple-500"
      >
        <div className="text-center">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center items-center mb-4"
          >
            <FaUserMd className="text-purple-600 w-16 h-16 p-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-2xl font-extrabold text-purple-700" // Adjusted font size
          >
            Hello, {user.firstName || 'User'}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="text-gray-600 mt-2 text-sm"
          >
            Here’s your personal healthcare profile.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4" // Adjusted gap
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
          >
            <FaUserMd className="text-purple-500 w-6 h-6 mr-3" />
            <div>
              <p className="text-gray-700 text-base font-medium">Full Name</p>
              <p className="text-gray-500 text-sm">{user.firstName} {user.lastName}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
          >
            <FaEnvelope className="text-purple-500 w-6 h-6 mr-3" />
            <div>
              <p className="text-gray-700 text-base font-medium">Email</p>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </motion.div>
        </motion.div>

        {user?.userType === 'patient' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4" // Adjusted gap
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
            >
              <FaMapMarkerAlt className="text-purple-500 w-6 h-6 mr-3" />
              <div>
                <p className="text-gray-700 text-base font-medium">Address</p>
                <p className="text-gray-500 text-sm">{user.address || 'Not Provided'}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
            >
              <FaPhone className="text-purple-500 w-6 h-6 mr-3" />
              <div>
                <p className="text-gray-700 text-base font-medium">Contact Number</p>
                <p className="text-gray-500 text-sm">{user.contactNumber || 'Not Provided'}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
            >
              <FaCalendarAlt className="text-purple-500 w-6 h-6 mr-3" />
              <div>
                <p className="text-gray-700 text-base font-medium">Birthdate</p>
                <p className="text-gray-500 text-sm">{user.birthdate?.split('T')[0] || 'Not Provided'}</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {user?.userType === 'doctor' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4" // Adjusted gap
          >
            <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
          >
            <HeartPulse className="text-purple-500 w-6 h-6 mr-3" />
            <div>
              <p className="text-gray-700 text-base font-medium">Specialization</p>
              <p className="text-gray-500 text-sm">{user.specialization}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md" // Adjusted padding
          >
            <GraduationCap className="text-purple-500 w-6 h-6 mr-3" />
            <div>
              <p className="text-gray-700 text-base font-medium">Degree</p>
              <p className="text-gray-500 text-sm">{user.degree}</p>
            </div>
          </motion.div>
        </motion.div>
        )}

        <div className="flex justify-end mt-6">
          <motion.button
            className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-500 transition-all duration-300" // Adjusted padding
            onClick={() => {
              logout();
              navigate('/login');
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;


