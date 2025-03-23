import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaClock, FaSort, FaSortUp, FaSortDown, FaChevronDown, FaPhone } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';

const Patients = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('lastVisit');
  const [sortOrder, setSortOrder] = useState('desc');
  const [timePeriod, setTimePeriod] = useState('all');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const timeOptions = [
    { value: 'all', label: 'All Time' },
    { value: '1month', label: 'Last Month' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' }
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
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
              lastVisit: appointment.startTime,
              visitCount: 1
            };
          } else {
            acc[patient._id].visitCount++;
            if (new Date(appointment.startTime) > new Date(acc[patient._id].lastVisit)) {
              acc[patient._id].lastVisit = appointment.startTime;
            }
          }
          return acc;
        }, {});

        setPatients(Object.values(uniquePatients));
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user._id]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortBy === 'lastVisit') {
      return sortOrder === 'asc' 
        ? new Date(a.lastVisit) - new Date(b.lastVisit)
        : new Date(b.lastVisit) - new Date(a.lastVisit);
    }
    return sortOrder === 'asc'
      ? a.visitCount - b.visitCount
      : b.visitCount - a.visitCount;
  });

  const handlePatientClick = (patient) => {
    if (location.state?.from === 'write-prescription') {
        navigate('/new-prescription', { 
          state: { 
          patientId: patient._id,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctorId: location.state.doctorId,
          doctorName: location.state.doctorName,
          specialization: location.state.specialization
        }
      });
    } else {
      navigate(`/patient-records`);
    }
  };

  const fetchPrescriptions = async (patientId) => {
    try {
      const response = await apiService.getPatientPrescriptions(patientId);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <div className="relative">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
            >
              {timeOptions.find(opt => opt.value === timePeriod)?.label}
              <FaChevronDown className="ml-2 text-gray-400" />
            </button>
            {showTimeDropdown && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                {timeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setTimePeriod(option.value);
                      setShowTimeDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm ${
                      timePeriod === option.value
                        ? 'text-gray-900 bg-gray-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : patients.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="col-span-4">
                <div className="flex items-center space-x-3">
                  <FaUserMd className="text-blue-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Patient Name</span>
                    </div>
                  </div>
              <div className="col-span-3">
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-green-500" />
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">Phone</span>
                </div>
              </div>
              <div className="col-span-3">
                    <button
                  onClick={() => toggleSort('lastVisit')}
                  className="flex items-center text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  <FaCalendarAlt className="mr-1.5 text-purple-500" />
                  Last Visit
                  {sortBy === 'lastVisit' ? (
                    sortOrder === 'asc' ? <FaSortUp className="ml-1 text-purple-500" /> : <FaSortDown className="ml-1 text-purple-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                    </button>
              </div>
              <div className="col-span-2">
                    <button
                  onClick={() => toggleSort('visitCount')}
                  className="flex items-center text-xs font-medium text-gray-600 uppercase tracking-wider hover:text-gray-900"
                >
                  <FaClock className="mr-1.5 text-orange-500" />
                  Visits
                  {sortBy === 'visitCount' ? (
                    sortOrder === 'asc' ? <FaSortUp className="ml-1 text-orange-500" /> : <FaSortDown className="ml-1 text-orange-500" />
                  ) : <FaSort className="ml-1 text-gray-400" />}
                    </button>
                  </div>
                </div>

            {/* List */}
            <div className="divide-y divide-gray-200">
              {sortedPatients.map((patient) => (
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={`http://localhost:5001${patient.profilePicture || '/uploads/default-avatar.png'}`}
                          alt={`${patient.firstName} ${patient.lastName}`}
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="text-base font-medium text-gray-900 block">
                          {patient.firstName} {patient.lastName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-base text-gray-700">
                      {patient.contactNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-base text-gray-700">
                      {formatDate(patient.lastVisit)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-base font-medium text-gray-900">
                      {patient.visitCount}
                    </span>
                  </div>
                </div>
              ))}
              </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-full overflow-hidden mb-4">
              <img
                src="http://localhost:5001/uploads/default-avatar.png"
                alt="No patients"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">No patients found</p>
            <p className="text-xs text-gray-500">
              Patients will appear here when they schedule appointments with you
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients; 