import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from 'react-hot-toast';
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import {
  FaUserMd,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
  FaCalendarAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaMoneyBillWave,
} from "react-icons/fa";
import { GraduationCap, HeartPulse } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, setUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the state immediately for all fields
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      // Validate email before saving
      if (!validateEmail(editedUser.email)) {
        return;
      }

      const formData = new FormData();
      
      // Append all user data
      Object.keys(editedUser).forEach(key => {
        if (key !== 'userType' && key !== 'profilePicture' && editedUser[key] !== undefined && editedUser[key] !== null) {
          if (key === 'fees') {
            if (editedUser[key] && editedUser[key] !== '') {
              formData.append(key, editedUser[key]);
            }
          } else {
            formData.append(key, editedUser[key]);
          }
        }
      });

      if (profilePicture) {
        formData.append('profilePicture', profilePicture);
      }

      const response = await apiService.updateProfile(formData);
      
      if (response.success) {
        setIsEditing(false);
        setProfilePicture(null);
        toast.success('Profile updated successfully!');
        
        setTimeout(() => {
          setRefreshTrigger(prev => prev + 1);
        }, 1000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await apiService.getProfile();
        if (response && response.data) {
          const userData = response.data;
          const userType = userData.specialization ? "doctor" : "patient";
          
          if (userData.fees !== undefined) {
            userData.fees = Number(userData.fees);
          }
          
          setUser({
            ...userData,
            userType: userType,
          });
          setEditedUser({
            ...userData,
            userType: userType,
          });
          setProfileLoading(false);
        } else {
          toast.error("Error fetching profile data.");
          setProfileLoading(false);
        }
      } catch (error) {
        if (error.message.includes("expired")) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
        } else {
          toast.error("Error: " + error.message);
        }
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, setUser, refreshTrigger]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
    setProfilePicture(null);
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
        <div className="text-center text-purple-600 font-semibold text-lg">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
        <div className="text-center text-red-600 font-semibold text-lg">
          Profile data not available. Please refresh your page.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
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
      <div className="bg-white shadow-xl rounded-xl w-full max-w-xl p-6 space-y-5 border-t-4 border-purple-500">
        <div className="text-center">
          <div className="flex justify-center items-center mb-3">
            {isEditing ? (
              <div className="relative">
                <img
                  src={profilePicture ? URL.createObjectURL(profilePicture) : (editedUser.profilePicture ? `http://localhost:5001${editedUser.profilePicture}` : null)}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-full"
                />
                <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-purple-700">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <FaEdit className="w-3 h-3" />
                </label>
              </div>
            ) : (
              editedUser?.profilePicture ? (
                <img
                  src={`http://localhost:5001${editedUser.profilePicture}`}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <FaUserMd className="text-purple-600 w-12 h-12 p-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full shadow-lg" />
              )
            )}
          </div>

          <h1 className="text-xl font-extrabold text-purple-700">
            Hello, {editedUser?.userType === "doctor" ? `Dr. ${editedUser?.firstName || "User"}` : editedUser?.firstName || "User"}!
          </h1>
          <p className="text-gray-600 mt-1.5 text-sm">
            Here's your personal healthcare profile.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md"
          >
            <FaUserMd className="text-purple-500 w-5 h-5 mr-2.5" />
            <div className="flex-1">
              <p className="text-gray-700 text-sm font-medium">Full Name</p>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="firstName"
                    value={editedUser?.firstName || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={editedUser?.lastName || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Last Name"
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-sm break-words">
                  {editedUser?.userType === "doctor" ? `Dr. ${editedUser?.firstName} ${editedUser?.lastName}` : `${editedUser?.firstName} ${editedUser?.lastName}`}
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
          >
            <FaEnvelope className="text-purple-500 w-5 h-5 mr-2.5" />
            <div className="flex-1">
              <p className="text-gray-700 text-sm font-medium">Email</p>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedUser?.email || ''}
                  onChange={handleChange}
                  className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              ) : (
                <p className="text-gray-500 text-sm break-all truncate hover:text-clip hover:whitespace-normal">
                  {editedUser?.email}
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>

        {editedUser?.userType === "patient" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
            >
              <FaPhone className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">
                  Contact Number
                </p>
                {isEditing ? (
                  <input
                    type="tel"
                    name="contactNumber"
                    value={editedUser?.contactNumber || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">
                    {editedUser?.contactNumber || "Not Provided"}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
            >
              <FaCalendarAlt className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">Birthdate</p>
                {isEditing ? (
                  <input
                    type="date"
                    name="birthdate"
                    value={editedUser?.birthdate?.split("T")[0] || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">
                    {editedUser?.birthdate?.split("T")[0] || "Not Provided"}
                  </p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px] sm:col-span-2"
            >
              <FaMapMarkerAlt className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">Address</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={editedUser?.address || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your address"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">
                    {editedUser?.address || "Not Provided"}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {editedUser?.userType === "doctor" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
            >
              <HeartPulse className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">
                  Specialization
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="specialization"
                    value={editedUser?.specialization || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your specialization"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">{editedUser?.specialization}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
            >
              <GraduationCap className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">Degree</p>
                {isEditing ? (
                  <input
                    type="text"
                    name="degree"
                    value={editedUser?.degree || ''}
                    onChange={handleChange}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your degree"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">{editedUser?.degree}</p>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex items-center bg-purple-50 p-3 rounded-lg shadow-md min-h-[80px]"
            >
              <FaMoneyBillWave className="text-purple-500 w-5 h-5 mr-2.5" />
              <div className="flex-1">
                <p className="text-gray-700 text-sm font-medium">Consultation Fee (₹)</p>
                {isEditing ? (
                  <input
                    type="number"
                    name="fees"
                    value={editedUser?.fees || ''}
                    onChange={handleChange}
                    min="0"
                    step="100"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter consultation fee"
                  />
                ) : (
                  <p className="text-gray-500 text-sm break-words">
                    {(() => {
                      if (editedUser?.exactFee) {
                        return `₹${editedUser.exactFee}`;
                      }
                      if (editedUser?.fees) {
                        return `₹${editedUser.fees}`;
                      }
                      return 'Not Set';
                    })()}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="flex justify-end mt-4 gap-3">
          {isEditing ? (
            <>
              <motion.button
              className="bg-green-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-green-500 transition-all duration-300 text-sm"
              onClick={handleSave}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaSave className="inline-block mr-1.5 w-3 h-3" />
              Save Changes
            </motion.button>
            <motion.button
              className="bg-gray-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300 text-sm"
              onClick={handleCancel}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaTimes className="inline-block mr-1.5 w-3 h-3" />
              Cancel
            </motion.button>
            </>
          ) : (
            <motion.button
              className="bg-purple-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-purple-500 transition-all duration-300 text-sm"
              onClick={handleEdit}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <FaEdit className="inline-block mr-1.5 w-3 h-3" />
              Edit Profile
            </motion.button>
          )}
          <motion.button
            className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-md hover:bg-red-500 transition-all duration-300 text-sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
