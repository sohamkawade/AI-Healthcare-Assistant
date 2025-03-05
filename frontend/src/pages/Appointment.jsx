import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiService from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  FaUserMd,
  FaBriefcaseMedical,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const Appointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Days of the week for selection
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [user]);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await apiService.getDoctors();
        if (response.success) {
          setDoctors(response.data);
        } else {
          toast.error("Failed to fetch doctors");
        }
      } catch (error) {
        toast.error("Error fetching doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const fetchTimeSlots = async (doctorId, date) => {
    setLoading(true);
    try {
      const response = await apiService.getAvailableTimeSlots(doctorId, date);
      if (response && response.length) {
        const unbookedSlots = response.filter((slot) => !slot.isBooked);
        setTimeSlots(unbookedSlots);
      } else {
        setTimeSlots([]);
        toast.info("No available time slots for the selected doctor and date.");
      }
    } catch (error) {
      toast.error("Error fetching time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setDoctorDetails(null);
    setSelectedDate("");
    setSelectedDay("");
    setTimeSlots([]);

    if (doctorId) {
      const selectedDoc = doctors.find((doc) => doc._id === doctorId);
      setDoctorDetails(selectedDoc);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setSelectedDate(selectedDate);

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(selectedDate);

    if (!isValidDate) {
      toast.error("Invalid date format. Please select a valid date.");
      return;
    }

    if (selectedDoctor) {
      fetchTimeSlots(selectedDoctor, selectedDate);
    }
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    // You can add logic here to fetch time slots based on the selected day
  };

  const handleSchedule = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !selectedDate || !appointmentType || timeSlots.length === 0) {
      toast.error("Please fill all the fields");
      return;
    }

    const selectedTimeSlot = timeSlots[0];

    const appointmentDetails = {
      patientId: user.id,
      doctorId: selectedDoctor,
      timeSlot: {
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      },
      appointmentType,
      date: selectedDate,
    };

    setLoading(true);

    try {
      await apiService.scheduleAppointment(appointmentDetails);
      toast.success("Appointment scheduled successfully");
    } catch (error) {
      toast.error("Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-8 min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <div className="container mx-auto bg-white p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Book Your Appointment</h1>

        {/* Patient Information */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Patient Information</h2>
          <div className="space-y-3">
            <p className="flex items-center text-blue-800">
              <FaUser className="mr-2 text-blue-600" /> {user?.firstName} {user?.lastName}
            </p>
            <p className="flex items-center text-blue-800">
              <FaEnvelope className="mr-2 text-blue-600" /> {user?.email}
            </p>
            <p className="flex items-center text-blue-800">
              <FaPhone className="mr-2 text-blue-600" /> {user?.contactNumber}
            </p>
            <p className="flex items-center text-blue-800">
              <FaCalendarAlt className="mr-2 text-blue-600" /> {user.birthdate?.split("T")[0]}
            </p>
          </div>
        </div>

        {/* Doctor Selection */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Select Doctor</h2>
          <select
            value={selectedDoctor}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>--Select Doctor--</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
              </option>
            ))}
          </select>
        </div>

        {/* Doctor Details */}
        {doctorDetails && (
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Doctor Details</h2>
            <div className="space-y-3">
              <p className="flex items-center text-blue-800">
                <FaUserMd className="mr-2 text-blue-600" /> Dr. {doctorDetails.firstName} {doctorDetails.lastName}
              </p>
              <p className="flex items-center text-blue-800">
                <FaBriefcaseMedical className="mr-2 text-blue-600" /> Specialty: {doctorDetails.specialization}
              </p>
            </div>
          </div>
        )}

        {/* Day Selection */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Select Day</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                onClick={() => handleDayChange(day)}
                className={`p-4 text-center rounded-lg cursor-pointer ${
                  selectedDay === day ? "bg-blue-600 text-white" : "bg-white text-blue-900 border border-blue-300"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Date and Time Selection */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Select Date and Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-2">Appointment Type</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>--Select Type--</option>
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Time Slots */}
          {loading ? (
            <div className="text-center text-blue-900 mt-6">Loading time slots...</div>
          ) : selectedDoctor && selectedDate ? (
            timeSlots.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className="p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedTimeSlot(slot.startTime)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaClock className="mr-2 text-blue-600" />
                          <span className="text-blue-900">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {slot.isBooked ? (
                          <FaTimesCircle className="text-red-500" />
                        ) : (
                          <FaCheckCircle className="text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-blue-900 mt-6">No available time slots for this date.</div>
            )
          ) : (
            <div className="text-center text-blue-900 mt-6">Please select a doctor and date to view time slots.</div>
          )}
        </div>

        {/* Schedule Button */}
        <button
          onClick={handleSchedule}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Schedule Appointment
        </button>
      </div>
    </div>
  );
};

export default Appointment;