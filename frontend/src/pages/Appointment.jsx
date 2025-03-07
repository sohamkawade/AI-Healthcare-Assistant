import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import doctorImage from "../assets/doctor.jpg";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const Appointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/login");
      return;
    }
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view doctors.");
        return;
      }

      const response = await axios.get("http://localhost:5001/api/doctors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.data) {
        const availableDoctors = response.data.data.filter(
          (doc) => doc.available === true
        );

        if (availableDoctors.length === 0) {
          toast.error(
            "No doctors are available right now. Please try again later.", {theme:"colored"}
          );
        } else {
          setDoctors(availableDoctors);
          setSelectedDoctor(availableDoctors[0]);
        }
      } else {
        toast.error("No doctor data found.", {theme:"colored"});
      }
    } catch (error) {
      toast.error("Failed to fetch doctors. Please try again.", {theme:"colored"});
    }
  };

  const docSlots = Array(7)
    .fill(0)
    .map((_, i) => {
      return Array(5)
        .fill(0)
        .map((_, j) => {
          let date = new Date();
          date.setDate(date.getDate() + i);
          date.setHours(10 + j * 2, 0, 0, 0);
          return {
            datetime: date,
            time: date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });
    });

    const bookAppointment = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
    
      if (!token || !userId) {
        toast.error("Please log in to book an appointment.", {theme:"colored"});
        return;
      }
    
      const formattedSlotTime = formatSlotTime(slotTime); // Extract date and time separately
    
      if (!formattedSlotTime || !formattedSlotTime.date || !formattedSlotTime.time) {
        toast.error("Invalid slot time format.");
        return;
      }
    
      if (!selectedDoctor || !selectedDoctor._id) {
        toast.error("Doctor not selected or invalid doctor.");
        return;
      }
    
      // Construct the request data payload
      const requestData = {
        docId: selectedDoctor._id, 
        userId: userId,
        slotDate: formattedSlotTime.date, 
        slotTime: formattedSlotTime.time, 
      };
    
      try {
        const response = await axios.post(
          "http://localhost:5001/api/appointments/book",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

    
        if (response.status === 200 && response.data.success) {
          toast.success(response.data.message || "Appointment booked successfully.", {theme:"colored"});
          navigate('/dashboard');
        } else {
          toast.error(
            `Failed to book appointment: ${response.data.message || "Unknown error", {theme:"colored"}}`
          );
        }
      } catch (error) {
    
        if (error.response) {
          toast.error(
            `Failed to book appointment: ${
              error.response?.data?.message || "Unknown error"
            }`
          );
        } else {
          toast.error(`Failed to book appointment: ${error.message}`, {theme:"colored"});
        }
      }
    };
    
    // Helper function to format slot time
    const formatSlotTime = (slotTime) => {
      if (!slotTime || !slotTime.includes(" ")) {
        console.error("Invalid slot time format:", slotTime);
        return null;
      }
    
      const timeParts = slotTime.split(" ");
      const time = timeParts[0];
      const period = timeParts[1];
    
      if (!/^\d{1,2}:\d{2}$/.test(time)) {
        console.error("Invalid time format:", time);
        return null;
      }
    
      const today = new Date();
      const todayDate = today.toISOString().split("T")[0];
    
      let [hours, minutes] = time.split(":").map(Number);
    
      if (period === "pm" && hours !== 12) {
        hours += 12;
      }
      if (period === "am" && hours === 12) {
        hours = 0;
      }
    
      const formattedTimeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    
      return {
        date: todayDate,
        time: formattedTimeString,
      };
    };

    return (
      <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.length > 0 ? (
          <>
            {/* Doctor Selection */}
            <div className="pr-4">
              <h2 className="text-3xl font-bold mb-6">Select a Doctor</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl 
                      border border-gray-300 hover:border-blue-500 
                      ${selectedDoctor?._id === doctor._id ? "border-2 border-blue-500" : ""}`}
                  >
                    <div className="w-full aspect-square">
                      <img
                        src={doctor.image || doctorImage}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <span
                        className={`font-medium ${doctor.available ? "text-green-500" : "text-red-500"}`}
                      >
                        ● {doctor.available ? "Available" : "Unavailable"}
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
                ))}
              </div>
            </div>
    
            {/* Appointment Details - Show only after doctor selection */}
            {selectedDoctor && (
              <div className="border border-gray-300 rounded-lg p-6 h-fit">
                <h3 className="text-2xl font-bold mb-4">
                  Appointment with Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </h3>
                <img
                  src={selectedDoctor.image || doctorImage}
                  alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <p className="text-gray-600 mt-2">
                  {selectedDoctor.degree || "Specialization not available"} | {selectedDoctor.specialization || "Experience not available"}
                </p>
                <p className="text-gray-800 font-medium">
                  Fee: ₹{selectedDoctor.fees}
                </p>
    
                {/* Available Slots - Show only after doctor selection */}
                <div className="mt-6">
                  <h3 className="text-xl font-bold">Available Slots</h3>
                  <div className="flex gap-4 mt-4">
                    {docSlots.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => setSlotIndex(index)}
                        className={`text-center py-3 px-4 rounded-lg cursor-pointer ${
                          slotIndex === index
                            ? "bg-blue-500 text-white"
                            : "border border-gray-300"
                        }`}
                      >
                        <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                        <p>{item[0].datetime.getDate()}</p>
                      </div>
                    ))}
                  </div>
    
                  {/* Slot Times - Show only after date selection */}
                  {slotIndex !== null && (
                    <div className="flex gap-4 mt-6 flex-wrap">
                      {docSlots[slotIndex]?.map((item, index) => (
                        <p
                          key={index}
                          onClick={() => setSlotTime(item.time)}
                          className={`py-2 px-3 rounded-lg cursor-pointer ${
                            item.time === slotTime
                              ? "bg-blue-500 text-white"
                              : "border border-gray-300"
                          }`}
                        >
                          {item.time}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
    
                {/* Book Appointment Button - Enable only after time selection */}
                <button
                  onClick={bookAppointment}
                  disabled={!slotTime}
                  className={`px-6 py-3 rounded-full mt-8 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg ${
                    slotTime ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Book Appointment
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-2xl font-bold text-red-500">
            No doctors available. Please try again later.
          </div>
        )}
      </div>
    );
    
};

export default Appointment;
