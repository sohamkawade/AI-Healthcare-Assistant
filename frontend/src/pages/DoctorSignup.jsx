import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import BackButton from "../components/BackButton";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    contactNumber: "",
    certificationDocument: null, // New field for certification upload
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setDoctorData } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      certificationDocument: e.target.files[0],
    });
  };

  const validateForm = () => {
    const {
      firstName,
      lastName,
      email,
      password,
      specialization,
      contactNumber,
      certificationDocument,
    } = formData;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !specialization ||
      !contactNumber ||
      !certificationDocument
    ) {
      toast.error("All fields are required", { theme: "colored" });
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", {
        theme: "colored",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email", { theme: "colored" });
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number", {
        theme: "colored",
      });
      return false;
    }

    // Validate specialization
    const validSpecializations = [
      "Cardiology",
      "Neurology",
      "Orthopedics",
      "Pediatrics",
    ]; // Example list
    if (!validSpecializations.includes(specialization)) {
      toast.error("Please select a valid specialization from the list", {
        theme: "colored",
      });
      return false;
    }

    // Ensure the doctor uploads a valid certification document
    if (!certificationDocument) {
      toast.error("Please upload your certification document", {
        theme: "colored",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Prepare form data for file upload (for certification)
    const formDataToSend = new FormData();
    formDataToSend.append("firstName", formData.firstName);
    formDataToSend.append("lastName", formData.lastName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("specialization", formData.specialization);
    formDataToSend.append("contactNumber", formData.contactNumber);
    formDataToSend.append(
      "certificationDocument",
      formData.certificationDocument
    );

    try {
      const response = await apiService.registerDoctor(formDataToSend);

      if (response.success) {
        toast.success("Registration successful! You can now log in.", {
          theme: "colored",
        });
        setDoctorData(response.data);
        navigate("/login");
      } else {
        toast.error(
          response.message || "Registration failed. Please try again.",
          { theme: "colored" }
        );
      }
    } catch (error) {
      toast.error("An error occurred during registration. Please try again.", {
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Back Button */}
      <BackButton />
      <motion.div
        className="w-2/5 max-w-2xl p-7 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Doctor Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              />
            </div>
          </motion.div>

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
              />
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div>
              <label className="block text-black">Contact Number</label>
              <input
                type="text"
                name="contactNumber"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter your contact number"
                value={formData.contactNumber}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-black">Specialization</label>
              <select
                name="specialization"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="">Select your specialization</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Pediatrics">Pediatrics</option>
                {/* Add more specializations here */}
              </select>
            </div>
          </motion.div>

          {/* Certification Document Upload */}
          <motion.div
            className="grid grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div>
              <label className="block text-black">Certification Document</label>
              <input
                type="file"
                name="certificationDocument"
                accept="application/pdf,image/*"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={handleFileChange}
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full py-2 mt-6 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform transition duration-300 ease-in-out hover:scale-105"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </motion.button>
        </form>

        {/* Login Redirect */}
        <p className="text-center mt-2 text-black font-medium">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:underline"
          >
            Login here
          </a>
        </p>
      </motion.div>

      <ToastContainer />
    </div>
  );
};

export default DoctorSignup;
