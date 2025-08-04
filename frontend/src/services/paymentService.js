import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const paymentService = {
    // Initialize payment for an appointment
    initiatePayment: async (appointmentId, paymentMethod) => {
        try {
            const response = await axios.post(`${API_URL}/payments/initiate`, {
                appointmentId,
                paymentMethod
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get payment details
    getPaymentDetails: async (paymentId) => {
        try {
            const response = await axios.get(`${API_URL}/payments/${paymentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Process refund
    processRefund: async (paymentId, reason) => {
        try {
            const response = await axios.post(`${API_URL}/payments/${paymentId}/refund`, {
                reason
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get patient payment history
    getPatientPaymentHistory: async (patientId) => {
        try {
            const response = await axios.get(`${API_URL}/payments/patient/${patientId}/history`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default paymentService; 