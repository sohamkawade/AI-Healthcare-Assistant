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

  addRecord: async (title, description, date, file, patientId) => {
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("date", date);
      formData.append("file", file);
      formData.append("patientId", patientId);

      const response = await axios.post(`${API_BASE_URL}/records`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data", // Required for file uploads
        },
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error adding record";
      throw new Error(errorMessage);
    }
  },

  getPatientRecords: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/${patientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error retrieving records";
      throw new Error(errorMessage);
    }
  },

  deleteRecord: async (recordId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/records/${recordId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error deleting record";
      throw new Error(errorMessage);
    }
  },

  // Forgot Password API
  forgotPassword: async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error sending reset link";
      throw new Error(errorMessage);
    }
  },

  // Reset Password API
  resetPassword: async (token, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password: newPassword,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error resetting password";
      throw new Error(errorMessage);
    }
  },

  bookAppointment: async (appointmentData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/appointments/book`,
        appointmentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to book appointment.'
      );
    }
  },

  // Get appointments for a specific doctor
  getAppointmentsByDoctorId: async (docId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/appointments/doctor/${docId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch appointments.'
      );
    }
  },

  // Cancel an appointment
  cancelAppointment: async (docId, appointmentId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
        { docId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to cancel appointment.'
      );
    }
  },

  // Mark an appointment as complete
  completeAppointment: async (docId, appointmentId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.put(
        `${API_BASE_URL}/appointments/${appointmentId}/complete`,
        { docId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to complete appointment.'
      );
    }
  },
};

export default apiService;
