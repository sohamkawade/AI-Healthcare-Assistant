import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import doctorImage from "../assets/doctor.jpg"; // Adjust this path if necessary

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const Appointment = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Add isAuthenticated state

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    console.log("UserId from localStorage in useEffect:", userId);

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
            "No doctors are available right now. Please try again later."
          );
        } else {
          setDoctors(availableDoctors);
          setSelectedDoctor(availableDoctors[0]); // Set the first doctor as default
        }
      } else {
        toast.error("No doctor data found.");
      }
    } catch (error) {
      toast.error("Failed to fetch doctors. Please try again.");
    }
  };

  // Creating appointment slots dynamically for the next 7 days
  const docSlots = Array(7)
    .fill(0)
    .map((_, i) => {
      return Array(5)
        .fill(0)
        .map((_, j) => {
          let date = new Date();
          date.setDate(date.getDate() + i);
          date.setHours(10 + j * 2, 0, 0, 0); // Time slots at 10:00, 12:00, 2:00, etc.
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
      // Retrieve token and userId from localStorage
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
    
      // Check if token and userId are available
      if (!token || !userId) {
        toast.error("Please log in to book an appointment.");
        return;
      }
    
      // Log the token and userId for debugging purposes
      console.log("Token:", token);
      console.log("User ID:", userId);
    
      // Format the slot time
      const formattedSlotTime = formatSlotTime(slotTime);
    
      // Check if the formatted slot time is valid
      if (!formattedSlotTime) {
        toast.error("Invalid slot time format.");
        return;
      }
    
      // Log the formatted slot time
      console.log("Formatted Slot Time:", formattedSlotTime);
    
      // Check selected doctor details before sending the request
      console.log("Selected Doctor:", selectedDoctor);
    
      // If selectedDoctor or selectedDoctor._id is invalid, show an error
      if (!selectedDoctor || !selectedDoctor._id) {
        toast.error("Doctor not selected or invalid doctor.");
        return;
      }
    
      // Construct the request data payload
      const requestData = {
        doctorId: selectedDoctor._id,  // Ensure this field matches the backend's expectations
        userId: userId,
        date: formattedSlotTime,
        time: slotTime,
      };
    
      // Log the request data before sending the API request
      console.log("Request Data:", requestData);
    
      try {
        // Send POST request to book the appointment
        const response = await axios.post(
          "http://localhost:5001/api/appointments/book",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        // Log the server response for debugging purposes
        console.log("Response Data:", response.data);
    
        // Check if the response status is 200 (success)
        if (response.status === 200) {
          toast.success("Appointment booked successfully.");
        } else {
          // Show a detailed error message if the booking fails
          toast.error(
            `Failed to book appointment: ${
              response.data.message || "Unknown error"
            }`
          );
        }
      } catch (error) {
        // Handle and log errors that occur during the request
        console.error("Error booking appointment:", error);
    
        // Check if the error has a response from the server
        if (error.response) {
          console.error("Error response data:", error.response.data);
    
          // Show error toast with the message from the backend response
          toast.error(
            `Failed to book appointment: ${
              error.response?.data?.message || "Unknown error"
            }`
          );
        } else {
          // If no response, show a generic error message
          console.error("Error message:", error.message);
          toast.error(`Failed to book appointment: ${error.message}`);
        }
      }
    };
    

  // Helper function to format slot time
  const formatSlotTime = (slotTime) => {
    // Check if the slotTime is provided and correctly formatted
    if (!slotTime || !slotTime.includes(" ")) {
      console.error("Invalid slot time format:", slotTime);
      return null; // Return null if the time format is invalid
    }

    // Split the time and period (AM/PM)
    const timeParts = slotTime.split(" ");
    const time = timeParts[0]; // "10:00"
    const period = timeParts[1]; // "am" or "pm"

    // Validate time format (hh:mm)
    if (!/^\d{1,2}:\d{2}$/.test(time)) {
      console.error("Invalid time format:", time);
      return null; // Return null if the time is not in the correct format
    }

    // Get current date (today)
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0]; // "YYYY-MM-DD" format

    // Convert the time string into a 24-hour format for correct parsing
    let [hours, minutes] = time.split(":").map(Number);

    if (period === "pm" && hours !== 12) {
      hours += 12; // Convert PM hours (except 12 pm which is already correct)
    }

    if (period === "am" && hours === 12) {
      hours = 0; // Convert 12 am to 00:00
    }

    // Ensure hours and minutes are two digits
    const formattedTimeString = `${todayDate}T${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(2, "0")}:00`;

    const formattedDate = new Date(formattedTimeString);

    // Validate if the date is correct
    if (isNaN(formattedDate.getTime())) {
      console.error("Invalid time value:", slotTime);
      return null; // Return null if the time is invalid or parsing fails
    }

    // Return the correctly formatted ISO string
    return formattedDate.toISOString(); // Example: "2025-03-06T15:30:00.000Z"
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
                    ${
                      selectedDoctor?._id === doctor._id
                        ? "border-2 border-blue-500"
                        : ""
                    }`}
                >
                  <div className="w-full aspect-square">
                    <img
                      src={doctor.image || doctorImage} // Use a default image if doctor.image is not available
                      alt={`${doctor.firstName} ${doctor.lastName}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span
                      className={`font-medium ${
                        doctor.available ? "text-green-500" : "text-red-500"
                      }`}
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

          {/* Appointment Details */}
          <div className="border border-gray-300 rounded-lg p-6 h-fit">
            <h3 className="text-2xl font-bold mb-4">
              Appointment with Dr. {selectedDoctor?.firstName}{" "}
              {selectedDoctor?.lastName}
            </h3>
            <img
              src={selectedDoctor?.image || doctorImage}
              alt={`Dr. ${selectedDoctor?.firstName} ${selectedDoctor?.lastName}`}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <p className="text-gray-600 mt-2">
              {selectedDoctor?.specialization || "Specialization not available"}{" "}
              | {selectedDoctor?.experience || "Experience not available"}
            </p>
            <p className="text-gray-800 font-medium">
              Fee: ₹{selectedDoctor?.fees}
            </p>

            {/* Available Slots */}
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

              {/* Slot Times */}
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
            </div>

            {/* Book Appointment Button */}
            <button
              onClick={bookAppointment}
              className="bg-blue-500 text-white px-6 py-3 rounded-full mt-8 transform transition-all duration-300 ease-in-out hover:bg-blue-600 hover:scale-105 hover:shadow-lg"
            >
              Book Appointment
            </button>
          </div>
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
