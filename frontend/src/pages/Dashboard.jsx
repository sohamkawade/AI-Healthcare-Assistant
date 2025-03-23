import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import axios from "axios";
import { User } from "lucide-react";
import {
  FaCalendarAlt,
  FaClock,
  FaTimes,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCheck,
  FaVideo,
  FaStethoscope,
  FaUser,
  FaChartLine,
  FaNotesMedical,
  FaFileMedicalAlt,
  FaCalendarPlus,
  FaSearch,
  FaFilter,
  FaSort,
  FaUserMd,
  FaUserInjured,
  FaPills,
  FaHeartbeat,
  FaThermometerHalf,
  FaWeight,
  FaTint,
  FaPrescriptionBottleAlt,
  FaChevronDown,
  FaHospitalUser,
  FaClipboardList,
  FaFileAlt,
  FaCalendarCheck,
  FaRobot,
  FaExternalLinkAlt,
  FaCreditCard,
  FaMoneyBillWave,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { Toaster, toast } from "react-hot-toast";
import apiService from "../services/apiService";

const API_BASE_URL = "http://localhost:5001/api";

const Dashboard = () => {
  const { user, role, loading: authLoading, setRole, setUser } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [patientCount, setPatientCount] = useState(0);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [quickActionsLoading, setQuickActionsLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check authentication and role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));

        if (!user) {
          setUser({
            _id: decodedToken.id,
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            email: decodedToken.email,
            specialization: decodedToken.specialization,
          });
        }

        const userRole = decodedToken.specialization ? "doctor" : "patient";
        localStorage.setItem("role", userRole);
        setRole(userRole);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/login");
      }
    };

    if (!role || !user) {
      checkAuth();
    }
  }, [navigate, role, setRole, user, setUser]);

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    if (!user?._id || !role) {
      return;
    }

    try {
      setLoading(true);

      // Get saved appointments from localStorage first
      const savedAppointmentsStr = localStorage.getItem("appointments");
      let savedAppointments = [];
      if (savedAppointmentsStr) {
        try {
          const { data } = JSON.parse(savedAppointmentsStr);
          savedAppointments = data;
        } catch (error) {
          console.error("Error parsing saved appointments:", error);
        }
      }

      // Fetch fresh appointments from API
      const response =
        role === "doctor"
          ? await apiService.getAppointmentsByDoctorId(user._id)
          : await apiService.getAppointmentsByPatientId(user._id);

      if (response.success && response.data) {
        // Create a map of API appointments for easy lookup
        const apiAppointments = new Map(
          response.data.map((apt) => [apt._id, apt])
        );

        // Create a map of saved appointments for merging
        const savedAppointmentsMap = new Map(
          savedAppointments.map((apt) => [apt._id, apt])
        );

        // Merge appointments, prioritizing saved version for cancelled appointments
        const allAppointments = response.data.map((apiApt) => {
          const savedApt = savedAppointmentsMap.get(apiApt._id);

          // If either version is cancelled, use the cancelled version
          if (
            (savedApt && savedApt.status === "cancelled") ||
            apiApt.status === "cancelled"
          ) {
            const cancelledApt =
              savedApt?.status === "cancelled" ? savedApt : apiApt;

            return {
              ...apiApt,
              status: "cancelled",
              cancelledAt: cancelledApt.cancelledAt || cancelledApt.updatedAt,
              cancelledBy: cancelledApt.cancelledBy,
              cancelledById: cancelledApt.cancelledById,
              cancellerName: cancelledApt.cancellerName,
              docId: {
                ...apiApt.docId,
                _id: apiApt.docId._id,
                firstName: apiApt.docId.firstName,
                lastName: apiApt.docId.lastName,
              },
              patientId: {
                ...apiApt.patientId,
                _id: apiApt.patientId._id,
                firstName: apiApt.patientId.firstName,
                lastName: apiApt.patientId.lastName,
              },
            };
          }

          // For non-cancelled appointments, use API version
          return apiApt;
        });

        // Add any saved cancelled appointments that aren't in the API response
        savedAppointments.forEach((savedApt) => {
          if (
            !apiAppointments.has(savedApt._id) &&
            savedApt.status === "cancelled"
          ) {
            // For doctors, only add appointments where they are the doctor
            if (role === "doctor" && savedApt.docId?._id !== user._id) {
              return;
            }
            // For patients, only add their own appointments
            if (role === "patient" && savedApt.patientId?._id !== user._id) {
              return;
            }

            allAppointments.push(savedApt);
          }
        });

        // Process all appointments to ensure they have complete information
        const processedAppointments = allAppointments.map((appointment) => {
          // For cancelled appointments, ensure we have all necessary information
          if (appointment.status === "cancelled") {
          }

          return {
            ...appointment,
            status: appointment.status || "pending",
            cancelledAt: appointment.cancelledAt || null,
            cancelledBy: appointment.cancelledBy || null,
            cancelledById: appointment.cancelledById || null,
            cancellerName: appointment.cancellerName || null,
            docId: {
              ...appointment.docId,
              _id: appointment.docId?._id,
              firstName: appointment.docId?.firstName || "",
              lastName: appointment.docId?.lastName || "",
            },
            patientId: {
              ...appointment.patientId,
              _id: appointment.patientId?._id,
              firstName: appointment.patientId?.firstName || "",
              lastName: appointment.patientId?.lastName || "",
            },
          };
        });

        // Store processed appointments in localStorage with timestamp
        const storageData = {
          data: processedAppointments,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("appointments", JSON.stringify(storageData));

        setAppointments(processedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointments([]);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user?._id, role]);

  // Load appointments from localStorage on component mount
  useEffect(() => {
    const loadSavedAppointments = () => {
      const savedAppointments = localStorage.getItem("appointments");
      if (savedAppointments) {
        try {
          const { data, timestamp } = JSON.parse(savedAppointments);
          const savedTime = new Date(timestamp);
          const now = new Date();
          const timeDiff = now.getTime() - savedTime.getTime();
          const hoursDiff = timeDiff / (1000 * 60 * 60);


          // Only use saved appointments if they're less than 24 hours old
          if (timeDiff < 24 * 60 * 60 * 1000) {
 
            setAppointments(data);
          } else {
  
            localStorage.removeItem("appointments");
          }
        } catch (error) {
          console.error("Error parsing saved appointments:", error);
        }
      } else {
      }
    };

    loadSavedAppointments();
  }, []);

  // Update the useEffect for fetching appointments
  useEffect(() => {
    if (!authLoading && user?._id && role) {
      fetchAppointments();
      // Set up an interval to refresh appointments every minute
      const interval = setInterval(fetchAppointments, 60000);
      return () => clearInterval(interval);
    }
  }, [authLoading, user?._id, role, fetchAppointments]);

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const savedNotifications = localStorage.getItem("notifications");
      if (savedNotifications) {
        const parsedNotifications = JSON.parse(savedNotifications);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const recentNotifications = parsedNotifications.filter(
          (notification) => {
            const notificationDate = new Date(notification.timestamp);
            return notificationDate >= oneDayAgo;
          }
        );

        localStorage.setItem(
          "notifications",
          JSON.stringify(recentNotifications)
        );
        setNotifications(recentNotifications);
      }
    };

    loadNotifications();
  }, []);

  // Quick actions data fetching
  useEffect(() => {
    const fetchQuickActionsData = async () => {
      if (!user?._id || !role) return;

      try {
        setQuickActionsLoading(true);
        const token = localStorage.getItem("token");

        if (role === "doctor") {
          const [patientResponse, prescriptionResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/patients/count/${user._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${API_BASE_URL}/prescriptions/doctor`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          setPatientCount(patientResponse.data.count || 0);
        } else if (role === "patient") {
          const prescriptionResponse = await axios.get(
            `${API_BASE_URL}/prescriptions/patient/${user._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        }
      } catch (error) {
        console.error("Error fetching quick actions data:", error);
        toast.error("Failed to fetch data");
      } finally {
        setQuickActionsLoading(false);
      }
    };

    fetchQuickActionsData();
  }, [user, role]);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to update notification");
    }
  };

  const checkAppointmentStatus = (appointment) => {
    const appointmentDateTime = new Date(appointment.startTime);
    const [hours, minutes] = appointment.appointmentTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const timeDifference = now - appointmentDateTime;
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    return {
      isPast: timeDifference > 0,
      isWithinCompletionWindow:
        minutesDifference >= 0 && minutesDifference <= 60,
      isFuture: timeDifference < 0,
      minutesDifference: minutesDifference,
    };
  };

  // Update the canComplete function for doctors
  const canComplete = (appointment) => {
    if (!appointment || role !== "doctor") return false;

    // Check if appointment is confirmed
    if (appointment.status !== "confirmed") return false;

    // Calculate time difference
    const appointmentDateTime = new Date(appointment.slotDate);
    const [hours, minutes] = appointment.slotTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const timeDiffMinutes = (now - appointmentDateTime) / (1000 * 60);

    // Enable complete button only after 15 minutes from appointment time
    return timeDiffMinutes >= 15;
  };

  const shouldShowCompleteButton = (appointment) => {
    return (
      role === "doctor" &&
      (appointment.status === "confirmed" || appointment.status === "pending")
    );
  };

  const getCompleteButtonTooltip = (appointment) => {
    if (!appointment || role !== "doctor") return "";

    if (appointment.status === "pending") {
      return "Appointment must be confirmed before completion";
    }

    const appointmentDateTime = new Date(appointment.slotDate);
    const [hours, minutes] = appointment.slotTime.split(":");
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

    const now = new Date();
    const timeDiffMinutes = (now - appointmentDateTime) / (1000 * 60);

    if (timeDiffMinutes < 0) {
      return "Cannot complete appointment before scheduled time";
    } else if (timeDiffMinutes < 15) {
      const remainingMinutes = Math.ceil(15 - timeDiffMinutes);
      return `Complete button will be enabled in ${remainingMinutes} minute${
        remainingMinutes !== 1 ? "s" : ""
      }`;
    } else {
      return "Appointment can be completed now";
    }
  };

  const completeAppointment = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found");
        return;
      }
  
      // Check if appointment can be marked as completed
      const appointmentDateTime = new Date(appointment.slotDate);
      const [hours, minutes] = appointment.slotTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
      const now = new Date();
      if (appointmentDateTime > now) {
        toast.error("Cannot complete appointments before the scheduled time");
        return;
      }
  
      if (
        !window.confirm("Are you sure you want to mark this appointment as completed?")
      ) {
        return;
      }
  
      // Create completion details based on user role
      const completerName =
        role === "doctor"
          ? `Dr. ${user.firstName} ${user.lastName}`.trim()
          : `${user.firstName} ${user.lastName}`.trim();
  
      const completionDetails = {
        completedBy: role,
        completedById: user._id,
        completedAt: new Date().toISOString(),
        completerName: completerName,
        status: "completed", // Explicitly set status
      };
  
      // Create the updated appointment object with completion details
      const updatedAppointment = {
        ...appointment,
        status: "completed",
        completedBy: role,
        completedById: user._id,
        completedAt: new Date().toISOString(),
        completerName: completerName,
        paymentStatus:
          appointment.paymentStatus === "pending" ? "paid" : appointment.paymentStatus,
        docId: {
          ...appointment.docId,
          _id: appointment.docId._id,
          firstName: appointment.docId.firstName,
          lastName: appointment.docId.lastName,
        },
        patientId: {
          ...appointment.patientId,
          _id: appointment.patientId._id,
          firstName: appointment.patientId.firstName,
          lastName: appointment.patientId.lastName,
        },
      };
  
      // Update state immediately for better UX
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? updatedAppointment : apt
        )
      );
  
      // Update localStorage immediately
      const savedAppointmentsStr = localStorage.getItem("appointments");
      if (savedAppointmentsStr) {
        try {
          const { data } = JSON.parse(savedAppointmentsStr);
          const updatedSavedAppointments = data.map((apt) =>
            apt._id === appointmentId ? updatedAppointment : apt
          );
  
          localStorage.setItem(
            "appointments",
            JSON.stringify({
              data: updatedSavedAppointments,
              timestamp: new Date().toISOString(),
            })
          );
  
        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }
  
      // Make the API call
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/api/appointments/complete/${appointmentId}`,
        completionDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        // Create notifications for both parties
        const doctorNotification = {
          id: Date.now() + 1,
          type: "completed",
          message:
            role === "doctor"
              ? `You marked the appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} as completed`
              : `${user.firstName} ${user.lastName} marked their appointment as completed`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "doctor",
          recipientId: appointment.docId._id,
        };
  
        const patientNotification = {
          id: Date.now() + 2,
          type: "completed",
          message:
            role === "doctor"
              ? `Dr. ${user.firstName} ${user.lastName} marked your appointment as completed`
              : `You marked your appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName} as completed`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "patient",
          recipientId: appointment.patientId._id,
        };
  
        // Update notifications for both parties
        const updatedNotifications = [...notifications];
        updatedNotifications.unshift(doctorNotification);
        updatedNotifications.unshift(patientNotification);
  
        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        setNotifications(updatedNotifications);
  
        // Force refresh appointments to ensure both parties see the update
        await fetchAppointments();
  
        toast.success(`Appointment completed by ${completerName}`);
      } else {
        // If API call fails, revert the local changes
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appointmentId ? appointment : apt
          )
        );
        toast.error("Failed to complete appointment on server");
      }
    } catch (error) {
      console.error("Error completing appointment:", error);
      // Revert local changes if there's an error
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? appointment : apt
        )
      );
      toast.error(error.response?.data?.message || "Failed to complete appointment");
    }
  };
  

  const cancelAppointment = async (appointmentId) => {
    try {
      const appointment = appointments.find((apt) => apt._id === appointmentId);
      if (!appointment) {
        toast.error("Appointment not found");
        return;
      }

      // Check if appointment can be cancelled
      const appointmentDateTime = new Date(appointment.slotDate);
      const [hours, minutes] = appointment.slotTime.split(":");
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const now = new Date();
      if (appointmentDateTime < now) {
        toast.error("Cannot cancel past appointments");
        return;
      }

      const timeUntilAppointment = appointmentDateTime - now;
      const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

      if (hoursUntilAppointment < 1) {
        toast.error(
          "Cannot cancel appointments less than 1 hour before the scheduled time"
        );
        return;
      }

      if (
        !window.confirm("Are you sure you want to cancel this appointment?")
      ) {
        return;
      }

      // Create cancellation details based on user role
      const cancellerName =
        role === "doctor"
          ? `Dr. ${user.firstName} ${user.lastName}`.trim()
          : `${user.firstName} ${user.lastName}`.trim();

      const cancelDetails = {
        reason: "Cancelled by user",
        cancelledBy: role,
        cancelledById: user._id,
        cancelledAt: new Date().toISOString(),
        cancellerName: cancellerName,
        status: "cancelled", // Explicitly set status
      };

      // Create the updated appointment object with full details
      const updatedAppointment = {
        ...appointment,
        status: "cancelled",
        cancelledBy: role,
        cancelledById: user._id,
        cancelledAt: new Date().toISOString(),
        cancellerName: cancellerName,
        paymentStatus:
          appointment.paymentStatus === "paid"
            ? "refunded"
            : appointment.paymentStatus,
        docId: {
          ...appointment.docId,
          _id: appointment.docId._id,
          firstName: appointment.docId.firstName,
          lastName: appointment.docId.lastName,
        },
        patientId: {
          ...appointment.patientId,
          _id: appointment.patientId._id,
          firstName: appointment.patientId.firstName,
          lastName: appointment.patientId.lastName,
        },
      };

      // Update state immediately for better UX
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? updatedAppointment : apt
        )
      );

      // Update localStorage immediately
      const savedAppointmentsStr = localStorage.getItem("appointments");
      if (savedAppointmentsStr) {
        try {
          const { data } = JSON.parse(savedAppointmentsStr);
          const updatedSavedAppointments = data.map((apt) =>
            apt._id === appointmentId ? updatedAppointment : apt
          );

          localStorage.setItem(
            "appointments",
            JSON.stringify({
              data: updatedSavedAppointments,
              timestamp: new Date().toISOString(),
            })
          );

        } catch (error) {
          console.error("Error updating localStorage:", error);
        }
      }

      // Make the API call
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/appointments/cancel/${appointmentId}`,
        cancelDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Create notifications for both parties
        const doctorNotification = {
          id: Date.now() + 1,
          type: "cancelled",
          message:
            role === "doctor"
              ? `You cancelled the appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName}`
              : `${user.firstName} ${user.lastName} cancelled their appointment`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "doctor",
          recipientId: appointment.docId._id,
        };

        const patientNotification = {
          id: Date.now() + 2,
          type: "cancelled",
          message:
            role === "doctor"
              ? `Dr. ${user.firstName} ${user.lastName} cancelled your appointment`
              : `You cancelled your appointment with Dr. ${appointment.docId.firstName} ${appointment.docId.lastName}`,
          timestamp: new Date(),
          appointmentDate: appointment.slotDate,
          recipientType: "patient",
          recipientId: appointment.patientId._id,
        };

        // Update notifications for both parties
        const updatedNotifications = [...notifications];
        updatedNotifications.unshift(doctorNotification);
        updatedNotifications.unshift(patientNotification);

        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        setNotifications(updatedNotifications);

        // Force refresh appointments to ensure both parties see the update
        await fetchAppointments();

        toast.success(`Appointment cancelled by ${cancellerName}`);
      } else {
        // If API call fails, revert the local changes
        setAppointments((prevAppointments) =>
          prevAppointments.map((apt) =>
            apt._id === appointmentId ? appointment : apt
          )
        );
        toast.error("Failed to cancel appointment on server");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      // Revert local changes if there's an error
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt._id === appointmentId ? appointment : apt
        )
      );
      toast.error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
    }
  };

  const getNotificationBadgeColor = () => {
    if (notifications.length === 0) return "bg-gray-500";

    // Check if there are any completed appointments
    const hasCompleted = notifications.some((n) => n.type === "completed");
    if (hasCompleted) return "bg-green-500";

    // Check if there are any cancelled appointments
    const hasCancelled = notifications.some((n) => n.type === "cancelled");
    if (hasCancelled) return "bg-red-500";

    // Check if there are any missed appointments
    const hasMissed = notifications.some((n) => n.type === "missed");
    if (hasMissed) return "bg-yellow-500";

    // Default color for other notifications
    return "bg-blue-500";
  };

  const filteredAppointments = appointments.filter((appointment) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      (role === "doctor"
        ? `${appointment.patientId?.firstName} ${appointment.patientId?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
        : `Dr. ${appointment.docId?.firstName} ${appointment.docId?.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

    // For cancelled appointments
    if (appointment.status === "cancelled") {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const cancelledDate = new Date(
        appointment.cancelledAt || appointment.updatedAt
      );

      // Show cancelled appointments within 24 hours
      const isWithin24Hours = cancelledDate > oneDayAgo;

      // For doctors: show ALL appointments where they are the doctor
      // For patients: show only their own appointments
      const shouldShow =
        role === "doctor"
          ? appointment.docId?._id === user?._id // Show ALL appointments where they are the doctor
          : appointment.patientId?._id === user?._id; // Show only patient's own appointments

      // Show cancelled appointments if:
      // 1. They match the search query
      // 2. They're within 24 hours
      // 3. They belong to the current user (based on role)
      // 4. Filter status matches
      return (
        matchesSearch &&
        (filterStatus === "all" || filterStatus === "cancelled") &&
        isWithin24Hours &&
        shouldShow
      );
    }

    // For completed appointments, show only within 24 hours
    if (appointment.status === "completed") {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const completedDate = new Date(
        appointment.completedAt || appointment.updatedAt
      );
      return (
        matchesSearch &&
        (filterStatus === "all" || filterStatus === "completed") &&
        completedDate > oneDayAgo &&
        (role === "doctor"
          ? appointment.docId?._id === user?._id
          : appointment.patientId?._id === user?._id)
      );
    }

    // For other statuses (pending, confirmed), show all that belong to the current user
    return (
      matchesSearch &&
      (filterStatus === "all" || appointment.status === filterStatus) &&
      (role === "doctor"
        ? appointment.docId?._id === user?._id
        : appointment.patientId?._id === user?._id)
    );
  });

  // Sort appointments with cancelled and completed ones at the bottom
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // First sort by status (completed and cancelled last)
    if (
      (a.status === "completed" || a.status === "cancelled") &&
      b.status !== "completed" &&
      b.status !== "cancelled"
    )
      return 1;
    if (
      a.status !== "completed" &&
      a.status !== "cancelled" &&
      (b.status === "completed" || b.status === "cancelled")
    )
      return -1;

    // Then sort by date
    if (sortBy === "date") {
      const dateA = new Date(a.slotDate);
      const dateB = new Date(b.slotDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA - dateB;
      }
      return a.slotTime.localeCompare(b.slotTime);
    }

    // Then sort by name
    if (sortBy === "name") {
      return role === "doctor"
        ? `${a.patientId?.firstName} ${a.patientId?.lastName}`.localeCompare(
            `${b.patientId?.firstName} ${b.patientId?.lastName}`
          )
        : `Dr. ${a.docId?.firstName} ${a.docId?.lastName}`.localeCompare(
            `Dr. ${b.docId?.firstName} ${b.docId?.lastName}`
          );
    }
    return 0;
  });

  // Remove the cleanup effect that was causing issues
  useEffect(() => {
    const cleanupNotifications = () => {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Clean up notifications older than 24 hours
      setNotifications((prevNotifications) => {
        const updatedNotifications = prevNotifications.filter(
          (notification) => {
            const notificationTime = new Date(notification.timestamp);
            return notificationTime > twentyFourHoursAgo;
          }
        );

        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );
        return updatedNotifications;
      });
    };

    // Run cleanup every minute
    const cleanupInterval = setInterval(cleanupNotifications, 60 * 1000);

    // Run initial cleanup
    cleanupNotifications();

    // Cleanup interval on component unmount
    return () => clearInterval(cleanupInterval);
  }, []);

  // Add handleQuickAction function at the main component level
  const handleQuickAction = useCallback(
    (action) => {
      if (!user?._id) {
        toast.error("Please log in to continue");
        navigate("/login");
        return;
      }

      switch (action) {
        case "view-patients":
          navigate("/patients");
          break;
        case "write-prescription":
          navigate("/new-prescription", {
            state: {
              docId: user._id,
              doctorName:
                user.firstName && user.lastName
                  ? `Dr. ${user.firstName} ${user.lastName}`
                  : "Dr. Unknown",
              specialization: user.specialization || "General Physician",
            },
          });
          break;
        case "book-appointment":
          navigate("/appointment");
          break;
        case "view-prescriptions":
          // Route doctors to doctor-prescriptions and patients to prescriptions
          navigate(
            role === "doctor" ? "/doctor-prescriptions" : "/prescriptions"
          );
          break;
        case "doctor-prescriptions":
          navigate("/doctor-prescriptions");
          break;
        case "ai-chat":
          navigate("/aichat");
          break;
        default:
      }
    },
    [navigate, role, user]
  );

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/appointments/payment-history/${user?._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setPaymentHistory(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
      // Don't show error toast as this is not critical functionality
      setPaymentHistory([]);
    }
  };

  // Update the useEffect to only fetch payment history when user is available
  useEffect(() => {
    if (user?._id) {
      fetchPaymentHistory();
    }
  }, [user?._id]);

  const AppointmentCard = ({ appointment, role }) => {
    const isDoctor = role === "doctor";
    const navigate = useNavigate();

    // Get doctor and patient info
    const doctor = appointment.docId || {};
    const patient = appointment.patientId || {};

    // Get name with proper validation
    const doctorName = `Dr. ${doctor.firstName || ""} ${
      doctor.lastName || ""
    }`.trim();
    const patientName = `${patient.firstName || ""} ${
      patient.lastName || ""
    }`.trim();

    // Get action user name (who cancelled/completed/confirmed the appointment)
    const getActionUserName = () => {
      if (appointment.status === "cancelled") {
        // If cancelled by doctor
        if (appointment.cancelledBy === "doctor") {
          return `Cancelled by Dr. ${appointment.docId?.firstName || ""} ${
            appointment.docId?.lastName || ""
          }`;
        }
        // If cancelled by patient
        else if (appointment.cancelledBy === "patient") {
          return `Cancelled by ${appointment.patientId?.firstName || ""} ${
            appointment.patientId?.lastName || ""
          }`;
        }
        // If cancelled by system
        else if (appointment.cancelledBy === "system") {
          return "Cancelled by System";
        }
        // If we have the cancellerName, use it as fallback
        else if (appointment.cancellerName) {
          return `Cancelled by ${appointment.cancellerName}`;
        }
        // Final fallback
        return "Cancelled";
      } else if (
        appointment.status === "completed" &&
        appointment.completedBy
      ) {
        return `Completed by ${doctorName}`;
      } else if (
        appointment.status === "confirmed" &&
        appointment.confirmedBy
      ) {
        return `Confirmed by ${
          appointment.confirmedBy === "doctor" ? doctorName : patientName
        }`;
      }
      return "";
    };

    // Get action time with proper validation
    const getActionTime = () => {
      if (
        appointment.status === "cancelled" &&
        (appointment.cancelledAt || appointment.updatedAt)
      ) {
        const cancelTime = moment(
          appointment.cancelledAt || appointment.updatedAt
        ).fromNow();
        return cancelTime;
      } else if (
        appointment.status === "completed" &&
        (appointment.completedAt || appointment.updatedAt)
      ) {
        return moment(
          appointment.completedAt || appointment.updatedAt
        ).fromNow();
      } else if (
        appointment.status === "confirmed" &&
        (appointment.confirmedAt || appointment.updatedAt)
      ) {
        return moment(
          appointment.confirmedAt || appointment.updatedAt
        ).fromNow();
      }
      return "";
    };

    // Get profile picture URL
    const getProfilePicture = (user) => {
      if (!user?.profilePicture) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.firstName || ""
        )} ${encodeURIComponent(user?.lastName || "")}&background=random`;
      }
      return user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `http://localhost:5001${user.profilePicture}`;
    };

    const doctorProfilePic = getProfilePicture(doctor);
    const patientProfilePic = getProfilePicture(patient);

    const getStatusColor = (status) => {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800";
        case "completed":
          return "bg-green-100 text-green-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        case "confirmed":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-lg p-4 mb-4 ${
          appointment.status === "cancelled" ? "opacity-75" : ""
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <img
                src={isDoctor ? patientProfilePic : doctorProfilePic}
                alt={isDoctor ? patientName : doctorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    isDoctor ? patientName : doctorName
                  )}&background=random`;
                }}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                {isDoctor ? patientName : doctorName}
                {!isDoctor && doctor.specialization && (
                  <span className="text-xs text-green-600 ml-1">
                    - {doctor.specialization}
                    <FaStethoscope className="ml-1 inline-block" />
                  </span>
                )}
              </h3>

              <div className="flex items-center space-x-3 text-xs text-gray-600 mb-1">
                <span className="flex items-center">
                  <FaCalendarAlt className="mr-1 text-blue-500" />
                  {appointment.slotDate
                    ? moment(appointment.slotDate).format("MMMM D, YYYY")
                    : "Date not set"}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-1 text-blue-500" />
                  {appointment.slotTime || "Time not set"}
                </span>
                <span className="flex items-center">
                  {appointment.consultationType === "video" ? (
                    <FaVideo className="mr-1 text-blue-500" />
                  ) : (
                    <FaUser className="mr-1 text-blue-500" />
                  )}
                  {appointment.consultationType === "video"
                    ? "Video Consultation"
                    : "In-Person Consultation"}
                </span>
              </div>

              <div className="flex items-center mt-1 space-x-3 text-xs text-gray-600">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {(appointment.status || "Unknown").charAt(0).toUpperCase() +
                    (appointment.status || "Unknown").slice(1)}
                </span>
                {(appointment.status === "cancelled" ||
                  appointment.status === "completed" ||
                  appointment.status === "confirmed") && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">{getActionTime()}</span>
                    <span className="text-gray-500">{getActionUserName()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Only show buttons if appointment is not completed */}
            {appointment.status !== "completed" && (
              <>
                {/* Doctor buttons (Only for Pending) */}
                {isDoctor && appointment.status === "pending" && (
                  <div className="flex space-x-2">
                    {/* Complete Button */}
                    <button
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem("token");
                          const response = await axios.post(
                            `http://localhost:5001/api/appointments/${appointment._id}/confirm`,
                            { status: "confirmed" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );

                          if (response.data.success) {
                            setAppointments((prevAppointments) =>
                              prevAppointments.map((apt) =>
                                apt._id === appointment._id
                                  ? { ...apt, status: "confirmed" }
                                  : apt
                              )
                            );
                            fetchAppointments();
                            toast.success("Appointment confirmed!");
                          }
                        } catch (error) {
                          console.error("Error:", error);
                          toast.error("Failed to confirm appointment.");
                        }
                      }}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md transition-colors flex items-center"
                    >
                      <FaCheck className=" mr-1 text-xs" />
                      <span>Confirm</span>
                    </button>

                    {/* Cancel Button */}
                    <button
                      onClick={() => cancelAppointment(appointment._id)}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors flex items-center"
                    >
                      <FaTimes className="mr-1 text-xs" />
                      Cancel
                    </button>
                  </div>
                )}

                {/* Patient Buttons */}
                {!isDoctor && (
                  <div className="flex space-x-2">
                    {/* Patient Cancel Button (Only for Pending) */}
                    {appointment.status === "pending" && (
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors flex items-center"
                      >
                        <FaTimes className="mr-1 text-xs" />
                        Cancel
                      </button>
                    )}

                    {/* Pay Now Button (Only when Confirmed) */}
                    <>
                      {appointment.status === "confirmed" && !isProcessing && (
                        <button
                          onClick={async () => {
                            setIsProcessing(true); // 🔄 Show Payment Popup

                            setTimeout(async () => {
                              try {
                                const token = localStorage.getItem("token");
                                const response = await axios.post(
                                  `http://localhost:5001/api/appointments/${appointment._id}/pay`,
                                  {
                                    paymentStatus: "paid",
                                    status: "completed",
                                  },
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  } // ✅ Brackets sahi kiye
                                );

                                if (response.data.success) {
                                  setAppointments((prevAppointments) =>
                                    prevAppointments.map((apt) =>
                                      apt._id === appointment._id
                                        ? {
                                            ...apt,
                                            status: "completed",
                                            paymentStatus: "paid",
                                          }
                                        : apt
                                    )
                                  );
                                  fetchAppointments();
                                  toast.success(
                                    "Payment successful! Appointment completed."
                                  );
                                }
                              } catch (error) {
                                console.error("Payment error:", error);
                                toast.error("Payment failed.");
                              }

                              setIsProcessing(false); // ❌ Hide Popup after Payment
                            }, 3000); // ⏳ 3 seconds delay for demo
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md transition-colors flex items-center"
                        >
                          <FaCreditCard className="mr-1 text-xs" />
                          <span>Pay Now</span>
                        </button>
                      )}

                      {/* 🔄 Improved Payment Processing Box (Centered) */}
                      {isProcessing && (
                        <div className="fixed inset-0 flex items-center justify-center">
                          <div className="bg-white p-5 rounded-lg shadow-md border border-gray-300 w-64 text-center">
                            <h2 className="text-lg font-semibold text-green-600">
                              Processing Payment...
                            </h2>
                            <div className="mt-3 flex justify-center">
                              <div className="w-6 h-6 border-4 border-green-500 border-dashed rounded-full animate-spin"></div>
                            </div>
                            <p className="text-base text-black mt-2">
                              This is a demo payment.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const NotificationCard = ({ notification }) => {
    const getNotificationStyle = (type) => {
      switch (type) {
        case "cancelled":
          return "bg-red-50 border-red-200";
        case "completed":
          return "bg-green-50 border-green-200";
        case "upcoming":
          return "bg-blue-50 border-blue-200";
        default:
          return "bg-gray-50 border-gray-200";
      }
    };

    const getNotificationIcon = (type) => {
      switch (type) {
        case "cancelled":
          return <FaTimes className="text-red-500" />;
        case "completed":
          return <FaCheckCircle className="text-green-500" />;
        case "upcoming":
          return <FaCalendarAlt className="text-blue-500" />;
        default:
          return <FaBell className="text-gray-500" />;
      }
    };

    const getNotificationMessage = (notification) => {
      let message = notification.message;
      if (
        notification.type === "completed" ||
        notification.type === "cancelled"
      ) {
        message += ` on ${moment(notification.appointmentDate).format(
          "MMMM D, YYYY"
        )}`;
      }
      return message;
    };

    return (
      <div
        className={`p-4 rounded-lg border ${getNotificationStyle(
          notification.type
        )} mb-4 transition-all duration-300 hover:shadow-md`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              {getNotificationMessage(notification)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {moment(notification.timestamp).fromNow()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-custom-light-blue via-custom-light-teal to-custom-light-cyan p-6">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {role === "doctor" ? "Dr." : ""} {user?.firstName}
                !
              </h1>
              <p className="text-gray-600 mt-1">
                {role === "doctor"
                  ? "Manage your appointments and patient care"
                  : "Track your health and appointments"}
              </p>
            </div>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm border border-gray-200"
            >
              <FaChartLine className="text-blue-500" />
              <span className="font-medium">Quick Actions</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Cards */}
          {showQuickActions && (
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {role === "doctor" ? (
                <>
                  {/* My Patients Card */}
                  <div
                    onClick={() => handleQuickAction("view-patients")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaHospitalUser className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          My Patients
                        </h3>
                        <p className="text-sm text-gray-500">
                          View patient list
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Write Prescriptions */}
                  <div
                    onClick={() => handleQuickAction("write-prescription")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaFileAlt className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Write Prescription
                        </h3>
                        <p className="text-sm text-gray-500">
                          Write prescriptions for patient
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* View Prescriptions */}
                  <div
                    onClick={() => handleQuickAction("doctor-prescriptions")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaPrescriptionBottleAlt className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          View Prescription
                        </h3>
                        <p className="text-sm text-gray-500">
                          All patient prescriptions
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Book Appointment Card */}
                  <div
                    onClick={() => handleQuickAction("book-appointment")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaCalendarCheck className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Book Appointment
                        </h3>
                        <p className="text-sm text-gray-500">
                          Schedule a visit
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* My Prescriptions Card */}
                  <div
                    onClick={() => handleQuickAction("view-prescriptions")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaNotesMedical className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          My Prescriptions
                        </h3>
                        <p className="text-sm text-gray-500">
                          View your prescriptions
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Card */}
                  <div
                    onClick={() => handleQuickAction("ai-chat")}
                    className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:bg-gray-50 transition-all border border-gray-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <FaRobot className="text-blue-500 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          AI Assistant
                        </h3>
                        <p className="text-sm text-gray-500">
                          Get instant help
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">
                  {role === "doctor"
                    ? "Patient Appointments"
                    : "My Appointments"}
                </h2>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <input
                      type="text"
                      placeholder="Search appointments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <FaSearch className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : sortedAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No appointments found</p>
                  {role === "patient" && (
                    <button
                      onClick={() => navigate("/appointment")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Schedule New Appointment
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAppointments.map((appointment) => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      role={role}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Different for doctors and patients */}
          <div className="lg:col-span-1">
            {/* Notifications Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Notifications
                </h2>
                <div
                  className={`relative ${getNotificationBadgeColor()} rounded-full h-6 w-6 flex items-center justify-center text-white text-xs`}
                >
                  {notifications.length}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No new notifications</p>
                  <FaBell className="text-gray-400 text-4xl mx-auto" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                  {notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
