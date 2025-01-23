// src/services/PaymentProcessingService.js

import axios from 'axios';
import { toast } from 'react-toastify'; // Notification library for real-time feedback

// Payment gateway base URLs for integration (replace with real endpoint URLs)
const STRIPE_API_URL = 'https://api.stripe.com/v1/';
const PAYPAL_API_URL = 'https://api.paypal.com/';

const PaymentProcessingService = {

  async processCreditCardPayment(billingInfo) {
    try {
      const response = await axios.post(`${STRIPE_API_URL}charges`, billingInfo);
      toast.success("Payment successful!");
      return response.data;
    } catch (error) {
      toast.error("Payment failed. Please check your details.");
      console.error("Error processing credit card payment:", error);
    }
  },

  async processBankTransfer(billingInfo) {
    try {
      const response = await axios.post(`/api/bank_transfer`, billingInfo);
      toast.success("Bank transfer successful!");
      return response.data;
    } catch (error) {
      toast.error("Bank transfer failed.");
      console.error("Error processing bank transfer:", error);
    }
  },

  async processInsuranceClaim(claimInfo) {
    try {
      const response = await axios.post(`/api/insurance_claim`, claimInfo);
      toast.success("Insurance claim submitted!");
      return response.data;
    } catch (error) {
      toast.error("Insurance claim submission failed.");
      console.error("Error submitting insurance claim:", error);
    }
  },

  async retrievePaymentHistory(userId) {
    try {
      const response = await axios.get(`/api/payment_history/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error retrieving payment history:", error);
      throw new Error("Could not retrieve payment history");
    }
  },
};

export default PaymentProcessingService;
