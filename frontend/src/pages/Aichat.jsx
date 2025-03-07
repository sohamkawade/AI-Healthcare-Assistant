import React, { useEffect } from "react";
import "./aniket.css"; // Import your CSS file

function Chatbot() {
    useEffect(() => {
        // JavaScript logic (move script.js functionality here)
        const chatBody = document.querySelector(".chat-body");
        const messageInput = document.querySelector(".message-input");
        const sendMessageButton = document.querySelector("#send-message");
        
        const API_KEY = "AIzaSyBE8rlhKfxbmjl4jGLNxO68VDBvADA2684"; // Replace with your actual API key
        const API_URL =`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
        
        const userData = { message: null };
        const chatHistory = [];
        
        // ✅ 1️⃣ Predefined Questions & Answers
        const predefinedQA = {
            "hi": "Hello! How can I assist you today?",
            "how are you": "I'm just a bot, but I'm here to help!",
            "who created you": "I was created by a developer using AI technology.",
            "bye": "Goodbye! Have a great day!",
            "i have some fever":"Stay hydrated, take rest, and take a fever-reducing medicine like paracetamol if needed. If it persists, see a doctor.",
            "what are the benefits of drinking water":"Drinking water helps keep you hydrated, improves digestion, and flushes out toxins from your body.",
            "how can boost immune system":" Eat a balanced diet, exercise regularly, get enough sleep, and manage stress to strengthen your immunity.",
            "what are the symptoms of dehydration":" Dry mouth, dizziness, dark urine, and fatigue are common signs of dehydration.",
            "how much sleep do i need daily":"Adults need 7-9 hours of sleep per night for optimal health and energy.",
            "what are some natural ways to reduce stress":"Meditation, deep breathing, yoga, and regular exercise can help reduce stress naturally.",
            "what foods are good for heart health":"Eat fruits, vegetables, whole grains, and healthy fats like nuts and olive oil for a healthy heart.",
            "how can i improve my digestion":"Eat fiber-rich foods, stay hydrated, and avoid processed foods to support good digestion.",  
            "why is exercise important":"Exercise helps maintain a healthy weight, strengthens muscles, improves mood, and reduces disease risk.",
            "what causes stomach pain": "Common causes include indigestion, gas, infections, or food poisoning.",
            "how can i relieve stomach pain": "Drink warm water, eat light foods, and avoid spicy or oily meals. If pain is severe, see a doctor.",
            "what are common causes of headaches": "Stress, dehydration, lack of sleep, and eye strain are common triggers.",
            "how can i get rid of a headache quickly": "Rest in a quiet, dark room, stay hydrated, and try a cold or warm compress on your head.",
            "how can i keep my heart healthy": "Exercise regularly, eat a balanced diet, avoid smoking, and manage stress.",
            "what are signs of a heart attack": "Chest pain, shortness of breath, dizziness, and pain in the left arm. Seek emergency help immediately.",
            "what causes body pain": "Overexertion, dehydration, viral infections, or poor posture can lead to body pain.",
            "how can i relieve muscle pain": "Rest, drink enough water, stretch gently, and apply a hot or cold pack to sore areas."
        
        
        
        };
        
        // ✅ 2️⃣ Function to Check Predefined Answers
        const checkPredefinedResponse = (message) => {
            return predefinedQA[message.toLowerCase()] || null;
        };
        
        // ✅ 3️⃣ Function to Create Message Elements
        const createMessageElement = (content, ...classes) => {
            const div = document.createElement("div");
            div.classList.add("message", ...classes);
            div.innerHTML = content;
            return div;
        };
        
        // ✅ 4️⃣ Function to Generate Bot Response (API or Predefined)
        const generateBotResponse = async (incomingMessageDiv) => {
            const messageElement = incomingMessageDiv.querySelector(".message-text");
        
            // 🔹 Check if message exists in predefined Q&A
            const predefinedResponse = checkPredefinedResponse(userData.message);
            if (predefinedResponse) {
                messageElement.textContent = predefinedResponse;
                return;
            }
        
            // 🔹 Otherwise, send request to API
            chatHistory.push({ role: "user", parts: [{ text: userData.message }] });
        
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: chatHistory })
            };
        
            try {
                const response = await fetch(API_URL, requestOptions);
                const data = await response.json();
                if (!response.ok) throw new Error(data.error.message);
        
                const apiResponseText = data.candidates[0].content.parts[0].text.trim();
                messageElement.textContent = apiResponseText;
        
                // Save bot response in chat history
                chatHistory.push({ role: "model", parts: [{ text: apiResponseText }] });
        
            } catch (error) {
                console.error(error);
                messageElement.textContent = "Oops! Something went wrong.";
            } finally {
                incomingMessageDiv.classList.remove("thinking");
                chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
            }
        };
        
        // ✅ 5️⃣ Function to Handle Outgoing Messages
        const handleOutgoingMessage = () => {
            userData.message = messageInput.value.trim();
            if (!userData.message) return; // Prevent empty messages
            messageInput.value = "";
        
            // Add user message to chat
            const messageContent = <div class="message-text"></div>;
            const outgoingMessage = createMessageElement(messageContent, "user-message");
            outgoingMessage.querySelector(".message-text").textContent = userData.message;
            chatBody.append(outgoingMessage);
            chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        
            // Bot Typing Indicator
            setTimeout(() => {
                const botMessageContent = `
                    <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
                    </svg>
                    <div class="message-text">
                        <div class="thinking-indicator">
                            <div class="dot"></div>
                            <div class="dot"></div>
                            <div class="dot"></div>
                        </div>
                    </div>`;
                
                const incomingMessageDiv = createMessageElement(botMessageContent, "bot-message", "thinking");
                chatBody.append(incomingMessageDiv);
                chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
        
                // Generate bot response
                generateBotResponse(incomingMessageDiv);
            }, 600);
        };
        
        // ✅ 6️⃣ Event Listeners
        messageInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && messageInput.value.trim()) {
                handleOutgoingMessage();
            }
        });
        sendMessageButton.addEventListener("click", () => handleOutgoingMessage());
    }, []);

    return (
        <div className="chatbot-popup">
            {/* Chatbot Header */}
            <div className="chat-header">
                <div className="header-info">
                    <svg className="chatbot-logo" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z"></path>
                    </svg>
                    <h2 className="logo-text">Chatbot</h2>
                </div>
                {/* <button id="close-chatbot" className="material-symbols-rounded">
                    keyboard_arrow_down
                </button> */}
            </div>

            {/* Chatbot Body */}
            <div className="chat-body">
                <div className="message bot-message">
                    <svg className="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
                        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z"></path>
                    </svg>
                    <div className="message-text">Hey there <br /> how can I help you today?</div>
                </div>
            </div>

            {/* Chatbot Footer */}
            <div className="chat-footer">
                <form className="chat-form">
                    <textarea placeholder="Message..." className="message-input" required></textarea>
                    <div className="chat-controls">
                        {/* <button type="button" className="material-symbols-rounded">sentiment_satisfied</button>
                        <button type="button" id="file-upload" className="material-symbols-rounded">attach_file</button> */}
                        <button type="submit" id="send-message" className="material-symbols-rounded">arrow_upward</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Chatbot;