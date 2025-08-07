import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaEye, 
  FaTrash, 
  FaUserInjured, 
  FaStethoscope, 
  FaCalendarAlt,
  FaFilePrescription,
  FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DoctorPrescriptions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication required');
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/api/prescriptions/doctor`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          setPrescriptions(response.data.data);
        } else {
          setPrescriptions([]);
          toast.error(response.data.message || 'No prescriptions found');
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          navigate('/login');
        } else if (error.response?.status === 403) {
          toast.error('Access denied. Only doctors can view prescriptions');
          navigate('/dashboard');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
        }
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user?._id, navigate]);

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/prescriptions/${prescriptionId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded successfully', {
        style: {
          background: '#22C55E',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '12px 24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      });
    } catch (error) {
      toast.error('Failed to download prescription', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '12px 24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      });
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5001/api/prescriptions/${prescriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
        toast.success('Prescription deleted successfully', {
          style: {
            background: '#22C55E',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        });
      }
    } catch (error) {
      toast.error('Failed to delete prescription', {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '12px 24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const sortedPrescriptions = [...prescriptions].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPrescription(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan py-8 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 md:pt-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
          <div className="flex items-center space-x-3">
            <FaFilePrescription className="text-2xl sm:text-3xl text-blue-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Patient Prescriptions</h1>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm sm:text-base"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Desktop and Tablet View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FaUserInjured className="text-blue-500" />
                        <span>Patient</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FaStethoscope className="text-green-500" />
                        <span>Diagnosis</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center space-x-2">
                        <FaCalendarAlt className="text-purple-500" />
                        <span>Created</span>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedPrescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {prescription.patient.firstName} {prescription.patient.lastName}
                        <div className="text-sm text-gray-500">{prescription.patient.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="line-clamp-2">{prescription.diagnosis}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(prescription.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(prescription)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
                          >
                            <FaEye className="mr-1" /> View
                          </button>
                          <button
                            onClick={() => handleDelete(prescription._id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden p-4 space-y-4">
              {sortedPrescriptions.map((prescription) => (
                <div key={prescription._id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                       <FaUserInjured className="text-blue-500 text-lg" />
                      <h3 className="text-base font-semibold text-gray-900">Patient: {prescription.patient.firstName} {prescription.patient.lastName}</h3>
                    </div>
                    <p className="text-sm text-gray-600 pl-6">Email: {prescription.patient.email}</p>
                  </div>
                  
                  <div className="mb-3">
                     <div className="flex items-center space-x-2 mb-1">
                       <FaStethoscope className="text-green-500 text-lg" />
                       <h3 className="text-base font-semibold text-gray-900">Diagnosis:</h3>
                     </div>
                    <p className="text-sm text-gray-700 pl-6 break-words">{prescription.diagnosis}</p>
                  </div>

                   <div className="mb-4">
                     <div className="flex items-center space-x-2 mb-1">
                        <FaCalendarAlt className="text-purple-500 text-lg"/>
                        <h3 className="text-base font-semibold text-gray-900">Created On:</h3>
                     </div>
                    <p className="text-sm text-gray-700 pl-6">{formatDate(prescription.createdAt)}</p>
                  </div>

                  <div className="flex justify-around space-x-2">
                    <button
                      onClick={() => handleView(prescription)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none flex-grow justify-center"
                    >
                      <FaEye className="mr-1" /> View
                    </button>
                    <button
                      onClick={() => handleDelete(prescription._id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none flex-grow justify-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <FaFilePrescription className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">No prescriptions found</p>
            <button
              onClick={() => navigate('/new-prescription')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Create New Prescription
            </button>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {showModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg font-bold text-gray-900">Prescription Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {/* Patient Information */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-4 py-2 text-xs font-semibold text-gray-700 sm:px-6 sm:py-2.5">
                        Patient Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-gray-500 w-1/3 sm:px-6 sm:py-2.5">Patient Name</td>
                      <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">
                        {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Email</td>
                      <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{selectedPrescription.patient.email}</td>
                    </tr>

                    {/* Medical Information */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-4 py-2 text-xs font-semibold text-gray-700 sm:px-6 sm:py-2.5">
                        Medical Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Diagnosis</td>
                      <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{selectedPrescription.diagnosis}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Symptoms</td>
                      <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">
                        <ul className="list-disc list-inside space-y-1">
                          {selectedPrescription.symptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Medications */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-4 py-2 text-xs font-semibold text-gray-700 sm:px-6 sm:py-2.5">
                        Medications
                      </td>
                    </tr>
                    {selectedPrescription.medications.map((med, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Medicine {index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">
                            <span className="font-medium">{med.name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Dosage</td>
                          <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{med.dosage}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Frequency</td>
                          <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{med.frequency}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Duration</td>
                          <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{med.duration}</td>
                        </tr>
                      </React.Fragment>
                    ))}

                    <tr>
                      <td className="px-4 py-2 text-sm font-medium text-gray-500 sm:px-6 sm:py-2.5">Created On</td>
                      <td className="px-4 py-2 text-sm text-gray-900 sm:px-6 sm:py-2.5">{formatDate(selectedPrescription.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
             <div className="flex justify-center p-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => handleDownload(selectedPrescription._id)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;