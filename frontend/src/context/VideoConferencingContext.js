// src/context/VideoConferencingContext.js

import React, { createContext, useState } from 'react';

export const VideoConferencingContext = createContext();

export const VideoConferencingProvider = ({ children }) => {
    const [isVideoCallActive, setIsVideoCallActive] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [callStatus, setCallStatus] = useState('idle'); // can be 'idle', 'in-progress', 'ended'

    // Start a video call with specified participants
    const startVideoCall = (participantsList) => {
        setParticipants(participantsList);
        setIsVideoCallActive(true);
        setCallStatus('in-progress');
        console.log("Video call started with participants:", participantsList);
    };

    // End the video call
    const endVideoCall = () => {
        setIsVideoCallActive(false);
        setParticipants([]);
        setCallStatus('ended');
        console.log("Video call ended.");
    };

    // Start/stop screen sharing
    const toggleScreenSharing = () => {
        setIsScreenSharing(prevState => !prevState);
        console.log("Screen sharing", isScreenSharing ? "stopped" : "started");
    };

    // Start/stop recording
    const toggleRecording = () => {
        setIsRecording(prevState => !prevState);
        console.log("Recording", isRecording ? "stopped" : "started");
    };

    // Add a participant to the call
    const addParticipant = (newParticipant) => {
        setParticipants(prevParticipants => [...prevParticipants, newParticipant]);
        console.log("Participant added:", newParticipant);
    };

    // Remove a participant from the call
    const removeParticipant = (participantToRemove) => {
        setParticipants(prevParticipants => 
            prevParticipants.filter(participant => participant !== participantToRemove)
        );
        console.log("Participant removed:", participantToRemove);
    };

    return (
        <VideoConferencingContext.Provider value={{
            isVideoCallActive,
            setIsVideoCallActive,
            participants,
            setParticipants,
            startVideoCall,
            endVideoCall,
            toggleScreenSharing,
            toggleRecording,
            addParticipant,
            removeParticipant,
            isScreenSharing,
            isRecording,
            callStatus
        }}>
            {children}
        </VideoConferencingContext.Provider>
    );
};
