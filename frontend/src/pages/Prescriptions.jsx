import React, { useState, useEffect } from 'react';
import { 
  FaPrescriptionBottle, 
  FaUserMd,
  FaCalendarAlt,
  FaStethoscope,
  FaExclamationTriangle,
  FaFilePrescription
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import apiService from '../services/apiService';
import { useAuth } from '../context/AuthContext';

const Prescriptions = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        if (!user?._id) {
          throw new Error('User ID not found');
        }

        const response = await apiService.getPatientPrescriptions(user._id);
        setPrescriptions(response.data || []);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to fetch prescriptions');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchPrescriptions();
    }
  }, [user?._id]);

  const handleDownload = async (prescriptionId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/prescriptions/${prescriptionId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription_${prescriptionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Prescription downloaded successfully', {
        icon: '📄',
        style: {
          background: '#10B981',
          color: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription', {
        icon: '❌',
        style: {
          background: '#EF4444',
          color: '#FFFFFF'
        }
      });
    }
  };

  const handleDelete = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
      toast.success('Prescription deleted successfully');
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan pt-28 sm:pt-24 md:pt-28 pb-2 sm:pb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-4 md:px-6">
        <div className="mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center">
            <FaFilePrescription className="text-lg sm:text-xl md:text-2xl text-blue-500" />
            <div>
              <h1 className="text-base sm:text-lg md:text-xl ml-1.5 sm:ml-2 font-bold text-gray-900">Your Prescriptions</h1>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32 sm:h-40 md:h-48">
            <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0">
                <tr>
                  <th className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaUserMd className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 text-blue-500" />
                      <span className="hidden sm:inline">Doctor</span>
                    </div>
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaCalendarAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 text-green-500" />
                      <span className="hidden sm:inline">Date</span>
                    </div>
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaStethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 text-purple-500" />
                      <span className="hidden sm:inline">Diagnosis</span>
                    </div>
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-left text-[11px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 mr-1 sm:mr-1.5 text-yellow-500" />
                      <span className="hidden sm:inline">Symptoms</span>
                    </div>
                  </th>
                  <th className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 text-right text-[11px] sm:text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
                    <td className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 whitespace-nowrap">
                      <div className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-900">
                        Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                      </div>
                      <div className="text-[11px] sm:text-xs md:text-sm text-gray-500">
                        {prescription.doctor?.specialization}
                      </div>
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 whitespace-nowrap text-[11px] sm:text-xs md:text-sm text-gray-500">
                      {formatDate(prescription.createdAt)}
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-[11px] sm:text-xs md:text-sm text-gray-500">
                      {prescription.diagnosis}
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-[11px] sm:text-xs md:text-sm text-gray-500">
                      {prescription.symptoms.join(', ')}
                    </td>
                    <td className="px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 whitespace-nowrap text-right text-[11px] sm:text-xs md:text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-1.5">
                        <button
                          onClick={() => handleDownload(prescription._id)}
                          className="px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 bg-green-500 text-white text-[11px] sm:text-xs md:text-sm rounded hover:bg-green-600"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleDelete(prescription._id)}
                          className="px-1.5 sm:px-2 md:px-2.5 py-0.5 sm:py-1 bg-red-500 text-white text-[11px] sm:text-xs md:text-sm rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 sm:h-40 md:h-48 bg-white rounded-lg shadow-sm">
            <FaPrescriptionBottle className="text-gray-400 text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-2 md:mb-3" />
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-600">No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;