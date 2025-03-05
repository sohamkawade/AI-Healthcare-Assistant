import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

const DoctorSignup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    specialization: "",
    contactNumber: "",
    fees: "",
    degree: "",
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

  const validateForm = () => {
    const { firstName, lastName, email, password, specialization, contactNumber, fees, degree } = formData;

    if (!firstName || !lastName || !email || !password || !specialization || !contactNumber || !fees || !degree) {
      toast.error("All fields are required", { theme: "colored" });
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters", { theme: "colored" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email", { theme: "colored" });
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number", { theme: "colored" });
      return false;
    }

    if (isNaN(fees) || fees <= 0) {
      toast.error("Fees must be a positive number", { theme: "colored" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await apiService.registerDoctor(formData);
      if (response.success) {
        toast.success("Registration successful! You can now log in.", { theme: "colored" });
        setDoctorData(response.data);
        navigate("/login");
      } else {
        toast.error(response.message || "Registration failed. Please try again.", { theme: "colored" });
      }
    } catch (error) {
      toast.error("An error occurred during registration. Please try again.", { theme: "colored" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <motion.div
        className="w-2/5 max-w-2xl p-7 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Doctor Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Contact Number", name: "contactNumber", type: "tel" },
              { label: "Fees", name: "fees", type: "number" },
              { label: "Degree", name: "degree" },
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-black">{field.label}</label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={`Enter your ${field.label.toLowerCase()}`}
                  value={formData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Specialization Dropdown */}
            <div>
              <label className="block text-black">Specialization</label>
              <select
                name="specialization"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="" disabled>Select Specialization</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="General Physician">General Physician</option>
              </select>
            </div>
          </div>

          <motion.button
            type="submit"
            className="w-full py-2 mt-6 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transform transition duration-300 ease-in-out hover:scale-105"
            disabled={loading}
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
        <ToastContainer />
      </motion.div>
    </div>
  );
};

export default DoctorSignup;
