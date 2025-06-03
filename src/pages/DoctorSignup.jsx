import React, { useState, useContext } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    contactNumber: "",
    fees: "",
    degree: "",
    specialization: "",
    profilePicture: null,
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setDoctorData } = useContext(AuthContext);
  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const degrees = [
    "MBBS",
    "MD",
    "MS",
    "BAMS",
    "BHMS",
    "Other"
  ];

  const specializations = [
    "Cardiology",
    "Dermatology",
    "General Medicine",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Dentist",
    "Other"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.warn("File size should be less than 5MB", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#F97316",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.warn("Please upload a valid image file", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#F97316",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
        return;
      }
      setFormData({
        ...formData,
        profilePicture: file,
      });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      specialization,
      contactNumber,
      fees,
      degree,
      profilePicture,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !specialization ||
      !contactNumber ||
      !fees ||
      !degree ||
      !profilePicture
    ) {
      toast.error("All fields including profile picture are required", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    // Check if profile picture is a valid image file
    if (!profilePicture.type.startsWith("image/")) {
      toast.error("Please upload a valid image file for profile picture", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    const nameRegex = /^[A-Za-z]+$/;

    if (!nameRegex.test(firstName)) {
      toast.error(
        "First name should not contain numbers or special characters",
        {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }
      );
      return false;
    }

    if (!nameRegex.test(lastName)) {
      toast.error(
        "Last name should not contain numbers or special characters",
        {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        }
      );
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    if (isNaN(fees) || fees <= 0) {
      toast.error("Fees must be a positive number", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#EF4444",
          color: "#fff",
          borderRadius: "8px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: "500",
        },
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    const formPayload = new FormData();

    // Properly append the profile picture with the original file name
    if (formData.profilePicture) {
      const fileExtension = formData.profilePicture.name.split(".").pop();
      const fileName = `${formData.firstName.toLowerCase()}_${formData.lastName.toLowerCase()}_${Date.now()}.${fileExtension}`;
      formPayload.append("profilePicture", formData.profilePicture, fileName);
    }

    // Then append other form fields
    const fieldsToAppend = [
      "firstName",
      "lastName",
      "email",
      "password",
      "contactNumber",
      "fees",
      "degree",
      "specialization",
    ];
    fieldsToAppend.forEach((field) => {
      formPayload.append(field, formData[field]);
    });

    try {
      const response = await axios.post(
        "http://localhost:5001/api/auth/register-doctor",
        formPayload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Registration successful! You can now log in.", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#22C55E",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
        setDoctorData(response.data);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred during registration";

      if (
        error.response?.status === 400 &&
        errorMessage.includes("already registered")
      ) {
        toast.error(
          "This email is already registered. Please try logging in or use a different email.",
          {
            duration: 2000,
            position: "top-right",
            style: {
              background: "#EF4444",
              color: "#fff",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "500",
            },
          }
        );
        navigate("/login");
      } else {
        toast.error(errorMessage, {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#EF4444",
            color: "#fff",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan px-4 sm:px-6 pt-20">
      <motion.div
        className="w-full sm:w-2/5 lg:w-1/3 max-w-xl p-4 sm:p-6 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Doctor Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Profile Picture at the Top */}
          <div className="flex flex-col items-center mb-3">
            <label className="block text-black mb-2 text-sm">Profile Picture</label>
            <div className="relative">
              <input
                type="file"
                name="profilePicture"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="profilePictureInput"
              />
              <label htmlFor="profilePictureInput" className="cursor-pointer">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Profile Preview"
                    className="w-14 h-14 object-cover rounded-full border-2 border-blue-400 hover:opacity-80 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-200 flex items-center justify-center rounded-full border-2 border-gray-300 hover:opacity-80 transition-opacity duration-300">
                    <span className="text-gray-500 text-xs">Upload</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Name Inputs */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div>
              <label className="block text-black text-sm">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          {/* Email and Password Inputs */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div>
              <label className="block text-black text-sm">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4" />
                  ) : (
                    <FaEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Contact Number and Fees */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div>
              <label className="block text-black text-sm">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-black text-sm">Fees</label>
              <input
                type="number"
                name="fees"
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                placeholder="Enter consultation fees"
                value={formData.fees}
                onChange={handleChange}
                required
              />
            </div>
          </motion.div>

          {/* Degree and Specialization */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div>
              <label className="block text-black text-sm">Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              >
                <option value="" disabled>Select Degree</option>
                {degrees.map((degree) => (
                  <option key={degree} value={degree}>
                    {degree}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-black text-sm">Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full p-1.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                required
              >
                <option value="" disabled>Select Specialization</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-1.5 mt-3 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform transition duration-300 ease-in-out hover:scale-105 text-sm"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        {/* Login Redirect */}
        <p className="text-center mt-2 text-black font-medium text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:underline"
          >
            Login here
          </a>
        </p>

        {/* Toast for notifications */}
        <Toaster />
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
