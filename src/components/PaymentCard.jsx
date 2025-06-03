import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import moment from 'moment';

const PaymentCard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5001/api/appointments/payment-history', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setPayments(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch payment information');
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalAmount = payments.reduce((sum, payment) => {
    return payment.paymentStatus === 'paid' ? sum + payment.amount : sum;
  }, 0);

  const totalRefunded = payments.reduce((sum, payment) => {
    return payment.paymentStatus === 'refunded' ? sum + payment.amount : sum;
  }, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaMoneyBillWave className="text-purple-600" />
          {user.role === 'doctor' ? 'Received Payments' : 'Payment History'}
        </h2>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Received</p>
            <p className="text-xl font-bold text-green-600">₹{totalAmount}</p>
          </div>
          {totalRefunded > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-xl font-bold text-red-600">₹{totalRefunded}</p>
            </div>
          )}
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No payment information found
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.appointmentId} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">
                    {user.role === 'doctor' ? payment.patientName : payment.doctorName}
                  </h3>
                  <p className="text-gray-600">
                    {user.role === 'doctor' ? 'Patient' : payment.doctorSpecialization}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    payment.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.paymentStatus === 'paid' ? 'Paid' : 'Refunded'}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ₹{payment.amount}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium">Appointment Date</p>
                  <p>{moment(payment.appointmentDate).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="font-medium">Payment Date</p>
                  <p>{moment(payment.paymentDate).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="font-medium">Consultation Type</p>
                  <p className="capitalize">{payment.consultationType}</p>
                </div>
                <div>
                  <p className="font-medium">Payment Method</p>
                  <p className="capitalize">{payment.paymentMethod}</p>
                </div>
              </div>

              {payment.paymentStatus === 'refunded' && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Refund Reason:</span> {payment.refundReason}
                  </p>
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Refund Date:</span> {moment(payment.refundDate).format('MMMM D, YYYY')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentCard; 