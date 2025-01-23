import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCapsules, FaClock, FaNotesMedical, FaCalendarAlt, FaPills } from "react-icons/fa";
import { toast } from "react-toastify";
import apiService from "../services/apiService";
import BackButton from '../components/BackButton';

const MedicationReminder = () => {
  const [medications, setMedications] = useState([]);
  const [medication, setMedication] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);

  useEffect(() => {
    const storedMedications = JSON.parse(localStorage.getItem("medications")) || [];
    setMedications(storedMedications);
  }, []);

  useEffect(() => {
    const reminderInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      setMedications((prevMedications) =>
        prevMedications
          .map((med) => {
            if (med.time && new Date(med.time).getTime() <= currentTime && !med.notified) {
              toast.info(`Time to take your medication: ${med.medication}`, { theme: "colored" });
              return { ...med, notified: true };
            }
            return med;
          })
          .filter((med) => new Date(med.time).getTime() > currentTime || !med.notified)
      );
    }, 60000);

    return () => clearInterval(reminderInterval);
  }, [medications]);

  useEffect(() => {
    const removeExpiredMedications = setInterval(() => {
      const currentTime = new Date().getTime();
      setMedications((prevMedications) =>
        prevMedications.filter((med) => {
          if (med.notified && new Date(med.time).getTime() + 5 * 60000 < currentTime) {
            const updatedMedications = prevMedications.filter((item) => item._id !== med._id);
            localStorage.setItem("medications", JSON.stringify(updatedMedications));
            return false;
          }
          return true;
        })
      );
    }, 60000);

    return () => clearInterval(removeExpiredMedications);
  }, [medications]);

  const handleAddMedication = async (e) => {
    e.preventDefault();

    if (medication && dose && time) {
      const currentDate = new Date();
      const [hours, minutes] = time.split(":");
      const reminderTime = new Date(currentDate);
      reminderTime.setHours(parseInt(hours));
      reminderTime.setMinutes(parseInt(minutes));
      reminderTime.setSeconds(0);
      reminderTime.setMilliseconds(0);

      if (reminderTime <= currentDate) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const newMedication = {
        medication,
        dose,
        time: reminderTime.toISOString(),
        notified: false,
      };

      try {
        const response = await apiService.createReminder(newMedication);
        if (response && response.medication && response.dose && response.time && response._id) {
          setMedications((prevMedications) => [...prevMedications, response]);
          setMedication("");
          setDose("");
          setTime("");
          setError("");
          toast.success("Medication reminder added successfully!", { theme: "colored" });
        } else {
          setError("Invalid data in API response.");
          toast.error("Failed to add medication reminder.", { theme: "colored" });
        }
      } catch (error) {
        setError("Failed to add medication reminder.");
        toast.error("Failed to add medication reminder.", { theme: "colored" });
      }
    } else {
      setError("All fields are required.");
      toast.error("All fields are required.", { theme: "colored" });
    }
  };

  const handleDeleteMedication = async (id) => {
    try {
      const response = await apiService.deleteReminder(id);
      if (response && response.message === "Reminder deleted successfully") {
        setMedications((prevMedications) => {
          const updatedMedications = prevMedications.filter((med) => med._id !== id);
          localStorage.setItem("medications", JSON.stringify(updatedMedications));
          return updatedMedications;
        });
        toast.success("Medication reminder deleted successfully!", { theme: "colored" });
      } else {
        toast.error("Failed to delete medication reminder.", { theme: "colored" });
      }
    } catch (error) {
      toast.error("An error occurred while deleting the medication reminder.", { theme: "colored" });
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await apiService.getReminders();
      if (response) {
        setMedications(response);
        localStorage.setItem("medications", JSON.stringify(response));
      }
    }
    catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const doses = ["250mg", "500mg", "750mg", "1000mg"];

  return (
    <div className="flex flex-col items-center bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 min-h-screen p-6">
      {/* Back Button */}
      <BackButton />
      <motion.div
        initial={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-3xl font-semibold text-center text-indigo-700 mb-6 flex items-center justify-center">
          <FaNotesMedical className="w-10 h-10 mr-2 text-indigo-500" />
          Medication Reminder
        </h2>

        <button
          onClick={() => setShowReminderForm((prev) => !prev)}
          className={`w-full ${showReminderForm ? "bg-red-500" : "bg-gradient-to-r from-blue-400 to-teal-500"
            } text-white font-semibold py-2 rounded-lg hover:opacity-90 transition duration-300 mb-6`}
        >
          {showReminderForm ? "Close Reminder Form" : "Add Medication Reminder"}
        </button>

        {showReminderForm && (
          <form onSubmit={handleAddMedication} className="space-y-4">
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
            <motion.div
              className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50"
              initial={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaPills className="text-indigo-400 mr-2" />
              <input
                type="text"
                placeholder="Medication Name"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700"
                required
              />
            </motion.div>

            <motion.div
              className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50"
              initial={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaCapsules className="text-indigo-400 mr-2" />
              <select
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 cursor-pointer"
                required
              >
                <option value="">Select Dose</option>
                {doses.map((doseOption) => (
                  <option key={doseOption} value={doseOption}>
                    {doseOption}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div
              className="flex items-center border border-gray-300 rounded-lg p-2 bg-gray-50"
              initial={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FaClock className="text-indigo-400 mr-2" />
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  setTimeSelected(true);
                }}
                className={`flex-1 bg-transparent outline-none text-gray-700 cursor-${timeSelected ? "default" : "pointer"
                  }`}
                required
              />
            </motion.div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold py-2 rounded-lg hover:opacity-90 transition duration-300"
            >
              Add Reminder
            </button>
          </form>
        )}
      </motion.div>

      {medications.length === 0 ? (
        <div className="text-center mt-6 text-gray-700">
          <FaCalendarAlt className="w-12 h-12 text-indigo-500 mb-4 mx-auto" />
          <p className="font-semibold text-xl text-gray-900">No reminders set yet. Add your first reminder now!</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-wrap justify-center space-x-6">
          {medications.map((med, index) => (
            <motion.li
              key={med._id || index}
              className="bg-white border-blue-500 border-t-4 shadow-xl rounded-xl p-2 flex flex-col justify-between items-center w-full sm:w-64 md:w-72 lg:w-80 hover:scale-105 transition-all duration-300 ease-in-out"
              initial={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col mb-4">
                <p className="font-bold text-black text-sm mt-2 mb-1">
                  Medication:{" "}
                  <span className="font-normal">
                  {med.medication}
                  </span>
                </p>
                <p className="text-black text-sm font-bold mb-1">
                  Dose:{" "}
                  <span className="font-normal">
                  {med.dose}
                  </span>
                </p>
                <p className="text-black text-sm font-bold">
                  Reminder Time:{" "}
                  <span className="font-normal">
                    {new Date(med.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleDeleteMedication(med._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-all duration-200"
              >
                Delete
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MedicationReminder;
