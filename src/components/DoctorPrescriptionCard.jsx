import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail } from 'lucide-react';
import apiService from '../services/apiService';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function DoctorPrescriptionCard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const data = await apiService.getDoctorPrescriptions();
      setPrescriptions(data);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Prescriptions</h2>
          <Link
            to="/new-prescription"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Prescription
          </Link>
        </div>

        {prescriptions.length === 0 ? (
          <p className="text-gray-500 text-sm">No prescriptions found.</p>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div key={prescription._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-800">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-medium">{prescription.patientName}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{prescription.patientEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(prescription.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{prescription.time}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Medications:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {prescription.medications.map((med, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h4>
                    <p className="text-sm text-gray-600">{prescription.instructions}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 