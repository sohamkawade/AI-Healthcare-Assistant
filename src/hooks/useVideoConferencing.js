// src/hooks/useVideoConferencing.js

import { useContext } from 'react';
import { VideoConferencingContext } from '../context/VideoConferencingContext';

export const useVideoConferencing = () => {
    const {
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
    } = useContext(VideoConferencingContext);

    return {
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
    };
};
