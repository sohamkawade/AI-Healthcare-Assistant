import React, { useEffect, useState } from "react";
import { FaStethoscope, FaUser, FaPaperPlane, FaTimes, FaHeartbeat, FaTrash, FaQuestionCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Chatbot() {
    const [showQuestions, setShowQuestions] = useState(true);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [messageInput, setMessageInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    const API_KEY = "AIzaSyBE8rlhKfxbmjl4jGLNxO68VDBvADA2684";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const horizontalQuestions = [
        // Common Symptoms
        { text: "Headache", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Fever", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Cough", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Body Pain", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Stomach Pain", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Respiratory Issues
        { text: "Asthma", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Bronchitis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Pneumonia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Sinusitis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Allergies", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Heart & Blood
        { text: "High Blood Pressure", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Diabetes", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Anemia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Heart Disease", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Cholesterol", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Digestive System
        { text: "Acid Reflux", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "IBS", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Ulcer", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Liver Problems", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Gallbladder", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Mental Health
        { text: "Anxiety", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Depression", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Insomnia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Stress", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Panic Attacks", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Skin Conditions
        { text: "Eczema", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Psoriasis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Acne", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Skin Cancer", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Hair Loss", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Bone & Joint
        { text: "Arthritis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Osteoporosis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Back Pain", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Sciatica", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Sports Injury", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Women's Health
        { text: "Menstrual Issues", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Pregnancy Care", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Menopause", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Breast Health", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "PCOS", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        // Children's Health
        { text: "Child Fever", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Child Growth", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Child Nutrition", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Child Vaccination", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
        { text: "Child Development", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> }
    ];

    // Update predefined responses with care information
    const predefinedQA = {
        // Basic Greetings
        "hi": "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you?",
        "how are you": "I'm ready to help you with health-related questions! What health concerns would you like to discuss?",
        "who created you": "I'm an AI healthcare assistant designed to provide medical information and care instructions. How can I help you?",
        "bye": "Take care! If you have any health concerns, feel free to ask. Goodbye!",
        
        // Common Symptoms with Care Information
        "back pain": `Back Pain Information:

Care Instructions:
Rest the affected area
Apply heat/cold packs
Take prescribed pain relievers
Maintain good posture

Seek immediate medical attention if:
Severe pain
Numbness in legs
Loss of bladder control
Fever with back pain

Consult these doctors:
Orthopedist for bone/joint issues
Physiotherapist for muscle pain
Neurologist for nerve problems
General Physician for initial assessment`,

        "headache": `Headache Information:

Care Instructions:
Rest in a quiet, dark room
Stay hydrated
Apply cold/warm compress
Take prescribed pain relievers

Seek immediate medical attention if:
Severe or sudden headache
Headache with fever
Vision changes
After injury

Consult these doctors:
Neurologist for severe headaches
General Physician for fever with headache
Ophthalmologist for vision issues
ENT Specialist for sinus headaches`,

        "fever": `Fever Information:

Care Instructions:
Rest and sleep well
Drink plenty of fluids
Take prescribed fever medicine
Keep room temperature cool

Seek immediate medical attention if:
Temperature above 103°F
Fever lasting more than 3 days
Severe symptoms
Children under 3 months

Consult these doctors:
General Physician for fever
Pediatrician for children
Emergency Department for severe symptoms
Infectious Disease Specialist for persistent fever`,

        "cough": `Cough Information:

Care Instructions:
Stay hydrated
Use honey with warm water
Avoid irritants
Rest your voice

Seek immediate medical attention if:
Coughing up blood
Difficulty breathing
Chest pain
Fever with cough

Consult these doctors:
ENT Specialist for cough
Pulmonologist for breathing problems
General Physician for severe cough
Pediatrician for children's cough`,

        "body pain": `Body Pain Information:

Care Instructions:
Rest the affected area
Apply heat/cold packs
Gentle stretching
Take prescribed pain relievers

Seek immediate medical attention if:
Severe pain
Limited movement
Pain after injury
Joint swelling

Consult these doctors:
Orthopedist for bone/joint pain
Physiotherapist for muscle pain
Rheumatologist for joint inflammation
General Physician for general pain`,

        "stomach pain": `Stomach Pain Information:

Care Instructions:
Drink warm water
Eat light, bland food
Rest and avoid spicy food
Take prescribed medicines

Seek immediate medical attention if:
Severe pain
Blood in stool
Persistent pain
Vomiting

Consult these doctors:
Gastroenterologist for digestive issues
General Physician for general pain
Emergency Department for severe pain
Pediatrician for children's stomach pain`,

        // Respiratory Issues
        "asthma": `Asthma Information:

Care Instructions:
Use prescribed inhalers
Avoid triggers
Stay indoors during high pollen
Keep rescue inhaler handy

Seek immediate medical attention if:
Severe breathing difficulty
Wheezing
Chest tightness
Frequent inhaler use

Consult these doctors:
Pulmonologist for asthma management
Allergist for allergy-related asthma
Emergency Department for severe attacks
Pediatrician for children with asthma`,

        "bronchitis": `Bronchitis Information:

Care Instructions:
Rest and stay hydrated
Use steam inhalation
Avoid smoke
Take prescribed medicines

Seek immediate medical attention if:
Difficulty breathing
Chest pain
High fever
Coughing up blood

Consult these doctors:
Pulmonologist for bronchitis
ENT Specialist for upper respiratory issues
General Physician for acute bronchitis
Emergency Department for severe symptoms`,

        // Heart & Blood
        "high blood pressure": `High Blood Pressure Information:

Care Instructions:
Reduce salt intake
Regular exercise
Take prescribed medicines
Manage stress

Seek immediate medical attention if:
Severe headache
Chest pain
Shortness of breath
Vision changes

Consult these doctors:
Cardiologist for heart health
General Physician for blood pressure
Nephrologist for kidney issues
Emergency Department for severe symptoms`,

        "diabetes": `Diabetes Information:

Care Instructions:
Monitor blood sugar
Follow prescribed diet
Regular exercise
Take prescribed medicines

Seek immediate medical attention if:
Extreme thirst
Frequent urination
Fatigue
Vision changes

Consult these doctors:
Endocrinologist for diabetes
Diabetologist for specialized care
Ophthalmologist for eye issues
Podiatrist for foot care`,

        // Update predefined responses with anemia information
        "anemia": `Anemia Information:

Care Instructions:
Eat iron-rich foods
Take prescribed supplements
Include vitamin C in diet
Rest when needed

Seek immediate medical attention if:
Severe fatigue
Pale skin
Shortness of breath
Dizziness

Consult these doctors:
Hematologist for blood disorders
General Physician for initial assessment
Gynecologist for women with heavy periods
Gastroenterologist for digestive issues`,

        // Add more conditions with care information...
    };

    // Function to Check Predefined Answers
    const checkPredefinedResponse = (message) => {
        return predefinedQA[message.toLowerCase()] || null;
    };

    // Function to format message content with proper styling
    const formatMessageContent = (content) => {
        // Convert line breaks to proper spacing
        content = content.replace(/\n\n/g, '<div class="h-3"></div>');
        content = content.replace(/\n/g, '<br>');
        return content;
    };

    // Function to scroll to bottom of chat
    const scrollToBottom = () => {
        const chatBody = document.querySelector(".chat-body");
        if (chatBody) {
            chatBody.scrollTo({
                top: chatBody.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    // Function to Check if Question is Health-Related
    const isHealthRelated = (message) => {
        const healthKeywords = [
            'health', 'disease', 'symptom', 'pain', 'fever', 'cough', 'headache',
            'doctor', 'medical', 'treatment', 'medicine', 'body', 'sick', 'illness',
            'injury', 'infection', 'virus', 'bacteria', 'cancer', 'diabetes', 'heart',
            'blood', 'skin', 'bone', 'joint', 'mental', 'pregnancy', 'child', 'baby',
            'diet', 'exercise', 'sleep', 'stress', 'anxiety', 'depression', 'allergy',
            'asthma', 'breathing', 'stomach', 'digestion', 'liver', 'kidney', 'eye',
            'ear', 'nose', 'throat', 'dental', 'hair', 'weight', 'nutrition', 'vitamin',
            'mineral', 'hormone', 'immune', 'vaccine', 'checkup', 'examination',
            'anemia', 'blood pressure', 'cholesterol', 'arthritis', 'osteoporosis',
            'menstrual', 'pcos', 'thyroid', 'asthma', 'bronchitis', 'pneumonia',
            'sinusitis', 'allergies', 'ulcer', 'ibs', 'acid reflux', 'liver problems',
            'gallbladder', 'insomnia', 'panic attacks', 'eczema', 'psoriasis', 'acne',
            'skin cancer', 'hair loss', 'sciatica', 'sports injury', 'menopause',
            'breast health', 'child fever', 'child growth', 'child nutrition',
            'child vaccination', 'child development'
        ];
        
        const messageLower = message.toLowerCase();
        return healthKeywords.some(keyword => messageLower.includes(keyword));
    };

    // Function to Check if Question is in Hindi (including English text with Hindi meaning)
    const isHindiQuestion = (message) => {
        const hindiPattern = /[\u0900-\u097F]/; // Hindi Unicode range
        return hindiPattern.test(message);
    };

    // Function to Check if Question is in English
    const isEnglishQuestion = (message) => {
        const englishPattern = /^[a-zA-Z\s.,!?'-]+$/; // Basic English pattern
        return englishPattern.test(message);
    };

    // Function to Generate Bot Response (API or Predefined)
    const generateBotResponse = async (message) => {
        setIsTyping(true);
        
        // Check if message is health-related
        if (!isHealthRelated(message)) {
            const response = "I'm a healthcare assistant and can only help with health-related questions. Please ask about medical conditions, symptoms, treatments, or general health advice.";
            
            setChatHistory(prev => [...prev, 
                { role: "user", content: message },
                { role: "assistant", content: response }
            ]);
            setIsTyping(false);
            setTimeout(scrollToBottom, 100);
            return;
        }

        // Check if message exists in predefined Q&A
        const predefinedResponse = checkPredefinedResponse(message);
        if (predefinedResponse) {
            setChatHistory(prev => [...prev, 
                { role: "user", content: message },
                { role: "assistant", content: predefinedResponse }
            ]);
            setIsTyping(false);
            setTimeout(scrollToBottom, 100);
            return;
        }

        // For API responses, add health context with specific instructions for concise answers
        const updatedHistory = [...chatHistory, { role: "user", content: message }];
        setChatHistory(updatedHistory);

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                contents: [
                    { 
                        role: "user", 
                        parts: [{ 
                            text: "You are a healthcare assistant. Provide only essential medical information in 2-3 sentences. Include: 1) Brief condition description 2) When to see a doctor 3) Which doctor to consult. Keep responses under 50 words. Focus on accuracy and clarity." 
                        }] 
                    },
                    ...updatedHistory.map(msg => ({ 
                        role: msg.role, 
                        parts: [{ text: msg.content }] 
                    }))
                ]
            })
        };

        try {
            const response = await fetch(API_URL, requestOptions);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error.message);

            const apiResponseText = data.candidates[0].content.parts[0].text.trim();
            
            // Format API response to match our concise style
            const formattedResponse = formatApiResponse(apiResponseText);
            
            setChatHistory(prev => [...prev, { role: "assistant", content: formattedResponse }]);
            setTimeout(scrollToBottom, 100);

        } catch (error) {
            console.error(error);
            const errorMessage = "I apologize, but I'm having trouble processing your health-related question. Please try rephrasing your question or ask about a specific health concern.";
            
            setChatHistory(prev => [...prev, { 
                role: "assistant", 
                content: errorMessage
            }]);
            setTimeout(scrollToBottom, 100);
        } finally {
            setIsTyping(false);
        }
    };

    // Function to format API response to match our concise style
    const formatApiResponse = (response) => {
        // Remove any unnecessary details and keep only essential information
        const lines = response.split('\n');
        const essentialInfo = lines.filter(line => 
            line.toLowerCase().includes('doctor') || 
            line.toLowerCase().includes('seek') || 
            line.toLowerCase().includes('consult') ||
            line.toLowerCase().includes('see') ||
            line.toLowerCase().includes('visit')
        );

        if (essentialInfo.length > 0) {
            return essentialInfo.join('\n');
        }

        // If no essential info found, return a concise version of the first 2-3 sentences
        return response.split('.')
            .slice(0, 3)
            .join('.') + '.';
    };

    // Function to Handle Outgoing Messages
    const handleOutgoingMessage = () => {
        const message = messageInput.trim();
        if (!message) return;

        setMessageInput("");
        generateBotResponse(message);
    };

    const handleSuggestionClick = (question) => {
        generateBotResponse(question.text);
    };

    const handleClearChat = () => {
        setChatHistory([]);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        handleOutgoingMessage();
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleOutgoingMessage();
        }
    };

    const quickQuestions = [
        "Common cold symptoms",
        "Boost immunity"
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xl h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <motion.div 
                            whileHover={{ scale: 1.1 }}
                            className="bg-white/10 p-2 rounded-full"
                        >
                            <FaStethoscope className="w-5 h-5 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-white text-lg font-semibold"> AI HealthCare Assistant</h1>
                            <p className="text-white/80 text-xs">Your 24/7 Medical Guide</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            onClick={handleClearChat}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <FaTrash className="w-4 h-4" />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            onClick={() => window.history.back()}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <FaTimes className="w-4 h-4" />
                        </motion.button>
                    </div>
                </motion.div>

                {/* Chat Body */}
                <div className="chat-body flex-1 p-4 overflow-y-auto bg-gray-50 scrollbar-hide">
                    {/* Suggestion Questions */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 bg-gray-50 pb-4"
                    >
                        {/* Heading */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">How can I help you today?</h2>
                            <p className="text-sm text-gray-500 mt-1">Choose a topic or ask your question</p>
                        </div>

                        {/* First Row of Horizontal Questions */}
                        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide mb-3">
                            {horizontalQuestions.slice(0, 10).map((question, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    onClick={() => handleSuggestionClick(question)}
                                    className="flex-shrink-0 bg-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap w-[160px] flex items-center"
                                >
                                    {question.icon}
                                    <span className="truncate">{question.text}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Second Row of Horizontal Questions */}
                        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                            {horizontalQuestions.slice(10).map((question, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    onClick={() => handleSuggestionClick(question)}
                                    className="flex-shrink-0 bg-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-sm text-gray-700 hover:bg-gray-50 whitespace-nowrap w-[160px] flex items-center"
                                >
                                    {question.icon}
                                    <span className="truncate">{question.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Chat Messages */}
                    <div className="mt-4">
                        {chatHistory.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}
                            >
                                <div className={`rounded-xl px-4 py-2.5 max-w-[85%] ${
                                    message.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                                }`}>
                                    <div className="message-content text-sm leading-relaxed whitespace-pre-wrap break-words"
                                        dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                                    />
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start mb-4"
                            >
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <div className="thinking-indicator">
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                        <div className="dot"></div>
                                    </div>
                                    <span>AI is typing...</span>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Chat Footer */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="border-t border-gray-200 p-4 bg-white"
                >
                    <form onSubmit={handleSubmit} className="flex items-center gap-3">
                        <motion.textarea 
                            whileFocus={{ scale: 1.02 }}
                            className="message-input flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none text-sm transition-all duration-200 scrollbar-hide"
                            placeholder="Ask your health question..."
                            rows="1"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        ></motion.textarea>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                        >
                            <FaPaperPlane className="w-4 h-4" />
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Chatbot;