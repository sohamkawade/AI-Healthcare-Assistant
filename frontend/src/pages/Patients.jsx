import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserMd, FaCalendarAlt, FaClock, FaSort, FaSortUp, FaSortDown, FaChevronDown, FaPhone, FaHospitalUser } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Patients = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user?._id) return;

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
              lastVisit: appointment.slotDate,
              visitCount: 1
            };
          } else {
            acc[patient._id].visitCount++;
            const currentDate = new Date(appointment.slotDate);
            const lastVisitDate = new Date(acc[patient._id].lastVisit);
            if (currentDate > lastVisitDate) {
              acc[patient._id].lastVisit = appointment.slotDate;
            }
          }
          return acc;
        }, {});

        setPatients(Object.values(uniquePatients));
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to fetch patients', {
          style: {
            background: '#EF4444',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px 24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user?._id]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No visits yet';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';

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
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const sortedPatients = [...patients].sort((a, b) => {
    if (sortBy === 'lastVisit') {
      const dateA = a.lastVisit ? new Date(a.lastVisit) : new Date(0);
      const dateB = b.lastVisit ? new Date(b.lastVisit) : new Date(0);
      return sortOrder === 'asc' 
        ? dateA - dateB
        : dateB - dateA;
    }
    return sortOrder === 'asc'
      ? a.visitCount - b.visitCount
      : b.visitCount - a.visitCount;
  });


  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan">
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-600">Please log in to view your patients.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan py-6 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm w-full sm:w-auto justify-center sm:justify-start"
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
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200">
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
            <div className="divide-y divide-gray-200 overflow-x-auto">
              {sortedPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 transition-colors items-center"
                >
                  <div className="col-span-1 md:col-span-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                        <img
                          src={`http://localhost:5001${patient.profilePicture || '/uploads/default-avatar.png'}`}
                          alt={`${patient.firstName} ${patient.lastName}`}
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-900 block">
                          {patient.firstName} {patient.lastName}
                        </span>
                         <span className="md:hidden text-xs text-gray-600 block mt-0.5">
                          <FaPhone className="inline mr-1"/>{patient.contactNumber || 'N/A'}
                         </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex col-span-3 items-center">
                    <span className="text-sm text-gray-700">
                      {patient.contactNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex items-center">
                    <span className="text-sm text-gray-700">
                      <span className="md:hidden font-medium">Last Visit: </span>{formatDate(patient.lastVisit)}
                    </span>
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      <span className="md:hidden font-medium">Visits: </span>{patient.visitCount}
                    </span>
                  </div>
                </div>
              ))
              }
              </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-12 h-12 rounded-full overflow-hidden mb-4">
            </div>
            <FaHospitalUser className="text-gray-400 text-4xl mb-4" />
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