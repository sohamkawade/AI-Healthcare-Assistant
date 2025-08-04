import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaUserMd, FaCalendarAlt, FaClock, FaPills, FaPlus, FaTrash, FaSearch, FaStethoscope } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NewPrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    diagnosis: '',
    symptoms: [''],
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: ''
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/appointments/doctor/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        const appointments = response.data.data;
        const uniquePatients = appointments.reduce((acc, appointment) => {
          const patient = appointment.patientId;
          if (!acc[patient._id]) {
            acc[patient._id] = {
              _id: patient._id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              profilePicture: patient.profilePicture,
              contactNumber: patient.contactNumber,
              lastVisit: appointment.startTime
            };
          }
          return acc;
        }, {});

        setPatients(Object.values(uniquePatients));
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patients');
      }
    };

    fetchPatients();
  }, [user._id]);

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient._id
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...formData.symptoms];
    newSymptoms[index] = value;
    setFormData(prev => ({
      ...prev,
      symptoms: newSymptoms
    }));
  };

  const addSymptom = () => {
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }));
  };

  const removeSymptom = (index) => {
    if (formData.symptoms.length > 1) {
      setFormData(prev => ({
        ...prev,
        symptoms: prev.symptoms.filter((_, i) => i !== index)
      }));
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      medications: newMedications
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.diagnosis || !formData.instructions) {
      toast.error('Please fill in all required fields', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
      return;
    }

    if (formData.symptoms.some(symptom => !symptom.trim())) {
      toast.error('Please fill in all symptoms', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
      return;
    }

    if (formData.medications.some(med => !med.name || !med.dosage || !med.frequency || !med.duration)) {
      toast.error('Please fill in all medication details', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#f44336',
          color: '#fff',
        },
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in again', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#f44336',
            color: '#fff',
          },
        });
        navigate('/login');
        return;
      }

      await axios.post(
        'http://localhost:5001/api/prescriptions',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Prescription created successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#4CAF50',
          color: '#fff',
        },
      });
      navigate('/doctor-prescriptions');
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('You need to be registered as a doctor to create prescriptions. Please complete your doctor registration.', {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#f44336',
            color: '#fff',
          },
        });
        navigate('/doctor-signup');
      } else if (error.response?.status === 401) {
        toast.error('Please log in again', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#f44336',
            color: '#fff',
          },
        });
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create prescription', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#f44336',
            color: '#fff',
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {!selectedPatient ? (
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-4">
                <FaPills className="text-blue-500 text-xl" />
                <h2 className="text-lg font-medium text-gray-900">Write Prescription</h2>
              </div>
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <FaSearch className="absolute right-3 top-3 text-blue-500" />
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {patients
                  .filter(patient => 
                    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(patient => (
                    <div
                      key={patient._id}
                      onClick={() => handlePatientSelect(patient)}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={`http://localhost:5001${patient.profilePicture || '/uploads/default-avatar.png'}`}
                          alt={`${patient.firstName} ${patient.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {patient.contactNumber || 'No contact number'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Patient Info */}
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={`http://localhost:5001${selectedPatient.profilePicture || '/uploads/default-avatar.png'}`}
                      alt={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedPatient.contactNumber || 'No contact number'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Diagnosis */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <FaStethoscope className="text-blue-500" />
                    <span className="text-sm text-gray-600">Diagnosis</span>
                  </div>
                  <input
                    type="text"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter diagnosis"
                    required
                  />
                </div>

                {/* Symptoms */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <span className="text-sm text-gray-600">Symptoms</span>
                    </div>
                    <button
                      type="button"
                      onClick={addSymptom}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.symptoms.map((symptom, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={symptom}
                          onChange={(e) => handleSymptomChange(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter symptom"
                          required
                        />
                        {formData.symptoms.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSymptom(index)}
                            className="text-red-400 hover:text-red-500"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <FaPills className="text-blue-500" />
                      <span className="text-sm text-gray-600">Medications</span>
                    </div>
                    <button
                      type="button"
                      onClick={addMedication}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.medications.map((medication, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-500">#{index + 1}</span>
                          {formData.medications.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedication(index)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="Medicine name"
                            required
                          />
                          <input
                            type="text"
                            value={medication.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="e.g., 500mg"
                            required
                          />
                          <input
                            type="text"
                            value={medication.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="e.g., Once daily"
                            required
                          />
                          <input
                            type="text"
                            value={medication.duration}
                            onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                            placeholder="e.g., 7 days"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <FaClock className="text-blue-500" />
                    <span className="text-sm text-gray-600">Instructions</span>
                  </div>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows="2"
                    placeholder="Enter instructions"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Prescription'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPrescription;