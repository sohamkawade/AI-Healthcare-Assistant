import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaCalendarAlt, FaHeartbeat, FaBell, FaCapsules, FaWalking, FaTint } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import BackButton from '../components/BackButton';

const Dashboard = () => {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null); 
  const [healthTrackerData, setHealthTrackerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('User object (Profile):', user);  
    if (user && user._id) {  
      setUserId(user._id);  

    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!userId) return; 
    console.log('UserId for fetching health data:', userId);
    const fetchHealthData = async () => {
      try {
        setLoading(true);
        console.log('Fetching health data for userId:', userId);
        const data = await apiService.getHealthData(userId);
        setHealthTrackerData(data);
      } catch (err) {
        setError('Error fetching health tracker data');
        console.error('Error fetching health tracker data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();
  }, [userId]); 

  const cardVariant = {
    hover: { scale: 1.05, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)' },
    tap: { scale: 0.95 },
  };

  const titleAnimation = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    transition: { type: 'spring', duration: 0.8 },
  };

  return (
    <div className="min-h-screen  bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-8 text-gray-700 font-sans">
      {/* Back Button */}
      <BackButton />
      <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-10">
        Welcome to Your Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Profile */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaUserCircle className="mr-2 text-2xl" />
            Profile
          </motion.h2>
          <ul className="text-sm space-y-2">
            <li><strong>Name:</strong> {user?.firstName} {user?.lastName}</li>
            <li><strong>Age:</strong> {user?.birthdate && Math.floor((new Date() - new Date(user.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))}</li>
            <li><strong>Email:</strong> {user?.email}</li>
          </ul>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaCalendarAlt className="mr-2 text-2xl" />
            Upcoming Appointments
          </motion.h2>
          <ul className="text-sm space-y-2">
            {loading ? (
              <li>Loading appointments...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : (
              healthTrackerData?.upcomingAppointments?.length > 0 ? (
                healthTrackerData.upcomingAppointments.map((appointment) => (
                  <li key={appointment.id} className="flex justify-between">
                    <span>{appointment.doctor}</span>
                    <span className="text-gray-500">{appointment.date}</span>
                  </li>
                ))
              ) : (
                <li>No upcoming appointments.</li>
              )
            )}
          </ul>
        </motion.div>

        {/* Health Records */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaHeartbeat className="mr-2 text-2xl" />
            Health Records
          </motion.h2>
          <ul className="text-sm space-y-2">
            {loading ? (
              <li>Loading health records...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : (
              healthTrackerData?.healthRecords?.length > 0 ? (
                healthTrackerData.healthRecords.map((record) => (
                  <li key={record.id} className="flex justify-between">
                    <span>{record.label}</span>
                    <span className="text-gray-500">{record.value}</span>
                  </li>
                ))
              ) : (
                <li>No health records available.</li>
              )
            )}
          </ul>
        </motion.div>

        {/* Notifications */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaBell className="mr-2 text-2xl" />
            Notifications
          </motion.h2>
          <ul className="text-sm space-y-2">
            {loading ? (
              <li>Loading notifications...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : (
              healthTrackerData?.notifications?.length > 0 ? (
                healthTrackerData.notifications.map((notification, index) => (
                  <li key={index} className="text-gray-500">{notification}</li>
                ))
              ) : (
                <li>No notifications.</li>
              )
            )}
          </ul>
        </motion.div>

        {/* Medication Management */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaCapsules className="mr-2 text-2xl" />
            Medication Management
          </motion.h2>
          <p className="text-sm">Track your medications and receive reminders.</p>
        </motion.div>

        {/* Health Tracker */}
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <motion.h2 {...titleAnimation} className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaWalking className="mr-2 text-2xl" />
            Health Tracker
          </motion.h2>
          {loading ? (
            <p>Loading health tracker data...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            healthTrackerData && (
              <div className="text-sm space-y-4">
                {/* Sleep Information */}
                <div>
                  <h3 className="font-bold text-green-500">Sleep</h3>
                  <p><strong>Duration:</strong> {healthTrackerData.sleep?.duration} hours</p>
                  <p><strong>Quality:</strong> {healthTrackerData.sleep?.quality}</p>
                </div>

                {/* Nutrition Information */}
                <div>
                  <h3 className="font-bold text-green-500">Nutrition</h3>
                  <p><strong>Calories:</strong> {healthTrackerData.nutrition?.calories} kcal</p>
                  <p><strong>Macronutrient:</strong> {healthTrackerData.nutrition?.macronutrients}</p>
                </div>

                {/* Mental Health Information */}
                <div>
                  <h3 className="font-bold text-green-500">Mental Health</h3>
                  <p><strong>Mood:</strong> {healthTrackerData.mentalHealth?.mood}</p>
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
