import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import { FaUserMd, FaBriefcaseMedical, FaCalendarAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BackButton from '../components/BackButton';

const Appointment = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await apiService.getDoctors();
        if (response.success) {
          setDoctors(response.data);
        } else {
          toast.error('Failed to fetch doctors');
        }
      } catch (error) {
        toast.error('Error fetching doctors');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available time slots based on selected doctor and date
  const fetchTimeSlots = async (doctorId, date) => {
    setLoading(true);
    try {
      const response = await apiService.getAvailableTimeSlots(doctorId, date);
      if (response && response.length) {
        const unbookedSlots = response.filter((slot) => !slot.isBooked);
        setTimeSlots(unbookedSlots);
      } else {
        setTimeSlots([]);
        toast.info('No available time slots for the selected doctor and date.');
      }
    } catch (error) {
      toast.error('Error fetching time slots');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (doctorId) => {
    setSelectedDoctor(doctorId);
    setDoctorDetails(null);
    setSelectedDate('');
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
      toast.error('Invalid date format. Please select a valid date.');
      return;
    }

    if (selectedDoctor) {
      fetchTimeSlots(selectedDoctor, selectedDate);
    }
  };

  // Handle scheduling the appointment
  const handleSchedule = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Validate input fields
    if (!selectedDoctor || !selectedDate || !appointmentType || timeSlots.length === 0) {
      toast.error('Please fill all the fields');
      return;
    }

    // Automatically select the first available time slot (you can adjust this logic)
    const selectedTimeSlot = timeSlots[0];

    // Prepare appointmentDetails object
    const appointmentDetails = {
      patientId: user.id, // Assuming user.id holds the patient ID
      doctorId: selectedDoctor, // The selected doctor's ID
      timeSlot: {
        startTime: selectedTimeSlot.startTime,
        endTime: selectedTimeSlot.endTime,
      },
      appointmentType, // The type of the appointment (e.g., Consultation)
      date: selectedDate, // Date should be in proper format (ISO 8601)
    };

    setLoading(true);

    try {
      // Send the request to the backend to schedule the appointment
      await apiService.scheduleAppointment(appointmentDetails);
      toast.success('Appointment scheduled successfully');
    } catch (error) {
      toast.error('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center p-14 min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100">
      {/* Back Button */}
    <BackButton />
      <div className="container mx-auto bg-white p-10 rounded-lg shadow-lg ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 ">
          {/* Patient Information Card */}
          <div className="p-6 bg-white rounded-lg shadow-md border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Patient Information</h2>
            <div className="text-sm text-gray-800 space-y-2">
              <p className="flex items-center">
                <FaUser className="inline mr-2 text-blue-600 text-lg" /> {user?.firstName} {user?.lastName}
              </p>
              <p className="flex items-center">
                <FaEnvelope className="inline mr-2 text-blue-600 text-lg" /> {user?.email}
              </p>
              <p className="flex items-center">
                <FaPhone className="inline mr-2 text-blue-600 text-lg" /> {user?.contactNumber}
              </p>
              <p className="flex items-center">
                <FaCalendarAlt className="inline mr-2 text-blue-600 text-lg" /> {user.birthdate?.split('T')[0]}
              </p>
            </div>
          </div>

          {/* Available Time Slots Card */}
          <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto  border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">Available Time Slots</h2>
            {loading ? (
              <div className="text-center text-gray-600 text-lg">Loading...</div>
            ) : selectedDoctor && selectedDate ? (
              timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {timeSlots.map((slot) => (
                    <div
                      key={slot._id}
                      className="flex flex-col p-4 bg-white cursor-pointer"
                      onClick={() => setSelectedTimeSlot(slot.startTime)}
                    >
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-lg font-medium text-gray-800 mb-2">
                          <p className="flex items-center">
                            <FaCalendarAlt className="inline mr-2 text-blue-600 text-lg" />
                            {new Date(slot.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-800 mb-2">
                          <FaClock className="mr-2 text-blue-600 text-5xl" />
                          <span>{slot.startTime} to {slot.endTime}</span>
                        </div>

                        <div className="text-sm text-blue-600 mt-2">
                          {slot.isBooked ? (
                            <span className="text-red-500 flex items-center">
                              <p className="flex items-center">
                                <FaTimesCircle className="mr-2 text-lg" /> Booked
                              </p>
                            </span>
                          ) : (
                            <span className="text-green-500 flex items-center">
                              <p className="flex items-center">
                                <FaCheckCircle className="mr-2 text-lg" /> Available
                              </p>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600 text-lg">
                  No available time slots for this doctor on the selected date.
                </div>
              )
            ) : (
              <div className="text-center text-gray-600 text-lg">
                Please select a doctor and date to view available time slots.
              </div>
            )}
          </div>
        </div>

        {/* Doctor Details Section */}
        {doctorDetails && (
          <div className="p-6 bg-white rounded-lg shadow-md mb-8  border-t-4 border-blue-500">
            <h2 className="text-xl font-semibold text-blue-700 mb-4">Doctor Details</h2>
            <div className="text-sm text-gray-800">
              <p className="flex items-center">
                <FaUserMd className="inline mr-2 text-blue-600 text-lg" /> Dr. {doctorDetails.firstName} {doctorDetails.lastName}
              </p>
              <p className="flex items-center">
                <FaBriefcaseMedical className="inline mr-2 text-blue-600 text-lg" /> Specialty: {doctorDetails.specialization}
              </p>
            </div>
          </div>
        )}

        {/* Schedule Appointment Form */}
        <div className="p-6 bg-white rounded-lg shadow-md  border-t-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-blue-700 mb-4">Schedule Your Appointment</h2>
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Doctor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaUserMd className="inline mr-2 text-blue-600 text-lg" /> Select Doctor
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="" disabled>--Select Doctor--</option>
                  {doctors.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2 text-blue-600 text-lg" /> Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-700"
                />
              </div>

              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaBriefcaseMedical className="inline mr-2 text-blue-600 text-lg" /> Appointment Type
                </label>
                <select
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="" disabled>--Select Type--</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Schedule Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointment;
