import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Aichat from './pages/Aichat';
import DoctorSignup from './pages/DoctorSignup';
import Profile from './pages/Profile';
import VideoConsultation from './pages/VideoConsultation';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PersonalHealthRecord from './pages/PersonalHealthRecord';
import NewPrescription from './pages/NewPrescription';
import Prescriptions from './pages/Prescriptions';
import DoctorPrescriptions from './pages/DoctorPrescriptions';
import Patients from './pages/Patients';
import NotificationProvider from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Toaster position="top-center" />
              <Navbar />
              <div className="flex-grow">
                <MainContent />
              </div>
              <Footer />
            </div>
          </Router>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

const MainContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/appointment"
        element={
          <PrivateRoute>
            <Appointment />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/doctor-signup" element={<DoctorSignup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/video-consultation" element={<VideoConsultation />} />
      <Route path="/personal-health-record" element={<PersonalHealthRecord />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/aichat" element={<Aichat />} />
      <Route path="/new-prescription" element={<NewPrescription />} />
      <Route path="/prescriptions" element={<Prescriptions />} />
      <Route path="/doctor-prescriptions" element={<DoctorPrescriptions />} />
      <Route path="/patients" element={<Patients />} />
    </Routes>
  );
};

export default App;
