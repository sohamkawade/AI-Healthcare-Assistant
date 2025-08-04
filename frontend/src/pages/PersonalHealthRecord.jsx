import React, { useState, useEffect } from "react";
import { FaDownload, FaEdit, FaTrashAlt, FaPlus, FaSearch } from "react-icons/fa";
import { GiMedicines, GiHospital } from "react-icons/gi";
import "tailwindcss/tailwind.css";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientHealthRecord = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [medicalHistory, setMedicalHistory] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [newRecord, setNewRecord] = useState({
    title: "",
    description: "",
    date: "",
    file: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchRecords();
      fetchMedicalHistory();
    }
  }, [user]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await apiService.getPatientRecords(user.id);
      setRecords(response);
    } catch (error) {
      console.error("Error fetching records:", error);
      toast.error("Error fetching records. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicalHistory = async () => {
    setLoading(true);
    try {
      const response = await apiService.getMedicalHistory(user.id);
      setMedicalHistory(response);
    } catch (error) {
      console.error("Error fetching medical history:", error);
      toast.error("Error fetching medical history. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddRecord = () => {
    setIsAdding(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      toast.warning("Patient ID is missing. Please log in again.", { position: "top-right", autoClose: 5000 });
      return;
    }
    if (newRecord.title && newRecord.description && newRecord.date && newRecord.file) {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        formData.append("title", newRecord.title);
        formData.append("description", newRecord.description);
        formData.append("date", newRecord.date);
        formData.append("file", newRecord.file);
        formData.append("patientId", user._id);

        const result = await apiService.addRecord(formData);
        setRecords([...records, result]);
        setNewRecord({ title: "", description: "", date: "", file: null });
        toast.success("Record added successfully!", { position: "top-right", autoClose: 5000 });
      } catch (error) {
        console.error("Error adding record:", error);
        toast.error("Error adding record. Please try again.", { position: "top-right", autoClose: 5000 });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.warning("Please fill in all fields before submitting.", { position: "top-right", autoClose: 5000 });
    }
  };

  const handleCancel = () => {
    setNewRecord({ title: "", description: "", date: "", file: "" });
    setIsAdding(false);
  };

  const filteredRecords = records.filter(
    (record) =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan min-h-screen p-4 sm:p-8">
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-0">
            Patient Health Records
          </h1>
          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <FaSearch className="absolute right-3 top-3 text-gray-400" />
            </div>
            <button
              onClick={handleAddRecord}
              className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Record
            </button>
          </div>
        </div>

        {/* Medical History Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <GiMedicines className="text-4xl text-indigo-600 mr-4" />
              <h3 className="text-xl font-semibold text-gray-800">Diseases</h3>
            </div>
            <ul className="list-disc pl-5 text-gray-700">
              {medicalHistory.diseases?.length > 0 ? (
                medicalHistory.diseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))
              ) : (
                <li>No diseases listed</li>
              )}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <GiHospital className="text-4xl text-indigo-600 mr-4" />
              <h3 className="text-xl font-semibold text-gray-800">Surgeries</h3>
            </div>
            <ul className="list-disc pl-5 text-gray-700">
              {medicalHistory.surgeries?.length > 0 ? (
                medicalHistory.surgeries.map((surgery, index) => (
                  <li key={index}>{surgery}</li>
                ))
              ) : (
                <li>No surgeries listed</li>
              )}
            </ul>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Health Records
          </h2>
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="p-4 text-left text-gray-700">Title</th>
                    <th className="p-4 text-left text-gray-700">Date</th>
                    <th className="p-4 text-left text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-all">
                        <td className="p-4 border-b text-gray-700">{record.title}</td>
                        <td className="p-4 border-b text-gray-700">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 border-b">
                          <button
                            onClick={() => handleEdit(record.id)}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-700">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Record Form */}
        {isAdding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {newRecord.id ? "Edit Record" : "Add New Record"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={newRecord.title}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="description" className="block text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={newRecord.description}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="date" className="block text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={newRecord.date}
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, date: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="file" className="block text-gray-700 mb-2">
                    File
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={(e) =>
                      setNewRecord({ ...newRecord, file: e.target.files[0] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    {isSubmitting ? "Saving..." : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default PatientHealthRecord;