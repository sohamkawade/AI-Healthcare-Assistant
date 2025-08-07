import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { FaCalendarAlt, FaClock, FaStar } from "react-icons/fa";


const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Appointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [consultationType, setConsultationType] = useState("in-person");
  const { user } = useAuth();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        toast.error(
          "Please log in to access the appointment page.",
          {
            duration: 2000,
            position: 'top-right',
            style: {
              background: '#EF4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        navigate("/login");
        return;
      }

      // Check if user is a patient by checking if they have a specialization
      // If user has specialization, they are a doctor, otherwise they are a patient
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const isPatient = !decodedToken.specialization;

      if (!isPatient) {
        toast(
          "Only patients can book appointments. Please login with a patient profile.",
          {
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
          }
        );
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
      const response = await axios.get(
        "http://localhost:5001/api/auth/doctors"
      );

      if (response.data && response.data.success) {
        setDoctors(response.data.data);
      } else {
        setDoctors([]);
        console.error("Invalid response format:", response);
        toast.error(
          "Failed to load doctors list. Please try again later.",
          {
            duration: 2000,
            position: 'top-right',
            style: {
              background: '#EF4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
      }
    } catch (error) {
      console.error("Error fetching doctors:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(
        `Error: ${
          error.message || "An error occurred while fetching doctors list."
        }`,
        {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }
      );
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
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `http://localhost:5001/api/appointments/available-slots?docId=${docId}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const slots = response.data.data;
        console.log("Received slots:", slots);

        setAvailableSlots((prev) => ({
          ...prev,
          [docId]: {
            ...prev?.[docId],
            [date]: slots,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error("Failed to fetch available slots", 
        {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }
      );
      setAvailableSlots((prev) => ({
        ...prev,
        [docId]: {
          ...prev?.[docId],
          [date]: [],
        },
      }));
    }
  };



  const handleBookAppointment = async () => {
    if (!slotTime || !selectedDoctor || !selectedDate) {
      toast.error("Please select all required fields", 
        {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }
      );
      return;
    }

    if (!consultationType) {
      toast.error("Please select a consultation type", {
        duration: 2000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500',
        },
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Check daily appointment limit
      const dailyCountResponse = await axios.get(
        `http://localhost:5001/api/appointments/patient/${user._id}/daily-count?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (dailyCountResponse.data.count >= 2) {
        toast.error("You can only book 2 appointments per day", 
          {
            duration: 2000,
            position: 'top-right',
            style: {
              background: '#EF4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        return;
      }

      // Check if patient already has an appointment at this time slot
      const timeSlotCheckResponse = await axios
        .get(`http://localhost:5001/api/appointments/check-timeslot`, {
          params: {
            patientId: user._id,
            date: selectedDate,
            time: slotTime,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .catch((error) => {
          console.error(
            "Time slot check error:",
            error.response?.data || error.message
          );
          throw error;
        });

      if (timeSlotCheckResponse.data.hasAppointment) {
        toast.error(timeSlotCheckResponse.data.message, 
          {
            duration: 2000,
            position: 'top-right',
            style: {
              background: '#EF4444',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }
        );
        return;
      }

      // Proceed with booking
      const appointmentData = {
        docId: selectedDoctor._id,
        slotDate: selectedDate,
        slotTime: slotTime,
        consultationType: consultationType,
      };

      const bookResponse = await axios.post(
        "http://localhost:5001/api/appointments/book",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (bookResponse.data.success) {
        toast.success("Appointment booked successfully!", {
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
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage, 
        {
          duration: 2000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }
      );
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6 pt-20 sm:pt-24 md:pt-28">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#363636",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          },
          success: {
            style: {
              background: "#22C55E",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#22C55E",
            },
          },
          error: {
            style: {
              background: "#EF4444",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          },
          warning: {
            style: {
              background: "#F97316",
              color: "#fff",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#F97316",
            },
          },
        }}
      />
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.isArray(doctors) && doctors.length > 0 ? (
          <>
            <div className="pr-4">
              <h2 className="text-3xl font-bold mb-6">Select a Doctor</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {doctors.map((doctor) => {
                  const isSelected = selectedDoctor?._id === doctor._id;
                  let isAvailable = true;

                  if (isSelected && selectedDate) {
                    const doctorSlots = availableSlots[doctor._id]?.[selectedDate] || [];
                    isAvailable = doctorSlots.length > 0;
                  }

                  return (
                    <div
                      key={doctor._id}
                      className={`relative rounded-lg shadow-md p-3 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? "border-2 border-blue-500 bg-blue-50"
                          : "border border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        if (selectedDate) {
                          fetchAvailableSlots(doctor._id, selectedDate);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          {doctor.profilePicture ? (
                            <img
                              src={`http://localhost:5001${doctor.profilePicture}`}
                              alt={`${doctor.firstName} ${doctor.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </h3>
                          </div>
                          <p className="text-gray-600 text-sm mb-1 truncate">
                            {doctor.specialization}
                          </p>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < (doctor.rating || 0)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-600">
                              {doctor.rating || 0} ({doctor.reviews?.length || 0} reviews)
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-gray-800 font-medium text-sm">
                              Fee: ₹{doctor.fees}
                            </p>
                            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                              isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedDoctor && (
              <div className="mt-16 border border-gray-300 rounded-lg p-4 h-fit w-full">

                {/* Add Consultation Type Selection */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold mb-1.5 text-gray-800">Select Consultation Type</h3>
                  <div className="flex gap-1.5">
                    {/* Direct Visit Option */}
                    <div
                      className={`flex-1 p-2 border-2 rounded-md cursor-pointer transition-all duration-300 ${consultationType === "in-person"
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 bg-white"}
                      }`}
                      onClick={() => setConsultationType("in-person")}
                    >
                      <div className="flex items-center space-x-1.5">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${consultationType === "in-person"
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"}
                          }`}
                        >
                          {consultationType === "in-person" && (
                            <div className="w-0.5 h-0.5 rounded-full bg-white"></div>
                          )}
                        </div>
                        <span className="font-medium text-xs text-gray-800">Direct Visit</span>
                      </div>
                      <div className="mt-0.5 ml-5 text-[10px] text-gray-600">
                        <p>• Face-to-face consultation</p>
                        <p>• Physical examination available</p>
                      </div>
                    </div>

                    {/* Online Consultation Option */}
                    <div className="flex-1 p-2 border-2 rounded-md cursor-not-allowed opacity-50 transition-all duration-300 border-gray-200 bg-white">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 rounded-full bg-gray-300"></div>
                        </div>
                        <span className="font-medium text-xs text-gray-800">Online Consultation</span>
                      </div>
                      <div className="mt-0.5 ml-5 text-[10px]">
                        <p className="text-red-500 font-medium">• Temporarily Unavailable</p>
                        <p className="text-gray-600">• Video call consultation</p>
                        <p className="text-gray-600">• No travel required</p>
                      </div>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="mt-1.5 p-1.5 bg-gray-50 rounded text-[10px] text-gray-600">
                    {/* Removed notes about arrival time and medical records */}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mt-3 mb-3">
                  <h3 className="text-sm font-semibold mb-1.5 text-gray-800">Select Date</h3>
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5">
                    {Array.isArray(docSlots) &&
                      docSlots.map((slot, index) => {
                        const slotDate = new Date(slot.formattedDate);
                        const formattedDate = slotDate.toLocaleDateString(
                          "en-US",
                          { day: "numeric" }
                        );
                        const formattedMonth = slotDate.toLocaleDateString('en-US', { month: 'short' });

                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleDateSelection(index, slot.formattedDate)
                            }
                            className={`text-center py-1.5 px-2 rounded-md cursor-pointer flex-shrink-0 transition-colors text-xs
                              ${
                                slotIndex === index
                                  ? "bg-blue-500 text-white"
                                  : "border border-gray-300 hover:border-blue-500"
                              }`}
                          >
                            <p className="font-medium text-xs">{slot.dayName}</p>
                            <p className="text-sm">{formattedDate} {formattedMonth}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Display Selected Date and Time */}
                {selectedDate && (
                  <div className="mt-3 mb-3">
                    <h3 className="text-sm font-semibold mb-1.5 text-gray-800">Selected Slot</h3>
                    <div className="flex items-center gap-3">
                      <p className="text-gray-700 text-xs font-medium flex items-center">
                        <FaCalendarAlt className="mr-1.5 text-blue-500 w-3.5 h-3.5" />
                        {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      {slotTime && (
                        <p className="text-gray-700 text-xs font-medium flex items-center">
                          <FaClock className="mr-1.5 text-blue-500 w-3.5 h-3.5" />
                          {new Date(`2000-01-01T${slotTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Time Slots (Remains) */}
                {selectedDoctor && selectedDate && (availableSlots[selectedDoctor._id]?.[selectedDate]?.length > 0) && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold mb-2 text-gray-800">Available Time Slots</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots[selectedDoctor._id][selectedDate].map((time, index) => (
                      <div
                        key={index}
                        onClick={() => setSlotTime(time)}
                        className={`text-center p-1.5 rounded-md cursor-pointer transition-colors text-xs
                            ${time === slotTime
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200 border border-gray-200"}
                          }`}
                      >
                        {new Date(`2000-01-01T${time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

                <button
                  onClick={handleBookAppointment}
                  disabled={!slotTime || !selectedDate || !selectedDoctor}
                  className={`px-4 py-1.5 rounded-full mt-4 w-full text-base transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg
                    ${slotTime && selectedDate && selectedDoctor
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"}
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