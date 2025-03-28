import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FaEye, 
  FaTrash, 
  FaUserMd, 
  FaUserInjured, 
  FaStethoscope, 
  FaCalendarAlt,
  FaFilePrescription,
  FaSort,
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
    <div className="min-h-screen  bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan  py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <FaFilePrescription className="text-3xl text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">My Patient Prescriptions</h1>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prescription.patient.firstName} {prescription.patient.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{prescription.patient.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{prescription.diagnosis}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(prescription.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(prescription)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none mr-3"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleDelete(prescription._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="bg-white rounded-lg w-full max-w-xl">
            <div className="p-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-base font-bold text-gray-900">Prescription Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Patient Information */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-2 py-1.5 text-xs font-semibold text-gray-700">
                        Patient Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-500 w-1/3">Patient Name</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">
                        {selectedPrescription.patient.firstName} {selectedPrescription.patient.lastName}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Email</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">{selectedPrescription.patient.email}</td>
                    </tr>

                    {/* Medical Information */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-2 py-1.5 text-xs font-semibold text-gray-700">
                        Medical Information
                      </td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Diagnosis</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">{selectedPrescription.diagnosis}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Symptoms</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">
                        <ul className="list-disc list-inside">
                          {selectedPrescription.symptoms.map((symptom, index) => (
                            <li key={index}>{symptom}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>

                    {/* Medications */}
                    <tr className="bg-gray-50">
                      <td colSpan="2" className="px-2 py-1.5 text-xs font-semibold text-gray-700">
                        Medications
                      </td>
                    </tr>
                    {selectedPrescription.medications.map((med, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Medicine {index + 1}</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">
                            <span className="font-medium">{med.name}</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Dosage</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">{med.dosage}</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Frequency</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">{med.frequency}</td>
                        </tr>
                        <tr>
                          <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Duration</td>
                          <td className="px-2 py-1.5 text-xs text-gray-900">{med.duration}</td>
                        </tr>
                      </React.Fragment>
                    ))}

                    <tr>
                      <td className="px-2 py-1.5 text-xs font-medium text-gray-500">Created On</td>
                      <td className="px-2 py-1.5 text-xs text-gray-900">{formatDate(selectedPrescription.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;