import React, { createContext, useState } from 'react';

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [billingInfo, setBillingInfo] = useState({
        name: '',
        address: '',
        contact: '',
        insuranceProvider: '',
        invoiceDate: '',
        invoiceNumber: '',
        amountDue: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to initiate payment processing
    const processPayment = async (paymentData) => {
        setLoading(true);
        setError(null);
        try {
            // Simulate an API call for payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setPaymentStatus('success');
        } catch (error) {
            setPaymentStatus('failed');
            setError('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to update billing information
    const updateBillingInfo = (newBillingInfo) => {
        setBillingInfo((prevInfo) => ({ ...prevInfo, ...newBillingInfo }));
    };

    return (
        <PaymentContext.Provider value={{
            paymentStatus,
            setPaymentStatus,
            billingInfo,
            updateBillingInfo,
            processPayment,
            loading,
            error,
        }}>
            {children}
        </PaymentContext.Provider>
    );
};
