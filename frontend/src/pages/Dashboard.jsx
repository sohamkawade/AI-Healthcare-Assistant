import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUserCircle, FaCalendarAlt, FaBell } from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchAppointments();
    }
  }, [user, navigate]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!user?.patientId) {
        console.warn("Patient ID is undefined. Check authentication.");
        setLoading(false);
        return;
      }

      console.log("Patient ID:", user.patientId); // Debugging

      const response = await axios.get(
        `http://localhost:5000/api/appointments/${user.patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        setAppointments(response.data.data);
      } else {
        setError(response.data.message || "Failed to load appointments.");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cardVariant = {
    hover: { scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-8 text-gray-700 font-sans">
      <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-10">
        Welcome to Your Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <h2 className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaUserCircle className="mr-2 text-2xl" /> Profile
          </h2>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Name:</strong> {user?.firstName} {user?.lastName}
            </li>
            <li>
              <strong>Email:</strong> {user?.email}
            </li>
            <li>
              <strong>Contact No:</strong> {user?.contactNumber}
            </li>
          </ul>
        </motion.div>

        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <h2 className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaCalendarAlt className="mr-2 text-2xl" /> Appointments
          </h2>
          <ul className="text-sm space-y-2">
            {loading ? (
              <li>Loading appointments...</li>
            ) : error ? (
              <li className="text-red-500">{error}</li>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <li
                  key={appointment._id}
                  className="p-4 bg-gray-100 rounded-lg shadow"
                >
                  <p>
                    <strong>Doctor:</strong> {appointment.doctor.name} ({appointment.doctor.specialization})
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(appointment.slotDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {appointment.slotTime}
                  </p>
                </li>
              ))
            ) : (
              <li>No appointments scheduled.</li>
            )}
          </ul>
        </motion.div>

        <motion.div
          className="bg-white shadow-lg rounded-xl p-6 border-t-4 border-blue-500"
          variants={cardVariant}
          whileHover="hover"
          whileTap="tap"
        >
          <h2 className="text-xl font-bold flex items-center mb-4 text-blue-600">
            <FaBell className="mr-2 text-2xl" /> Notifications
          </h2>
          <ul className="text-sm space-y-2">
            <li>No new notifications.</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
