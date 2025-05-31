export const getAppointmentStatus = (appointmentDate, appointmentTime) => {
  const appointmentDateTime = new Date(appointmentDate);
  const [hours, minutes] = appointmentTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  const now = new Date();
  const timeDiffMinutes = (appointmentDateTime - now) / (1000 * 60);

  return {
    canJoin: timeDiffMinutes <= 10 && timeDiffMinutes >= -60,
    minutesUntilJoin: Math.round(timeDiffMinutes),
    hasEnded: timeDiffMinutes < -60,
    status: timeDiffMinutes <= 10 && timeDiffMinutes >= -60 
      ? "ready"
      : timeDiffMinutes > 10 
      ? "upcoming" 
      : "ended"
  };
};

export const getJoinButtonProps = (appointmentStatus) => {
  const baseClasses = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all duration-300";
  
  if (appointmentStatus.canJoin) {
    return {
      text: "Join Now",
      disabled: false,
      className: `${baseClasses} bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 transform`
    };
  } else if (appointmentStatus.hasEnded) {
    return {
      text: "Ended",
      disabled: true,
      className: `${baseClasses} bg-gray-400 cursor-not-allowed`
    };
  } else {
    return {
      text: `Join Later (${Math.ceil(appointmentStatus.minutesUntilJoin)}m)`,
      disabled: true,
      className: `${baseClasses} bg-gray-400 cursor-not-allowed`
    };
  }
};

export const TESTING_MODE = {
  enabled: false,
  override: {
    canJoin: true,
    minutesUntilJoin: 0,
    hasEnded: false,
    status: "ready"
  }
};

export const getAppointmentStatusWithTestMode = (appointmentDate, appointmentTime) => {
  if (TESTING_MODE.enabled) {
    return TESTING_MODE.override;
  }
  return getAppointmentStatus(appointmentDate, appointmentTime);
};

export const toggleTestingMode = () => {
  TESTING_MODE.enabled = !TESTING_MODE.enabled;
  return TESTING_MODE.enabled;
}; 