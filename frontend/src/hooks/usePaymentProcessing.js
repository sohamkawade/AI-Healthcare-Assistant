import { useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';

export const usePaymentProcessing = () => {
    const {
        paymentStatus,
        setPaymentStatus,
        billingInfo,
        updateBillingInfo,
        processPayment,
        loading,
        error,
    } = useContext(PaymentContext);

    return {
        paymentStatus,
        setPaymentStatus,
        billingInfo,
        updateBillingInfo,
        processPayment,
        loading,
        error,
    };
};
