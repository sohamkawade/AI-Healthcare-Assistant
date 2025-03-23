import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaFlask } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

// Configure axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5001';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// If there's a token in localStorage, use it
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const VideoConsultation = () => {
  const { appointmentId: urlAppointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasReceivedOffer, setHasReceivedOffer] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [appointmentId, setAppointmentId] = useState(urlAppointmentId);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // WebRTC refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Fetch active video consultation if no appointmentId is provided
  useEffect(() => {
    const fetchActiveConsultation = async () => {
      if (!urlAppointmentId) {
        try {
          setIsLoading(true);
          const response = await axios.get('/api/appointments/active-video-consultation');
          if (response.data.success) {
            setAppointmentId(response.data.data._id);
          } else {
            toast.error('No active video consultation found');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching active consultation:', error);
          if (error.response?.status === 401) {
            toast.error('Please log in to access video consultation');
            navigate('/login');
          } else {
            toast.error('Failed to find active video consultation');
            navigate('/dashboard');
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchActiveConsultation();
  }, [urlAppointmentId, navigate]);

  // Function to handle test call
  const handleTestCall = async () => {
    try {
      setIsLoading(true);
      // Create a test appointment with current user
      const response = await axios.post('/api/appointments/test', {
        type: 'video',
        status: 'confirmed',
        startTime: new Date(),
        duration: 30,
        isTestAppointment: true
      });

      if (response.data.success) {
        setAppointmentId(response.data.data._id);
        setIsTestMode(true);
        setIsInCall(true);
        
        // Setup WebRTC for test mode
        await setupVideoCall();
        
        // Start polling for other participant in test mode
        pollingIntervalRef.current = setInterval(async () => {
          try {
            const response = await axios.get(`/api/appointments/${appointmentId}/status`);
            
            // Check if call was ended
            if (response.data.callEnded) {
              toast.info(`Call ended by ${response.data.endedBy}`);
              cleanup();
              setTimeout(() => navigate('/dashboard'), 2000);
              return;
            }

            // If we're the first participant, send offer
            if (!response.data.offer && !hasReceivedOffer && peerConnectionRef.current) {
              await createAndSendOffer();
            }
            
            // If we receive an offer and haven't answered yet
            if (response.data.offer && !hasReceivedOffer) {
              setHasReceivedOffer(true);
              await createAndSendAnswer(response.data.offer);
            }

            // Handle answer if we sent an offer
            if (response.data.answer && peerConnectionRef.current?.currentLocalDescription?.type === 'offer') {
              await handleAnswer(response.data.answer);
            }

            // Handle ICE candidates
            if (response.data.candidates && response.data.candidates.length > 0) {
              for (const candidate of response.data.candidates) {
                await handleIceCandidate(candidate);
              }
            }
          } catch (error) {
            console.error('Error in test mode polling:', error);
          }
        }, 1000);

        toast.success('Test mode activated - Waiting for other participant');
      } else {
        toast.error('Failed to activate test mode');
      }
    } catch (error) {
      console.error('Error creating test appointment:', error);
      toast.error('Failed to activate test mode. Please try again.');
      if (error.response?.status === 401) {
        toast.error('Please log in to use test mode');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create and send offer
  const createAndSendOffer = async () => {
    try {
      const offer = await peerConnectionRef.current.createOffer();
      await peerConnectionRef.current.setLocalDescription(offer);
      
      // Send offer to signaling server
      await axios.post(`/api/appointments/${appointmentId}/offer`, {
        offer: offer
      });
      console.log('Offer sent successfully');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast.error('Failed to create connection offer');
    }
  };

  // Function to create and send answer
  const createAndSendAnswer = async (offer) => {
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Send answer to signaling server
      await axios.post(`/api/appointments/${appointmentId}/answer`, {
        answer: answer
      });
      console.log('Answer sent successfully');
    } catch (error) {
      console.error('Error creating answer:', error);
      toast.error('Failed to create connection answer');
    }
  };

  // Function to handle incoming answer
  const handleAnswer = async (answer) => {
    try {
      if (!peerConnectionRef.current || peerConnectionRef.current.currentRemoteDescription) return;
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('Answer handled successfully');
    } catch (error) {
      console.error('Error setting remote description:', error);
    }
  };

  // Function to handle ICE candidates
  const handleIceCandidate = async (candidate) => {
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('ICE candidate added successfully');
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  };

  // Function to notify other user about call end
  const notifyCallEnd = async () => {
    try {
      await axios.post(`/api/appointments/${appointmentId}/end-call`, {
        endedBy: user.role
      });
      console.log('Call end notification sent');
    } catch (error) {
      console.error('Error sending call end notification:', error);
    }
  };

  // Function to cleanup resources
  const cleanup = () => {
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Stop all tracks in local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    // Stop remote stream
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      const remoteStream = remoteVideoRef.current.srcObject;
      remoteStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      remoteVideoRef.current.srcObject = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Reset video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Reset states
    setIsInCall(false);
    setIsConnected(false);
    setIsAudioOn(true);
    setIsVideoOn(true);
    setHasReceivedOffer(false);
    setCallEnded(true);
  };

  // Poll for updates
  useEffect(() => {
    if (!isInCall || !appointmentId || callEnded) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`/api/appointments/${appointmentId}/status`);
        
        // Check if call was ended by other user
        if (response.data.callEnded) {
          toast.info(`Call ended by ${response.data.endedBy}`);
          cleanup();
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        // Handle offer if we haven't received one yet
        if (response.data.offer && !hasReceivedOffer && (!peerConnectionRef.current?.currentLocalDescription)) {
          console.log('Received offer, creating answer');
          setHasReceivedOffer(true);
          // Show incoming call notification
          if (!isInCall) {
            const userConfirmed = window.confirm('Incoming video call. Would you like to join?');
            if (userConfirmed) {
              setIsInCall(true);
              await setupVideoCall();
            }
          } else {
            await createAndSendAnswer(response.data.offer);
          }
        }

        // Handle answer if we sent an offer
        if (response.data.answer && peerConnectionRef.current?.currentLocalDescription?.type === 'offer') {
          console.log('Received answer');
          await handleAnswer(response.data.answer);
        }

        // Handle ICE candidates
        if (response.data.candidates && response.data.candidates.length > 0) {
          console.log('Received ICE candidates:', response.data.candidates.length);
          for (const candidate of response.data.candidates) {
            await handleIceCandidate(candidate);
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 1000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isInCall, appointmentId, hasReceivedOffer, callEnded]);

  // Check for incoming calls when page loads
  useEffect(() => {
    const checkForIncomingCalls = async () => {
      if (!appointmentId || isInCall) return;

      try {
        const response = await axios.get(`/api/appointments/${appointmentId}/status`);
        if (response.data.offer && !hasReceivedOffer) {
          const userConfirmed = window.confirm('Incoming video call. Would you like to join?');
          if (userConfirmed) {
            setIsInCall(true);
            await setupVideoCall();
          }
        }
      } catch (error) {
        console.error('Error checking for incoming calls:', error);
      }
    };

    checkForIncomingCalls();
  }, [appointmentId]);

  const setupVideoCall = async () => {
    if (!appointmentId) {
      toast.error('No appointment found');
      navigate('/dashboard');
      return;
    }

    try {
      setIsConnecting(true);

      // First, cleanup any existing streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        localStreamRef.current = null;
      }

      // Add a small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Request both audio and video permissions
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Ensure stream is valid and has tracks
      if (!stream || !stream.getTracks().length) {
        throw new Error('Failed to get media stream');
      }

      // Set up local video
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        await localVideoRef.current.play().catch(e => console.error('Error playing local video:', e));
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      // Cleanup existing peer connection if any
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        console.log('Received remote track');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          toast.success('Connected to other participant!');
        }
      };

      // Handle connection state changes
      peerConnectionRef.current.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnectionRef.current.connectionState);
        if (peerConnectionRef.current.connectionState === 'connected') {
          setIsConnected(true);
          toast.success('Connection established!');
        } else if (peerConnectionRef.current.connectionState === 'failed') {
          toast.error('Connection failed. Please try rejoining.');
          cleanup();
        }
      };

      // Handle ICE candidates
      peerConnectionRef.current.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await axios.post(`/api/appointments/${appointmentId}/ice-candidate`, {
              candidate: event.candidate
            });
          } catch (error) {
            console.error('Error sending ICE candidate:', error);
          }
        }
      };

      // If not in test mode, check for existing offer/answer
      if (!isTestMode) {
        const response = await axios.get(`/api/appointments/${appointmentId}/status`);
        
        if (response.data.callEnded) {
          toast.error('This call has already ended');
          cleanup();
          setTimeout(() => navigate('/dashboard'), 2000);
          return;
        }

        if (response.data.offer && !hasReceivedOffer) {
          setHasReceivedOffer(true);
          await createAndSendAnswer(response.data.offer);
        } else if (!response.data.offer) {
          await createAndSendOffer();
        }
      }
      
      toast.success('Camera and microphone ready!');
    } catch (error) {
      console.error('Error setting up video call:', error);
      toast.error('Failed to access camera or microphone. Please check permissions.');
      cleanup();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleJoinCall = async () => {
    if (!appointmentId) {
      toast.error('No appointment found');
      navigate('/dashboard');
      return;
    }
    setIsInCall(true);
    await setupVideoCall();
  };

  const handleEndCall = async () => {
    await notifyCallEnd();
    cleanup();
    toast.success('Call ended successfully');
    setTimeout(() => navigate('/dashboard'), 2000);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
        toast.success(audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted');
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
        toast.success(videoTrack.enabled ? 'Camera turned on' : 'Camera turned off');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInCall && !callEnded) {
        notifyCallEnd();
      }
      cleanup();
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video consultation...</p>
        </div>
      </div>
    );
  }

  if (!isInCall) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Video Consultation</h2>
            <p className="text-gray-500 mt-1">Choose how to join the consultation</p>
          </div>

          <div className="space-y-4">
            {/* Regular Join Button */}
            <button
              onClick={handleJoinCall}
              disabled={!appointmentId || isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaVideo />
              <span>Join Appointment</span>
            </button>

            {/* Test Call Button */}
            <button
              onClick={handleTestCall}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFlask />
              <span>{isLoading ? 'Creating Test Call...' : 'Start Test Call'}</span>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              disabled={isLoading}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Dashboard
            </button>
          </div>

          {isTestMode && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Test Mode Active: This is a test call and will not affect real appointments.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 grid grid-cols-2 gap-4 p-4">
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-xl bg-gray-800"
          />
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white">
            You ({user.role === 'doctor' ? 'Doctor' : 'Patient'})
          </div>
          {isTestMode && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-lg">
              Test Mode
            </div>
          )}
        </div>
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-xl bg-gray-800"
          />
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 rounded-xl">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-gray-300">
                  {isConnecting ? 'Connecting...' : 'Waiting for other participant...'}
                </p>
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-white">
            {user.role === 'doctor' ? 'Patient' : 'Doctor'}
          </div>
        </div>
      </div>

      <div className="bg-black/90 p-4 flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isAudioOn ? (
              <FaMicrophone className="text-white text-xl" />
            ) : (
              <FaMicrophoneSlash className="text-white text-xl" />
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isVideoOn ? (
              <FaVideo className="text-white text-xl" />
            ) : (
              <FaVideoSlash className="text-white text-xl" />
            )}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600"
          >
            <FaPhoneSlash className="text-white text-xl" />
          </button>
        </div>

        {isTestMode && (
          <div className="text-center text-white text-sm">
            <p>Test Mode: Open this page in another browser to test the connection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConsultation;
