import React, { useState, useContext } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
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
        toast.warn("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.warn("Please upload a valid image file");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
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
      toast.error("All fields including profile picture are required");
      return false;
    }

    // Check if profile picture is a valid image file
    if (!profilePicture.type.startsWith("image/")) {
      toast.error("Please upload a valid image file for profile picture");
      return false;
    }

    const nameRegex = /^[A-Za-z]+$/;

    if (!nameRegex.test(firstName)) {
      toast.error(
        "First name should not contain numbers or special characters"
      );
      return false;
    }

    if (!nameRegex.test(lastName)) {
      toast.error("Last name should not contain numbers or special characters");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber)) {
      toast.error("Please enter a valid 10-digit contact number");
      return false;
    }

    if (isNaN(fees) || fees <= 0) {
      toast.error("Fees must be a positive number");
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
          style: {
            background: "#166534",
            color: "#fff",
            border: "2px solid #166534",
            fontWeight: "bold"
          },
        });
        setDoctorData(response.data);
        // Clear any existing user data from localStorage
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
            style: {
              background: "#DC2626",
              color: "#fff",
              border: "2px solid #DC2626",
              fontWeight: "bold"
            },
          }
        );
        navigate("/login");
      } else {
        toast.error(errorMessage, {
          style: {
            background: "#DC2626",
            color: "#fff",
            border: "2px solid #DC2626",
            fontWeight: "bold"
          },
        });
      }
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
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-3">
          Doctor Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture at the Top */}
          <div className="flex flex-col items-center mb-6">
            <label className="block text-black mb-2">Profile Picture</label>
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
                    className="w-20 h-20 object-cover rounded-full border-2 border-blue-400 hover:opacity-80 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full border-2 border-gray-300 hover:opacity-80 transition-opacity duration-300">
                    <span className="text-gray-500 text-sm">Upload</span>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Password", name: "password", type: "password" },
              { label: "Contact Number", name: "contactNumber", type: "tel" },
              { label: "Fees", name: "fees", type: "number" },
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
            <div>
              <label className="block text-black" disabled>
                Degree
              </label>
              <select
                name="degree"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.degree}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Degree
                </option>
                <option value="MBBS">MBBS</option>
                <option value="MD">MD</option>
                <option value="BHMS">BHMS</option>
                <option value="BAMS">BAMS</option>
                <option value="MS">MS</option>
              </select>
            </div>

            {/* Specialization Dropdown */}
            <div>
              <label className="block text-black" disabled>
                Specialization
              </label>
              <select
                name="specialization"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select Specialization
                </option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="General Physician">General Physician</option>
                <option value="Dentist">Dentist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Endocrinologist">Endocrinologist</option>
                <option value="Rheumatologist">Rheumatologist</option>
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
      </motion.div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default DoctorSignup;
