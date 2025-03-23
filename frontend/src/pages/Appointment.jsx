import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import { useAuth } from "../hooks/useAuth";
import 'react-toastify/dist/ReactToastify.css';
import { FaCheck, FaTimes, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClock, FaVideo, FaUser, FaStar } from 'react-icons/fa';
import moment from 'moment';

// Single toast configuration object
const toastConfig = {
  position: "top-right",
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light"
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Appointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [doctorStatus, setDoctorStatus] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [consultationType, setConsultationType] = useState('in-person');
  const { user, userType } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userType = localStorage.getItem("userType");


      if (!token || !userId) {
        toast.error("Please log in to access the appointment page.", toastConfig);
        navigate("/login");
        return;
      }

      // Check if user is a patient by checking if they have a specialization
      // If user has specialization, they are a doctor, otherwise they are a patient
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const isPatient = !decodedToken.specialization;


      if (!isPatient) {
        toast.warning("Only patients can book appointments. Please login with a patient profile.", toastConfig);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        return;
      }

      // If user is a patient, fetch doctors
      fetchDoctors();
    };

    checkAuth();
  }, [navigate]); // Add navigate to dependencies

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5001/api/auth/doctors");
      
      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      } else {
        setDoctors([]);
        console.error("Invalid response format:", response);
        toast.error("Failed to load doctors list. Please try again later.", toastConfig);
      }
    } catch (error) {
      console.error("Error fetching doctors:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(`Error: ${error.message || "An error occurred while fetching doctors list."}`, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const docSlots = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(new Date().getDate() + i);
      return {
        date: date,
        formattedDate: date
          .toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          })
          .split("/")
          .reverse()
          .join("-"),
        dayName: daysOfWeek[date.getDay()],
      };
    });

  const handleDateSelection = (index, date) => {
    setSlotIndex(index);
    setSlotTime("");
    setSelectedDate(date);
    if (selectedDoctor) {
      fetchAvailableSlots(selectedDoctor._id, date);
    }
  };
  const fetchAvailableSlots = async (docId, date) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      
      const response = await axios.get(
        `http://localhost:5001/api/appointments/available-slots?docId=${docId}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (response.data.success) {
        const slots = response.data.data;
        console.log('Received slots:', slots);

        setAvailableSlots(prev => ({
          ...prev,
          [docId]: {
            ...prev?.[docId],
            [date]: slots
          }
        }));

        setDoctorStatus(prev => ({
          ...prev,
          [docId]: {
            ...prev?.[docId],
            hasAvailableSlots: slots.length > 0
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available slots", toastConfig);
      setAvailableSlots(prev => ({
        ...prev,
        [docId]: {
          ...prev?.[docId],
          [date]: []
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleConsultationTypeChange = (type) => {
    setConsultationType(type);
  };

  const handleBookAppointment = async () => {
    if (!slotTime || !selectedDoctor || !selectedDate) {
      toast.error("Please select all required fields", toastConfig);
      return;
    }

    if (!consultationType) {
      toast.error("Please select a consultation type", toastConfig);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Check daily appointment limit
      const dailyCountResponse = await axios.get(
        `http://localhost:5001/api/appointments/patient/${user._id}/daily-count?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (dailyCountResponse.data.count >= 2) {
        toast.error("You can only book 2 appointments per day", toastConfig);
        setLoading(false);
        return;
      }

      // Check if patient already has an appointment at this time slot
      const timeSlotCheckResponse = await axios.get(
        `http://localhost:5001/api/appointments/check-timeslot`,
        {
          params: {
            patientId: user._id,
            date: selectedDate,
            time: slotTime
          },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      ).catch(error => {
        console.error('Time slot check error:', error.response?.data || error.message);
        throw error;
      });


      if (timeSlotCheckResponse.data.hasAppointment) {
        toast.error(timeSlotCheckResponse.data.message, toastConfig);
        setLoading(false);
        return;
      }
      
      // Proceed with booking
      const appointmentData = {
        docId: selectedDoctor._id,
        slotDate: selectedDate,
        slotTime: slotTime,
        consultationType: consultationType
      };


      const bookResponse = await axios.post(
        "http://localhost:5001/api/appointments/book",
        appointmentData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (bookResponse.data.success) {
        toast.success("Appointment booked successfully!", toastConfig);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage = error.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage, toastConfig);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      setShowPayment(false);
      toast.success('Payment completed successfully!', toastConfig);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to process payment', toastConfig);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found", toastConfig);
        return;
      }

      // Check if appointment can be cancelled
      const appointmentTime = new Date(appointment.startTime);
      const now = new Date();
      if (appointmentTime < now) {
        toast.error("Cannot cancel past appointments", toastConfig);
        return;
      }

      const timeUntilAppointment = appointmentTime - now;
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      if (hoursUntilAppointment < 1) {
        toast.error("Cannot cancel appointments less than 1 hour before the scheduled time", toastConfig);
        return;
      }

      if (!window.confirm("Are you sure you want to cancel this appointment?")) {
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5001/api/appointments/cancel/${appointmentId}`,
        { 
          reason: "Cancelled by user",
          cancelledBy: userType,
          cancelledById: user._id
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update appointments list - filter out cancelled appointment
        setAppointments((prev) =>
          prev.filter((apt) => apt._id !== appointmentId)
        );

        // Create notification for both doctor and patient
        const cancelledBy = userType === "doctor" 
          ? `Dr. ${user.firstName} ${user.lastName}`
          : `${user.firstName} ${user.lastName}`;

        const doctorNotification = {
          id: Date.now() + 1,
          type: "cancelled",
          message: `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} has been cancelled by ${cancelledBy}`,
          timestamp: new Date(),
          appointmentDate: appointment.startTime,
          recipientId: appointment.docId._id
        };

        const patientNotification = {
          id: Date.now() + 2,
          type: "cancelled",
          message: `Appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been cancelled by ${cancelledBy}`,
          timestamp: new Date(),
          appointmentDate: appointment.startTime,
          recipientId: appointment.patientId._id
        };

        // Update notifications in state and localStorage
        const updatedNotifications = [...notifications];
        
        // Add notification based on current user's role
        if (userType === "doctor" && user._id === appointment.docId._id) {
          updatedNotifications.unshift(doctorNotification);
        } else if (userType === "patient" && user._id === appointment.patientId._id) {
          updatedNotifications.unshift(patientNotification);
        }

        // Store notifications in localStorage
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
        
        toast.success("Appointment cancelled successfully", toastConfig);
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment. Please try again.", toastConfig);
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found", toastConfig);
        return;
      }

      // Check if appointment can be completed
      const appointmentTime = new Date(appointment.startTime);
      const now = new Date();
      const timeDifference = now - appointmentTime;
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));

      if (minutesDifference < 0) {
        toast.error("Cannot complete an appointment before it starts", toastConfig);
        return;
      }

      if (minutesDifference > 15) {
        toast.error("Cannot complete an appointment more than 15 minutes after the scheduled time", toastConfig);
        return;
      }

      if (!window.confirm("Are you sure you want to mark this appointment as completed?")) {
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:5001/api/appointments/complete/${appointmentId}`,
        { 
          completedAt: new Date().toISOString(),
          completedBy: userType
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Update appointments list
        setAppointments((prev) =>
          prev.map((apt) =>
            apt._id === appointmentId
              ? { ...apt, status: "completed" }
              : apt
          )
        );

        // Add to notifications
        const newNotification = {
          id: Date.now(),
          type: "completed",
          message:
            userType === "doctor"
              ? `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} has been completed by Dr. ${user.firstName} ${user.lastName}`
              : `Appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} has been completed by ${user.firstName} ${user.lastName}`,
          timestamp: new Date(),
          appointmentDate: appointment.startTime,
          recipientId: appointment.docId._id
        };

        // Update notifications in state and localStorage
        const updatedNotifications = [...notifications];
        updatedNotifications.unshift(newNotification);
        localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
        setNotifications(updatedNotifications);
        
        toast.success("Appointment completed successfully", toastConfig);
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error(error.response?.data?.message || "Failed to complete appointment. Please try again.", toastConfig);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(doctors) && doctors.length > 0 ? (
          <>
            <div className="pr-4">
              <h2 className="text-3xl font-bold mb-6">Select a Doctor</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {doctors.map((doctor) => {
                  const isSelected = selectedDoctor?._id === doctor._id;
                  
                  // Check availability based on actual available slots
                  let isAvailable = true; // Default available for unselected doctors
                  
                  if (isSelected && selectedDate) {
                    // Check if there are any available slots for this doctor on the selected date
                    const doctorSlots = availableSlots[doctor._id]?.[selectedDate] || [];
                    isAvailable = doctorSlots.length > 0;
                  }

                  return (
                    <div
                      key={doctor._id}
                      className={`relative rounded-lg shadow-lg p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                        isSelected
                          ? "border-2 border-blue-500"
                          : "border border-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        if (selectedDate) {
                          fetchAvailableSlots(doctor._id, selectedDate);
                        }
                      }}
                    >
                      <div className="relative w-full h-40 mb-2 aspect-square">
                        {doctor.profilePicture ? (
                          <img
                            src={`http://localhost:5001${doctor.profilePicture}`}
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            className="w-full h-full object-cover rounded-sm"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-center">
                        <span className={`font-bold ${isAvailable ? "text-green-500" : "text-red-500"}`}>
                          {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <h3 className="text-sm font-semibold mt-2">
                          {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {doctor.specialization}
                        </p>
                        <p className="text-gray-800 font-medium mt-2">
                          Fee: ₹{doctor.fees}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDoctor && (
              <div className="border border-gray-300 rounded-lg p-6 h-fit">
                <h3 className="text-2xl font-bold mb-4">
                  Appointment with Dr. {selectedDoctor.firstName}{" "}
                  {selectedDoctor.lastName}
                </h3>

                {/* Add Consultation Type Selection */}
                <div className="mb-4">
                  <h3 className="text-base font-semibold mb-2 text-gray-800">Consultation Type</h3>
                  <div className="flex gap-2">
                    {/* Direct Visit Option */}
                    <div 
                      className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                        consultationType === 'in-person' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                      onClick={() => setConsultationType('in-person')}
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          consultationType === 'in-person' 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                        }`}>
                          {consultationType === 'in-person' && (
                            <div className="w-1 h-1 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-sm text-gray-800">Direct Visit</span>
                      </div>
                      <div className="mt-1 ml-6 text-xs text-gray-600">
                        <p>• Face-to-face consultation</p>
                        <p>• Physical examination available</p>
                      </div>
                    </div>

                    {/* Online Consultation Option */}
                    <div 
                      className="flex-1 p-3 border-2 rounded-lg cursor-not-allowed opacity-50 transition-all duration-300 border-gray-200 bg-white"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                        </div>
                        <span className="font-medium text-sm text-gray-800">Online Consultation</span>
                      </div>
                      <div className="mt-1 ml-6 text-xs">
                        <p className="text-red-500 font-medium">• Temporarily Unavailable</p>
                        <p className="text-gray-600">• Video call consultation</p>
                        <p className="text-gray-600">• No travel required</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                    <p>• Arrive 15 mins before appointment</p>
                    <p>• Keep medical records ready</p>
                  </div>
                </div>

                {selectedDoctor.profilePicture ? (
                  <img
                    src={`http://localhost:5001${selectedDoctor.profilePicture}`}
                    alt={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                    className="w-32 h-32 object-cover rounded-sm"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <p className="text-gray-600 mt-2">
                  {selectedDoctor.degree} | {selectedDoctor.specialization}
                </p>
                <p className="text-gray-800 font-medium">
                  Fee: ₹{selectedDoctor.fees}
                </p>

                <div className="mt-6">
                  <h3 className="text-xl font-bold">Available Slots</h3>
                  <div className="flex gap-4 mt-4 pb-2">
                    {Array.isArray(docSlots) &&
                      docSlots.map((slot, index) => {
                        const slotDate = new Date(slot.formattedDate);
                        const formattedDate = slotDate.toLocaleDateString(
                          "en-US",
                          { day: "numeric" }
                        );

                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleDateSelection(index, slot.formattedDate)
                            }
                            className={`text-center py-3 px-4 rounded-lg cursor-pointer flex-shrink-0 transition-colors
                              ${
                                slotIndex === index
                                  ? "bg-blue-500 text-white"
                                  : "border border-gray-300 hover:border-blue-500"
                              }`}
                          >
                            <p className="font-medium">{slot.dayName}</p>
                            <p className="text-lg">{formattedDate}</p>
                          </div>
                        );
                      })}
                  </div>

                  {/* Available Time Slots */}
                  {selectedDoctor && selectedDate && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold">Available Time Slots</h3>
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {loading ? (
                          <div className="col-span-3 text-center py-4">
                            Loading available slots...
                          </div>
                        ) : availableSlots[selectedDoctor._id]?.[selectedDate]?.length > 0 ? (
                          availableSlots[selectedDoctor._id][selectedDate].map((time, index) => (
                            <div
                              key={index}
                              onClick={() => setSlotTime(time)}
                              className={`text-center p-3 rounded-lg cursor-pointer transition-colors
                                ${
                                  time === slotTime
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                }
                              `}
                            >
                              {new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-3 text-center py-4 text-gray-500">
                            No slots available for this day
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBookAppointment}
                  disabled={!slotTime}
                  className={`px-6 py-3 rounded-full mt-8 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg ${
                    slotTime
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Book Appointment
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-2 text-center py-10">
            <p className="text-xl text-gray-600">
              No doctors available at the moment.
            </p>
            <p className="text-gray-500 mt-2">Please try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointment;