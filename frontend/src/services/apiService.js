import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const API_BASE_URL = "http://localhost:5001/api";

const apiService = {
  baseHeaders: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  axiosConfig: {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },

  handleRequest: async (request, headers = {}) => {
    try {
      const response = await request({
        ...apiService.axiosConfig,
        headers: { ...apiService.baseHeaders, ...headers }
      });
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

  getDoctors: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/doctors`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch doctors');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch doctors');
    }
  },

  login: async (email, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response?.data?.success && response?.data?.data?.token) {
        const token = response.data.data.token;
        const decodedToken = jwtDecode(token);
        
        // Set user data from decoded token
        const userData = {
          id: decodedToken.id,
          email: decodedToken.email,
          specialization: decodedToken.specialization,
          role: decodedToken.specialization ? 'doctor' : 'patient'
        };

        // Update response data with user info
        response.data.data.user = {
          ...response.data.data.user,
          ...userData
        };
        
        return response.data;
      }
      throw new Error(response?.data?.message || 'Login failed. No token received.');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
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

  updateProfile: async (formData) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      // Make sure to have proper Content-Type
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
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
      throw new Error(
        error.response?.data?.message || 'Failed to book appointment.'
      );
    }
  },

  // Get appointments for a specific doctor
  getAppointmentsByDoctorId: async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get appointments for a patient
  getAppointmentsByPatientId: async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/appointments/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get a doctor's patients
  getDoctorPatients: async (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/patients/doctor/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patients.');
    }
  },

  // Get prescriptions for a patient
  getPatientPrescriptions: async (patientId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/prescriptions/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch prescriptions.'
      );
    }
  },

  // Get prescriptions for a doctor
  getDoctorPrescriptions: async (doctorId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token provided. Please log in again.');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/prescriptions/doctor/${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch prescriptions.'
      );
    }
  },
};

export default apiService;
