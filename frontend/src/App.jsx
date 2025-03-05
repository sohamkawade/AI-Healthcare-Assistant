import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Dashboard from './pages/Dashboard';
import Appointment from './pages/Appointment';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import DoctorSignup from './pages/DoctorSignup';
import Profile from './pages/Profile';
import VideoConsultation from './pages/VideoConsultation';
import MedicationReminder from './pages/MedicationReminder';
import ForgotPassword from './components/ForgotPassword';
import PersonalHealthRecord from './pages/PersonalHealthRecord';
import NotificationProvider from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SnackbarProvider } from 'notistack';
import './index.css';

const App = () => {
  return (
    <NotificationProvider>
      <ChatProvider>
        <SnackbarProvider maxSnack={3}>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-grow">
                <MainContent />
              </div>
              <Footer />
            </div>
          </Router>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </SnackbarProvider>
      </ChatProvider>
    </NotificationProvider>
  );
};

const MainContent = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/appointment" element={<Appointment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/doctor-signup" element={<DoctorSignup />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/video-consultation" element={<VideoConsultation />} />
      <Route path="/medication-reminder" element={<MedicationReminder />} />
      <Route path="/personal-health-record" element={<PersonalHealthRecord />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
};

export default App;
