import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const API_BASE_URL = "http://localhost:5001/api";
const apiService = {
  baseHeaders: { 'Content-Type': 'application/json' },

  handleRequest: async (request, headers = {}) => {
    try {
      const response = await request(headers);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
      console.error('Error:', errorMessage);
      throw new Error(errorMessage);
    }
  },


  registerPatient: async (formData) => {
    return await apiService.handleRequest(
      (headers) =>
        axios.post(`${API_BASE_URL}/auth/register-patient`, formData, {
          headers: { ...apiService.baseHeaders, ...headers },
        })
    );
  },

  registerDoctor: async (formData) => {
    return await apiService.handleRequest(
      (headers) =>
        axios.post(`${API_BASE_URL}/auth/register-doctor`, formData, {
          headers: { ...apiService.baseHeaders, ...headers },
        })
    );
  },

  login: async (email, password) => {
    const response = await apiService.handleRequest(
      (headers) =>
        axios.post(
          `${API_BASE_URL}/auth/login`,
          { email, password },
          {
            headers: { ...apiService.baseHeaders, ...headers },
          }
        )
    );

    const { token } = response.data;
    if (token) {
      localStorage.setItem('token', token);
      return token;
    }
    throw new Error('Login failed. No token received.');
  },

  getProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.userId;

    if (decodedToken.exp < Date.now() / 1000) {
      const tokenRefreshed = await apiService.refreshToken();
      if (!tokenRefreshed) throw new Error('Session expired. Please log in again.');
    }

    return await apiService.handleRequest(
      () =>
        axios.get(`${API_BASE_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId },
        })
    );
  },

  getDoctors: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token provided. Please log in again.');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  },

  getPatientById: async (patientId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new Error('Invalid patient ID format');
      }

      const response = await axios.get(`${API_BASE_URL}/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error.message);
      throw new Error(error.response ? error.response.data.message : error.message);
    }
  },

  getAvailableTimeSlots: async (doctorId, date) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication failed. Please log in again.');

    try {
      // Validate doctorId
      if (!/^[a-f\d]{24}$/i.test(doctorId)) {
        throw new Error('Invalid doctor ID format. Ensure it is a valid ObjectId.');
      }

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error('Invalid date format. Please use YYYY-MM-DD.');
      }

      // Adjusted endpoint URL based on your backend
      const response = await axios.get(`${API_BASE_URL}/appointments/available-time-slots`, {
        params: { doctorId, date },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('API Response:', response.data);

      const availableTimeSlots = response.data.availableTimeSlots || [];
      if (availableTimeSlots.length > 0) {
        console.log('Available Time Slots:');
        availableTimeSlots.forEach((slot) => {
          const formattedDate = new Date(slot.date).toLocaleDateString('en-US');
          console.log(`- ${formattedDate}: ${slot.startTime} to ${slot.endTime}`);
        });
      } else {
        console.log('No available time slots for the selected doctor and date.');
      }

      return availableTimeSlots;
    } catch (error) {
      console.error('Error fetching time slots:', error.message);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      throw new Error(
        error.response?.data?.message || 'Failed to fetch time slots. Please try again.'
      );
    }
  },

  addTimeSlots: async (timeSlots) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication failed. Please log in again.');

    try {
      // API request to add predefined time slots
      const response = await axios.post(
        `${API_BASE_URL}/time-slots/add-time-slots`,
        { timeSlots },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Time slots added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding time slots:', error.message);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      throw new Error(
        error.response?.data?.message || 'Failed to add time slots. Please try again.'
      );
    }
  },


  scheduleAppointment: async (appointmentDetails) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication failed. Please log in again.');

    try {
      // Input validation
      if (!appointmentDetails || typeof appointmentDetails !== 'object') {
        throw new Error('Invalid appointment details provided.');
      }

      // API request to schedule appointment
      const response = await axios.post(
        `${API_BASE_URL}/appointment/schedule`,
        appointmentDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Appointment scheduled successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error scheduling appointment:', error.message);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      throw new Error(
        error.response?.data?.message || 'Failed to schedule appointment. Please try again.'
      );
    }
  },

  getPatientAppointments: async (patientId) => {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token provided. Please log in again.');
    }

    if (!patientId) {
      throw new Error('Invalid Patient ID. Please check and try again.');
    }

    try {
      const response = await apiService.handleRequest(() =>
        axios.get(`${API_BASE_URL}/appointment/patient?patientId=${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw new Error('Failed to fetch patient appointments. Please try again later.');
    }
  },

  getDoctorAppointments: async (doctorId) => {

    if (!doctorId || typeof doctorId !== 'string' || doctorId.trim() === '') {
      throw new Error("Invalid Doctor ID format. doctorId should be a non-empty string.");
    }

    try {
      console.log("Fetching appointments for doctor with ID:", doctorId);

      const response = await axios.get(
        `${API_BASE_URL}/appointment/doctor?doctorId=${doctorId}`
      );

      console.log("API Response:", response.data);

      return response.data;
    } catch (error) {
      console.error("API request failed:", error.message);
      throw error;
    }
  },

  createContactMessage: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contact`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error.response?.data || 'Error sending message');
      throw error;
    }
  },

  createReminder: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/reminders`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error.response?.data || 'Error creating reminder');
      throw error;
    }
  },

  getReminders: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reminders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error.response?.data || 'Error fetching reminders');
      throw error;
    }
  },

  deleteReminder: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/reminders/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {

      const errorMessage = error.response?.data?.message || error.message || 'Error deleting reminder';
      throw new Error(errorMessage);
    }
  },

  saveSleepData: async (sleepData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trackSleepData`,
        sleepData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting sleep data';
      throw new Error(errorMessage);
    }
  },

  saveNutritionData: async (nutritionData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trackNutritionData`,
        nutritionData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting nutrition data';
      throw new Error(errorMessage);
    }
  },

  saveMentalHealthData: async (mentalHealthData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trackMentalHealthData`,
        mentalHealthData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting mental health data';
      throw new Error(errorMessage);
    }
  },

  saveExerciseData: async (exerciseData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/trackExerciseData`,
        exerciseData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error submitting exercise data';
      throw new Error(errorMessage);
    }
  },

  getHealthData: async (userId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/healthData/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Error retrieving health data';
      throw new Error(errorMessage);
    }
  }

};


export default apiService;
