import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import {
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaCheck,
  FaVideo,
  FaStethoscope,
  FaUser,
  FaChartLine,
  FaNotesMedical,
  FaSearch,
  FaPrescriptionBottleAlt,
  FaHospitalUser,
  FaFileAlt,
  FaCalendarCheck,
  FaRobot,
  FaExternalLinkAlt,
  FaCreditCard,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Toaster, toast } from "react-hot-toast";
import apiService from "../services/apiService";

const API_BASE_URL = "http://localhost:5001/api";

const Dashboard = () => {
  const { user, role, loading: authLoading, setRole, setUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));

        if (!user) {
          setUser({
            _id: decodedToken.id,
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            email: decodedToken.email,
            specialization: decodedToken.specialization,
          });
        }

        const userRole = decodedToken.specialization ? "doctor" : "patient";
        localStorage.setItem("role", userRole);
        setRole(userRole);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      }
    };

    if (!role || !user) {
      checkAuth();
    }
  }, [navigate, role, setRole, user, setUser]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user?._id || !role) {
      return;
    }

    try {
      setLoading(true);

      // Get saved appointments from localStorage first
      const savedAppointmentsStr = localStorage.getItem("appointments");
      let savedAppointments = [];
      if (savedAppointmentsStr) {
        try {
          const { data } = JSON.parse(savedAppointmentsStr);
          savedAppointments = data;
        } catch (error) {
          console.error("Error parsing saved appointments:", error);
        }
      }

      // Fetch fresh appointments from API
      const response =
        role === "doctor"
          ? await apiService.getAppointmentsByDoctorId(user._id)
          : await apiService.getAppointmentsByPatientId(user._id);

      if (response.success && response.data) {
        // Create a map of API appointments for easy lookup
        const apiAppointments = new Map(
          response.data.map((apt) => [apt._id, apt])
        );

        // Create a map of saved appointments for merging
        const savedAppointmentsMap = new Map(
          savedAppointments.map((apt) => [apt._id, apt])
        );

        // Merge appointments, prioritizing saved version for cancelled appointments
        const allAppointments = response.data.map((apiApt) => {
          const savedApt = savedAppointmentsMap.get(apiApt._id);

          // If either version is cancelled, use the cancelled version
          if (
            (savedApt && savedApt.status === "cancelled") ||
            apiApt.status === "cancelled"
          ) {
            const cancelledApt =
              savedApt?.status === "cancelled" ? savedApt : apiApt;

            return {
              ...apiApt,
              status: "cancelled",
              cancelledAt: cancelledApt.cancelledAt || cancelledApt.updatedAt,
              cancelledBy: cancelledApt.cancelledBy,
              cancelledById: cancelledApt.cancelledById,
              cancellerName: cancelledApt.cancellerName,
              docId: {
                ...apiApt.docId,
                _id: apiApt.docId._id,
                firstName: apiApt.docId.firstName,
                lastName: apiApt.docId.lastName,
              },
              patientId: {
                ...apiApt.patientId,
                _id: apiApt.patientId._id,
                firstName: apiApt.patientId.firstName,
                lastName: apiApt.patientId.lastName,
              },
            };
          }
          return apiApt;
        });

        // Add any saved cancelled appointments that aren't in the API response
        savedAppointments.forEach((savedApt) => {
          if (
            !apiAppointments.has(savedApt._id) &&
            savedApt.status === "cancelled"
          ) {
            // For doctors, only add appointments where they are the doctor
            if (role === "doctor" && savedApt.docId?._id !== user._id) {
              return;
            }
            // For patients, only add their own appointments
            if (role === "patient" && savedApt.patientId?._id !== user._id) {
              return;
            }

            allAppointments.push(savedApt);
          }
        });

        // Process all appointments to ensure they have complete information
        const processedAppointments = allAppointments.map((appointment) => {
          // For cancelled appointments, ensure we have all necessary information
          if (appointment.status === "cancelled") {
            // Additional processing for cancelled appointments can be added here
          }

          return {
            ...appointment,
            status: appointment.status || "pending",
            cancelledAt: appointment.cancelledAt || null,
            cancelledBy: appointment.cancelledBy || null,
            cancelledById: appointment.cancelledById || null,
            cancellerName: appointment.cancellerName || null,
            docId: {
              ...appointment.docId,
              _id: appointment.docId?._id,
              firstName: appointment.docId?.firstName || "",
              lastName: appointment.docId?.lastName || "",
            },
            patientId: {
              ...appointment.patientId,
              _id: appointment.patientId?._id,
              firstName: appointment.patientId?.firstName || "",
              lastName: appointment.patientId?.lastName || "",
            },
          };
        });

        // Store processed appointments in localStorage with timestamp
        const storageData = {
          data: processedAppointments,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("appointments", JSON.stringify(storageData));

        setAppointments(processedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user?._id, role]);

  // Load appointments from localStorage on component mount
  useEffect(() => {
    const loadSavedAppointments = () => {
      const savedAppointments = localStorage.getItem("appointments");
      if (savedAppointments) {
        try {
          const { data, timestamp } = JSON.parse(savedAppointments);
          const savedTime = new Date(timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - savedTime.getTime();

          // Only use saved appointments if they're less than 24 hours old
          if (timeDiff < 24 * 60 * 60 * 1000) {
 
            setAppointments(data);
          } else {
  
            localStorage.removeItem("appointments");
          }
        } catch (error) {
          console.error("Error parsing saved appointments:", error);
        }
      }
    };

    loadSavedAppointments();
  }, []);

  // Update the useEffect for fetching appointments
  useEffect(() => {
    if (!authLoading && user?._id && role) {
      fetchAppointments();
      // Set up an interval to refresh appointments every minute
      const interval = setInterval(fetchAppointments, 60000);
      return () => clearInterval(interval);
    }
  }, [authLoading, user?._id, role, fetchAppointments]);

  // Quick actions data fetching
  useEffect(() => {
    const fetchQuickActionsData = async () => {
      if (!user?._id || !role) return;

      try {
        // Quick actions data fetching logic can be added here if needed
      } catch (error) {
        console.error("Error fetching quick actions data:", error);
      }
    };

    fetchQuickActionsData();
  }, [user, role]);
  

  const cancelAppointment = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found");
        return;
      }

      // Check if appointment can be cancelled
      const appointmentDateTime = new Date(appointment.slotDate);
      const [hours, minutes] = appointment.slotTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const now = new Date();
      if (appointmentDateTime < now) {
        toast.error("Cannot cancel past appointments");
        return;
      }

      const timeUntilAppointment = appointmentDateTime - now;
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      if (hoursUntilAppointment < 1) {
        toast.error(
          "Cannot cancel appointments less than 1 hour before the scheduled time"
        );
        return;
      }

      // Create cancellation details based on user role
      const cancellerName =
        role === "doctor"
          ? `Dr. ${user.firstName} ${user.lastName}`.trim()
          : `${user.firstName} ${user.lastName}`.trim();

      const cancelDetails = {
        reason: "Cancelled by user",
        cancelledBy: role,
        cancelledById: user._id,
        cancelledAt: new Date().toISOString(),
        cancellerName: cancellerName,
        status: "cancelled", // Explicitly set status
      };

      // Create the updated appointment object with full details
      const updatedAppointment = {
        ...appointment,
        status: "cancelled",
        cancelledBy: role,
        cancelledById: user._id,
        cancelledAt: new Date().toISOString(),
        cancellerName: cancellerName,
        paymentStatus:
          appointment.paymentStatus === "paid"
            ? "refunded"
            : appointment.paymentStatus,
        docId: {
          ...appointment.docId,
          _id: appointment.docId._id,
          firstName: appointment.docId.firstName,
          lastName: appointment.docId.lastName,
        },
        patientId: {
          ...appointment.patientId,
          _id: appointment.patientId._id,
          firstName: appointment.patientId.firstName,
          lastName: appointment.patientId.lastName,
        },
      };

      // Update state immediately for better UX
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? updatedAppointment : apt
        )
      );

      // Update localStorage immediately
      const savedAppointmentsStr = localStorage.getItem("appointments");
      if (savedAppointmentsStr) {
        try {
          const { data } = JSON.parse(savedAppointmentsStr);
          const updatedSavedAppointments = data.map((apt) =>
            apt._id === appointmentId ? updatedAppointment : apt
          );

          localStorage.setItem(
            "appointments",
            JSON.stringify({
              data: updatedSavedAppointments,
              timestamp: new Date().toISOString(),
            })
          );

        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }

      // Make the API call
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/appointments/cancel/${appointmentId}`,
        cancelDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Create notifications for both doctor and patient
        const doctorNotification = {
          id: Date.now(),
          type: "cancelled",
          message: `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} has been cancelled`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "doctor",
          recipientId: appointment.docId._id,
        };

        const patientNotification = {
          id: Date.now() + 1,
          type: "cancelled",
          message: `Your appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been cancelled`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "patient",
          recipientId: appointment.patientId._id,
        };

        // Get existing notifications from localStorage
        const savedNotifications = localStorage.getItem("notifications");
        let updatedNotifications = [];
        
        if (savedNotifications) {
          try {
            updatedNotifications = JSON.parse(savedNotifications);
          } catch (error) {
            console.error("Error parsing saved notifications:", error);
            updatedNotifications = [];
          }
        }

        // Add new notifications
        updatedNotifications.unshift(doctorNotification);
        updatedNotifications.unshift(patientNotification);

        // Save back to localStorage
        localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appointmentId ? { ...apt, status: "cancelled" } : apt
          )
        );
        fetchAppointments();

        toast.success(`Appointment cancelled by ${cancellerName}`);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      // Revert local changes if there's an error
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? appointment : apt
        )
      );
      toast.error(error.response?.data?.message || "Failed to complete appointment");
    }
  };
  

  const AppointmentCard = ({ appointment, role, fetchAppointments }) => {
    const isDoctor = role === "doctor";
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [rating, setRating] = useState(0);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    // Get doctor and patient info
    const doctor = appointment.docId || {};
    const patient = appointment.patientId || {};

    // Get name with proper validation
    const doctorName = `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim();
    const patientName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim();

    // Get action user name (who cancelled/completed/confirmed the appointment)
    const getActionUserName = () => {
      if (appointment.status === "cancelled") {
        // If cancelled by doctor
        if (appointment.cancelledBy === "doctor") {
          return `Cancelled by Dr. ${appointment.docId?.firstName || ""} ${appointment.docId?.lastName || ""}`;
        }
        // If cancelled by patient
        else if (appointment.cancelledBy === "patient") {
          return `Cancelled by ${appointment.patientId?.firstName || ""} ${appointment.patientId?.lastName || ""}`;
        }
        // If cancelled by system
        else if (appointment.cancelledBy === "system") {
          return "Cancelled by System";
        }
        // If we have the cancellerName, use it as fallback
        else if (appointment.cancellerName) {
          return `Cancelled by ${appointment.cancellerName}`;
        }
        // Final fallback
        return "Cancelled";
      } else if (appointment.status === "completed" && appointment.completedBy) {
        return `Completed by ${doctorName}`;
      } else if (appointment.status === "confirmed" && appointment.confirmedBy) {
        return `Confirmed by ${appointment.confirmedBy === "doctor" ? doctorName : patientName}`;
      }
      return "";
    };

    // Get action time with proper validation
    const getActionTime = () => {
      if (appointment.status === "cancelled" && (appointment.cancelledAt || appointment.updatedAt)) {
        const cancelTime = moment(appointment.cancelledAt || appointment.updatedAt).fromNow();
        return cancelTime;
      } else if (appointment.status === "completed" && (appointment.completedAt || appointment.updatedAt)) {
        return moment(appointment.completedAt || appointment.updatedAt).fromNow();
      } else if (appointment.status === "confirmed" && (appointment.confirmedAt || appointment.updatedAt)) {
        return moment(appointment.confirmedAt || appointment.updatedAt).fromNow();
      }
      return "";
    };

    // Get profile picture URL
    const getProfilePicture = (user) => {
      if (!user?.profilePicture) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || "")} ${encodeURIComponent(user?.lastName || "")}&background=random`;
      }
      return user.profilePicture.startsWith("http") ? user.profilePicture : `http://localhost:5001${user.profilePicture}`;
    };

    const doctorProfilePic = getProfilePicture(doctor);
    const patientProfilePic = getProfilePicture(patient);

    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "completed":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        case "confirmed":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const handleRatingChange = (newRating) => {
      setRating(newRating);
    };

    const handleSubmitReview = async () => {
      if (rating === 0) {
        toast.error("Please provide a star rating.");
        return;
      }

      setIsSubmittingReview(true);
      try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE_URL}/appointments/${appointment._id}/review`;
        const response = await axios.post(
          url,
          { rating },
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            } 
          }
        );

        if (response.data.success) {
          toast.success("Review submitted successfully!");
          setShowReviewForm(false);
          setRating(0);
          fetchAppointments();
        } else {
          toast.error(response.data.message || "Failed to submit review.");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        toast.error(error.response?.data?.message || "Failed to submit review.");
      } finally {
        setIsSubmittingReview(false);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-lg p-4 ${appointment.status === "cancelled" ? "opacity-75" : ""}`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={isDoctor ? patientProfilePic : doctorProfilePic}
                alt={isDoctor ? patientName : doctorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isDoctor ? patientName : doctorName)}&background=random`;
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                {isDoctor ? patientName : doctorName}
                {!isDoctor && doctor.specialization && (
                  <span className="text-xs text-green-600 ml-1">
                    - {doctor.specialization}
                    <FaStethoscope className="ml-1 inline-block" />
                  </span>
                )}
              </h3>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-1">
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-1 text-blue-500" />
                  {appointment.slotDate ? moment(appointment.slotDate).format("MMMM D, YYYY") : "Date not set"}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-1 text-blue-500" />
                  {appointment.slotTime || "Time not set"}
                </span>
                <span className="flex items-center">
                  {appointment.consultationType === "video" ? (
                    <FaVideo className="mr-1 text-blue-500" />
                  ) : (
                    <FaUser className="mr-1 text-blue-500" />
                  )}
                  {appointment.consultationType === "video" ? "Video Consultation" : "In-Person Consultation"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {(appointment.status || "Unknown").charAt(0).toUpperCase() + (appointment.status || "Unknown").slice(1)}
                </span>
                {(appointment.status === "cancelled" || appointment.status === "completed" || appointment.status === "confirmed") && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{getActionTime()}</span>
                    <span className="text-gray-500">{getActionUserName()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Section for Patients (Completed Appointments) */}
          {!isDoctor && appointment.status === "completed" && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {!showReviewForm ? (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Leave a Rating
                </button>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Your Rating:</h4>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        className={`w-4 h-4 cursor-pointer transition-colors ${index < rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
                        onClick={() => handleRatingChange(index + 1)}
                      />
                    ))}
                    {rating > 0 && <span className="text-sm text-gray-600 ml-2">({rating} Star{rating > 1 && 's'})</span>}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmittingReview || rating === 0}
                      className={`px-2 py-1 text-xs rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 ${isSubmittingReview || rating === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Rating"}
                    </button>
                    <button
                      onClick={() => { setShowReviewForm(false); setRating(0); }}
                      disabled={isSubmittingReview}
                      className="px-2 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {/* Hide action buttons if review form is shown and it's a patient */}
          {!(showReviewForm && !isDoctor) && appointment.status !== "completed" && (
            <div className="flex flex-wrap gap-1 mt-4 sm:mt-0">
              {/* Doctor buttons */}
              {isDoctor && appointment.status === "pending" && (
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        const response = await axios.post(
                          `http://localhost:5001/api/appointments/${appointment._id}/confirm`,
                          { status: "confirmed" },
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        if (response.data.success) {
                          setAppointments((prevAppointments) =>
                            prevAppointments.map((apt) =>
                              apt._id === appointment._id ? { ...apt, status: "confirmed" } : apt
                            )
                          );
                          fetchAppointments();
                          toast.success("Appointment confirmed!");
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        toast.error("Failed to confirm appointment.");
                      }
                    }}
                    className="px-2 py-1 text-white text-xs rounded-md transition-colors flex items-center whitespace-nowrap bg-green-600 hover:bg-green-700"
                  >
                    <FaCheck className="mr-1 text-xs" />
                    <span>Confirm</span>
                  </button>

                  <button
                    onClick={() => cancelAppointment(appointment._id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors flex items-center whitespace-nowrap"
                  >
                    <FaTimes className="mr-1 text-xs" />
                    Cancel
                  </button>
                </div>
              )}

              {/* Patient Buttons */}
              {!isDoctor && (
                <div className="flex flex-wrap gap-1 mt-4 sm:mt-0">
                  {/* Patient Cancel Button (Only for Pending) */}
                  {appointment.status === "pending" && (
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors flex items-center whitespace-nowrap"
                    >
                      <FaTimes className="mr-1 text-xs" />
                      Cancel
                    </button>
                  )}

                  {/* Pay Now Button (Only when Confirmed) */}
                  {appointment.status === "confirmed" && !isProcessing && (
                    <button
                      onClick={async () => {         
                        setIsProcessing(true);

                        setTimeout(async () => {
                          try {
                            const token = localStorage.getItem("token");
                            const response = await axios.post(
                              `http://localhost:5001/api/appointments/${appointment._id}/pay`,
                              {
                                paymentStatus: "paid",
                                status: "completed"
                              },
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );


                            if (response.data.success) {
                              // Create notifications for both doctor and patient
                              const doctorNotification = {
                                id: Date.now(),
                                type: "completed",
                                message: `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} has been completed`,
                                timestamp: new Date(),
                                appointmentDate: appointment.slotDate,
                                recipientType: "doctor",
                                recipientId: appointment.docId._id,
                              };

                              const patientNotification = {
                                id: Date.now() + 1,
                                type: "completed",
                                message: `Your appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been completed`,
                                timestamp: new Date(),
                                appointmentDate: appointment.slotDate,
                                recipientType: "patient",
                                recipientId: appointment.patientId._id,
                              };

                              // Get existing notifications from localStorage
                              const savedNotifications = localStorage.getItem("notifications");
                              let updatedNotifications = [];
                              
                              if (savedNotifications) {
                                try {
                                  updatedNotifications = JSON.parse(savedNotifications);
                                } catch (error) {
                                  console.error("Error parsing saved notifications:", error);
                                  updatedNotifications = [];
                                }
                              }

                              updatedNotifications.unshift(doctorNotification);
                              updatedNotifications.unshift(patientNotification);

                              localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

                              setAppointments((prevAppointments) =>
                                prevAppointments.map((apt) =>
                                  apt._id === appointment._id
                                    ? { ...apt, status: "completed", paymentStatus: "paid" }
                                    : apt
                                )
                              );
                              
                              fetchAppointments();
                              toast.success("Payment successful! Appointment completed.");
                            }
                          } catch (error) {
                            console.error("Payment error:", error);
                            toast.error("Failed to process payment");
                          } finally {
                            setIsProcessing(false);
                          }
                        }, 3000);
                      }}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors flex items-center whitespace-nowrap"
                    >
                      <FaCreditCard className="mr-1 text-xs" />
                      <span>Pay Now</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Add handleQuickAction function
  const handleQuickAction = (action) => {
    switch (action) {
      case "view-patients":
        navigate("/patients");
        break;
      case "write-prescription":
        navigate("/new-prescription");
        break;
      case "doctor-prescriptions":
        navigate("/doctor-prescriptions");
        break;
      case "book-appointment":
        navigate("/appointment");
        break;
      case "view-prescriptions":
        navigate("/prescriptions");
        break;
      case "ai-chat":
        navigate("/aichat");
        break;
      default:
        console.warn("Unknown quick action:", action);
    }
  };

  // Add filtered appointments logic
  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      (role === "doctor"
        ? `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : `Dr. ${appointment.docId?.firstName} ${appointment.docId?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

    // Filter by status
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;

    // Filter by user role
    const matchesRole =
        role === "doctor"
          ? appointment.docId?._id === user?._id
        : appointment.patientId?._id === user?._id;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // First sort by status (completed and cancelled last)
    if (
      (a.status === "completed" || a.status === "cancelled") &&
      b.status !== "completed" &&
      b.status !== "cancelled"
    )
      return 1;
    if (
      a.status !== "completed" &&
      a.status !== "cancelled" &&
      (b.status === "completed" || b.status === "cancelled")
    )
      return -1;

    // Then sort by date or name based on sortBy value
    if (sortBy === "date") {
      const dateA = new Date(a.slotDate);
      const dateB = new Date(b.slotDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.slotTime.localeCompare(b.slotTime);
    }

    // Sort by name
    if (sortBy === "name") {
      return role === "doctor"
        ? `${a.patientId?.firstName} ${a.patientId?.lastName}`.localeCompare(
            `${b.patientId?.firstName} ${b.patientId?.lastName}`
          )
        : `Dr. ${a.docId?.firstName} ${a.docId?.lastName}`.localeCompare(
            `Dr. ${b.docId?.firstName} ${b.docId?.lastName}`
          );
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6 pt-24">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {role === "doctor" ? "Dr." : ""} {user?.firstName}
                !
              </h1>
              <p className="text-gray-600 mt-1">
                {role === "doctor"
                  ? "Manage your appointments and patient care"
                  : "Track your health and appointments"}
              </p>
            </div>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="px-3 sm:px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm border border-gray-200 text-sm sm:text-base"
            >
              <FaChartLine className="text-blue-500 text-sm sm:text-base" />
              <span className="font-medium whitespace-nowrap">Quick Actions</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Cards */}
          {showQuickActions && (
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {role === "doctor" ? (
                <>
                  {/* My Patients Card */}
                  <div
                    onClick={() => handleQuickAction("view-patients")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaHospitalUser className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          My Patients
                        </h3>
                        <p className="text-sm text-gray-500">
                          View patient list
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Write Prescriptions */}
                  <div
                    onClick={() => handleQuickAction("write-prescription")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaFileAlt className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Write Prescription
                        </h3>
                        <p className="text-sm text-gray-500">
                          Write prescriptions for patient
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* View Prescriptions */}
                  <div
                    onClick={() => handleQuickAction("doctor-prescriptions")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaPrescriptionBottleAlt className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          View Prescription
                        </h3>
                        <p className="text-sm text-gray-500">
                          All patient prescriptions
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Book Appointment Card */}
                  <div
                    onClick={() => handleQuickAction("book-appointment")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaCalendarCheck className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Book Appointment
                        </h3>
                        <p className="text-sm text-gray-500">
                          Schedule a visit
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* My Prescriptions Card */}
                  <div
                    onClick={() => handleQuickAction("view-prescriptions")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaNotesMedical className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          My Prescriptions
                        </h3>
                        <p className="text-sm text-gray-500">
                          View your prescriptions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Card */}
                  <div
                    onClick={() => handleQuickAction("ai-chat")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaRobot className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          AI Assistant
                        </h3>
                        <p className="text-sm text-gray-500">
                          Get instant help
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appointments Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                  {role === "doctor"
                    ? "Patient Appointments"
                    : "My Appointments"}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : sortedAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No appointments found</p>
                  {role === "patient" && (
                    <button
                      onClick={() => navigate("/appointment")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Schedule New Appointment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedAppointments.map((appointment) => (
                      <AppointmentCard
                        key={appointment._id}
                        appointment={appointment}
                        role={role}
                        fetchAppointments={fetchAppointments}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Processing Box - Moved outside the appointment card */}
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl w-80 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <FaCreditCard className="text-green-500 text-xl" />
              </div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">Processing Payment</h2>
              <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Please wait while we process your payment</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <FaExternalLinkAlt className="text-gray-400" />
                  <span>Demo Payment Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;