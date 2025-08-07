import React, { useState } from "react";
import {
  FaStethoscope,
  FaPaperPlane,
  FaTimes,
  FaTrash,
  FaQuestionCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

function Chatbot() {
  const [messageInput, setMessageInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const API_KEY = "AIzaSyBE8rlhKfxbmjl4jGLNxO68VDBvADA2684";
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const horizontalQuestions = [
    // Dental Health
    { text: "Toothache", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Gum Disease",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Cavity", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Dental Emergency",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Bad Breath", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    // Common Symptoms
    { text: "Fever", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Headache", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Cold", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Cough", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Body Pain", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    // Respiratory Issues
    { text: "Asthma", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Bronchitis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Pneumonia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Sinusitis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Allergies", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    // Heart & Blood
    {
      text: "High Blood Pressure",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Diabetes", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Anemia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Heart Disease",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Cholesterol",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    // Digestive System
    {
      text: "Acid Reflux",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "IBS", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Ulcer", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Liver Problems",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Gallbladder",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    // Mental Health
    { text: "Anxiety", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Depression", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Insomnia", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Stress", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Panic Attacks",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    // Skin Conditions
    { text: "Eczema", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Psoriasis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Acne", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Skin Cancer",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Hair Loss", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    // Bone & Joint
    { text: "Arthritis", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Osteoporosis",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Back Pain", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    { text: "Sciatica", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Sports Injury",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    // Women's Health
    {
      text: "Menstrual Issues",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Pregnancy Care",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "Menopause", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    {
      text: "Breast Health",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    { text: "PCOS", icon: <FaQuestionCircle className="w-4 h-4 mr-2" /> },
    // Children's Health
    {
      text: "Child Fever",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Child Growth",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Child Nutrition",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Child Vaccination",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
    {
      text: "Child Development",
      icon: <FaQuestionCircle className="w-4 h-4 mr-2" />,
    },
  ];

  // Comprehensive symptom variations mapping
  const symptomVariations = {
    // Common Symptoms
    fever: [
      "fever",
      "temperature",
      "hot",
      "running temperature",
      "high temperature",
      "low temperature",
      "feverish",
      "febrile",
      "pyrexia",
      "hyperthermia",
    ],
    headache: [
      "headache",
      "head pain",
      "head ache",
      "migraine",
      "cephalalgia",
      "head throbbing",
      "head pounding",
      "head pressure",
      "head tension",
    ],
    cold: [
      "cold",
      "common cold",
      "nasal congestion",
      "runny nose",
      "sneezing",
      "rhinorrhea",
      "nasal discharge",
      "upper respiratory infection",
    ],
    cough: [
      "cough",
      "coughing",
      "dry cough",
      "wet cough",
      "productive cough",
      "non-productive cough",
      "hacking cough",
      "chest congestion",
    ],
    "body pain": [
      "body pain",
      "body ache",
      "muscle pain",
      "joint pain",
      "muscle ache",
      "body soreness",
      "myalgia",
      "arthralgia",
      "body stiffness",
    ],
    "stomach pain": [
      "stomach pain",
      "stomach ache",
      "abdominal pain",
      "belly pain",
      "tummy pain",
      "gastralgia",
      "abdominal discomfort",
      "stomach cramps",
    ],

    // Dental Symptoms
    toothache: [
      "toothache",
      "tooth pain",
      "dental pain",
      "tooth ache",
      "tooth sensitivity",
      "tooth discomfort",
      "dental sensitivity",
      "tooth throbbing",
    ],
    "gum disease": [
      "gum disease",
      "gum problems",
      "gum infection",
      "gum bleeding",
      "gum pain",
      "gum swelling",
      "gingivitis",
      "periodontitis",
      "gum inflammation",
    ],
    cavity: [
      "cavity",
      "dental cavity",
      "tooth cavity",
      "dental caries",
      "tooth decay",
      "dental decay",
      "tooth rot",
      "dental hole",
      "tooth damage",
    ],
    "bad breath": [
      "bad breath",
      "halitosis",
      "mouth odor",
      "dental odor",
      "oral odor",
      "breath odor",
      "foul breath",
      "unpleasant breath",
    ],

    // Respiratory Symptoms
    asthma: [
      "asthma",
      "wheezing",
      "breathing difficulty",
      "shortness of breath",
      "chest tightness",
      "bronchial asthma",
      "respiratory distress",
    ],
    bronchitis: [
      "bronchitis",
      "chest congestion",
      "productive cough",
      "bronchial infection",
      "chest infection",
      "bronchial inflammation",
    ],
    pneumonia: [
      "pneumonia",
      "lung infection",
      "chest infection",
      "respiratory infection",
      "pulmonary infection",
      "lower respiratory infection",
    ],
    sinusitis: [
      "sinusitis",
      "sinus infection",
      "sinus pressure",
      "sinus pain",
      "nasal congestion",
      "sinus headache",
      "rhinosinusitis",
    ],
    allergies: [
      "allergies",
      "allergic reaction",
      "allergic symptoms",
      "allergic response",
      "allergen reaction",
      "hypersensitivity",
    ],

    // Heart & Blood Symptoms
    "high blood pressure": [
      "high blood pressure",
      "hypertension",
      "elevated blood pressure",
      "blood pressure high",
      "high bp",
      "hypertensive",
    ],
    diabetes: [
      "diabetes",
      "high blood sugar",
      "diabetic",
      "sugar",
      "hyperglycemia",
      "diabetes mellitus",
      "type 1 diabetes",
      "type 2 diabetes",
    ],
    anemia: [
      "anemia",
      "low blood",
      "iron deficiency",
      "low hemoglobin",
      "blood deficiency",
      "low red blood cells",
      "anemic",
    ],
    "heart disease": [
      "heart disease",
      "cardiac disease",
      "heart condition",
      "heart problem",
      "cardiac condition",
      "heart disorder",
    ],
    cholesterol: [
      "cholesterol",
      "high cholesterol",
      "lipid disorder",
      "hyperlipidemia",
      "high lipids",
      "elevated cholesterol",
    ],

    // Digestive Symptoms
    "acid reflux": [
      "acid reflux",
      "heartburn",
      "gastroesophageal reflux",
      "gerd",
      "reflux",
      "stomach acid",
      "acid regurgitation",
    ],
    ibs: [
      "ibs",
      "irritable bowel syndrome",
      "bowel problems",
      "digestive issues",
      "intestinal problems",
      "bowel disorder",
    ],
    ulcer: [
      "ulcer",
      "stomach ulcer",
      "peptic ulcer",
      "gastric ulcer",
      "duodenal ulcer",
      "ulcer pain",
      "ulcer symptoms",
    ],
    "liver problems": [
      "liver problems",
      "liver disease",
      "liver condition",
      "hepatic disease",
      "liver disorder",
      "liver dysfunction",
    ],
    gallbladder: [
      "gallbladder",
      "gallbladder problems",
      "gallbladder disease",
      "gallbladder pain",
      "gallbladder attack",
      "biliary colic",
    ],

    // Mental Health Symptoms
    anxiety: [
      "anxiety",
      "anxious",
      "panic",
      "worry",
      "nervousness",
      "anxiety attack",
      "panic attack",
      "anxiety disorder",
    ],
    depression: [
      "depression",
      "depressed",
      "sadness",
      "mood disorder",
      "clinical depression",
      "major depression",
      "depressive",
    ],
    insomnia: [
      "insomnia",
      "sleeplessness",
      "sleep problems",
      "sleep disorder",
      "trouble sleeping",
      "inability to sleep",
    ],
    stress: [
      "stress",
      "stressed",
      "pressure",
      "tension",
      "overwhelmed",
      "stress symptoms",
      "stress disorder",
    ],
    "panic attacks": [
      "panic attack",
      "panic disorder",
      "anxiety attack",
      "panic symptoms",
      "acute anxiety",
      "panic episode",
    ],

    // Skin Symptoms
    eczema: [
      "eczema",
      "atopic dermatitis",
      "skin rash",
      "skin inflammation",
      "dermatitis",
      "skin irritation",
      "itchy skin",
    ],
    psoriasis: [
      "psoriasis",
      "skin condition",
      "scaly skin",
      "skin disorder",
      "psoriatic",
      "skin inflammation",
    ],
    acne: [
      "acne",
      "pimples",
      "zits",
      "skin breakouts",
      "acne vulgaris",
      "skin blemishes",
      "facial acne",
    ],
    "skin cancer": [
      "skin cancer",
      "melanoma",
      "basal cell carcinoma",
      "squamous cell carcinoma",
      "skin tumor",
      "skin lesion",
    ],
    "hair loss": [
      "hair loss",
      "alopecia",
      "balding",
      "thinning hair",
      "hair thinning",
      "hair fall",
      "hair shedding",
    ],

    // Bone & Joint Symptoms
    arthritis: [
      "arthritis",
      "joint pain",
      "joint inflammation",
      "rheumatoid arthritis",
      "osteoarthritis",
      "joint stiffness",
    ],
    osteoporosis: [
      "osteoporosis",
      "bone loss",
      "weak bones",
      "bone thinning",
      "bone density loss",
      "fragile bones",
    ],
    "back pain": [
      "back pain",
      "lower back pain",
      "upper back pain",
      "spinal pain",
      "backache",
      "back discomfort",
    ],
    sciatica: [
      "sciatica",
      "sciatic pain",
      "nerve pain",
      "leg pain",
      "back pain",
      "nerve compression",
    ],
    "sports injury": [
      "sports injury",
      "athletic injury",
      "sports trauma",
      "sports accident",
      "athletic trauma",
    ],

    // Women's Health Symptoms
    "menstrual issues": [
      "menstrual issues",
      "period problems",
      "menstrual pain",
      "period pain",
      "menstrual cramps",
      "dysmenorrhea",
    ],
    "pregnancy care": [
      "pregnancy",
      "pregnant",
      "prenatal",
      "maternal health",
      "pregnancy symptoms",
      "pregnancy care",
    ],
    menopause: [
      "menopause",
      "menopausal",
      "hot flashes",
      "menopause symptoms",
      "perimenopause",
      "post-menopause",
    ],
    "breast health": [
      "breast health",
      "breast problems",
      "breast pain",
      "breast changes",
      "breast symptoms",
    ],
    pcos: [
      "pcos",
      "polycystic ovary syndrome",
      "hormonal disorder",
      "ovarian cysts",
      "hormone imbalance",
    ],

    // Children's Health Symptoms
    "child fever": [
      "child fever",
      "baby fever",
      "pediatric fever",
      "infant fever",
      "child temperature",
      "baby temperature",
    ],
    "child growth": [
      "child growth",
      "growth problems",
      "growth delay",
      "developmental delay",
      "child development",
    ],
    "child nutrition": [
      "child nutrition",
      "pediatric nutrition",
      "child diet",
      "baby nutrition",
      "child feeding",
    ],
    "child vaccination": [
      "child vaccination",
      "baby vaccination",
      "pediatric vaccination",
      "immunization",
      "child shots",
    ],
    "child development": [
      "child development",
      "developmental delay",
      "child milestones",
      "developmental problems",
      "child progress",
    ],
  };

  // Update predefined responses with care information
  const predefinedQA = {
    // Basic Greetings with Health Context
    hi: "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    hello:
      "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    hey: "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    "good morning":
      "Good morning! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    "good afternoon":
      "Good afternoon! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    "good evening":
      "Good evening! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    "good night":
      "Good night! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    bye: "Take care! If you have any health concerns, feel free to ask. Remember to prioritize your health and well-being. Goodbye!",
    goodbye:
      "Take care! If you have any health concerns, feel free to ask. Remember to prioritize your health and well-being. Goodbye!",
    thanks:
      "You're welcome! Remember, I'm here to help with any health-related questions or concerns you may have. Take care of your health!",
    "thank you":
      "You're welcome! Remember, I'm here to help with any health-related questions or concerns you may have. Take care of your health!",
    please:
      "I'm here to help with your health concerns. Please feel free to ask any medical questions or seek advice about your well-being.",
    sorry:
      "No need to apologize! I'm here to help with your health concerns. Please feel free to ask any medical questions or seek advice about your well-being.",
    "excuse me":
      "I'm here to help with your health concerns. Please feel free to ask any medical questions or seek advice about your well-being.",

    // Common Questions with Health Context
    "what is your name":
      "I'm your AI Healthcare Assistant, designed to provide medical information and care instructions. How can I help you with your health concerns today?",
    "who are you":
      "I'm your AI Healthcare Assistant, designed to provide medical information and care instructions. How can I help you with your health concerns today?",
    "what can you do":
      "I can help you with medical conditions, symptoms, treatments, doctor recommendations, and general health advice. What health concerns would you like to discuss?",
    "how are you":
      "I'm ready to help you with your health-related questions! What health concerns would you like to discuss?",
    "are you real":
      "I'm an AI healthcare assistant designed to provide medical information and care instructions. How can I help you with your health concerns today?",
    "are you human":
      "I'm an AI healthcare assistant designed to provide medical information and care instructions. How can I help you with your health concerns today?",
    "are you a bot":
      "I'm an AI healthcare assistant designed to provide medical information and care instructions. How can I help you with your health concerns today?",
    "are you ai":
      "I'm an AI healthcare assistant designed to provide medical information and care instructions. How can I help you with your health concerns today?",

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

    headache: `Headache Information:

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

    fever: `Fever Information:

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

    cough: `Cough Information:

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
    asthma: `Asthma Information:

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

    bronchitis: `Bronchitis Information:

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

    pneumonia: `Pneumonia Information:

Care Instructions:
Complete prescribed antibiotics
Rest and stay hydrated
Use humidifier
Monitor oxygen levels

Seek immediate medical attention if:
Difficulty breathing
High fever
Chest pain
Confusion

Consult these doctors:
Pulmonologist for lung infection
Infectious Disease Specialist for severe cases
Emergency Department for breathing problems
Pediatrician for children with pneumonia`,

    sinusitis: `Sinusitis Information:

Care Instructions:
Use saline nasal spray
Stay hydrated
Apply warm compress
Take prescribed medicines

Seek immediate medical attention if:
Severe headache
Vision changes
High fever
Swelling around eyes

Consult these doctors:
ENT Specialist for sinus issues
Allergist for allergy-related sinusitis
General Physician for initial assessment
Emergency Department for severe symptoms`,

    allergies: `Allergies Information:

Care Instructions:
Avoid allergens
Take prescribed antihistamines
Use air purifier
Keep windows closed

Seek immediate medical attention if:
Difficulty breathing
Swelling of face/tongue
Severe hives
Anaphylaxis symptoms

Consult these doctors:
Allergist for allergy testing
ENT Specialist for sinus allergies
Emergency Department for severe reactions
Pediatrician for children with allergies`,

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

    diabetes: `Diabetes Information:

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

    anemia: `Anemia Information:

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

    "heart disease": `Heart Disease Information:

Care Instructions:
Follow heart-healthy diet
Regular exercise
Take prescribed medicines
Monitor blood pressure

Seek immediate medical attention if:
Chest pain
Shortness of breath
Irregular heartbeat
Severe fatigue

Consult these doctors:
Cardiologist for heart conditions
Cardiothoracic Surgeon for surgery
Emergency Department for chest pain
General Physician for monitoring`,

    cholesterol: `Cholesterol Information:

Care Instructions:
Follow low-fat diet
Regular exercise
Take prescribed medicines
Monitor levels regularly

Seek immediate medical attention if:
Chest pain
Shortness of breath
Severe dizziness
Vision changes

Consult these doctors:
Cardiologist for heart health
Endocrinologist for metabolic issues
General Physician for monitoring
Nutritionist for diet advice`,

    // Digestive System
    "acid reflux": `Acid Reflux Information:

Care Instructions:
Eat smaller meals
Avoid trigger foods
Elevate head while sleeping
Take prescribed medicines

Seek immediate medical attention if:
Severe chest pain
Difficulty swallowing
Vomiting blood
Weight loss

Consult these doctors:
Gastroenterologist for digestive issues
ENT Specialist for throat problems
General Physician for initial assessment
Emergency Department for severe pain`,

    ibs: `IBS Information:

Care Instructions:
Identify trigger foods
Manage stress
Stay hydrated
Take prescribed medicines

Seek immediate medical attention if:
Severe abdominal pain
Blood in stool
Weight loss
Persistent diarrhea

Consult these doctors:
Gastroenterologist for digestive issues
Nutritionist for diet advice
General Physician for monitoring
Mental Health Specialist for stress management`,

    ulcer: `Ulcer Information:

Care Instructions:
Avoid spicy foods
Take prescribed medicines
Eat small, frequent meals
Manage stress

Seek immediate medical attention if:
Severe abdominal pain
Vomiting blood
Black stools
Sudden weight loss

Consult these doctors:
Gastroenterologist for digestive issues
General Physician for initial assessment
Emergency Department for severe pain
Nutritionist for diet advice`,

    "liver problems": `Liver Problems Information:

Care Instructions:
Avoid alcohol
Follow liver-friendly diet
Take prescribed medicines
Rest adequately

Seek immediate medical attention if:
Jaundice
Severe abdominal pain
Confusion
Bleeding easily

Consult these doctors:
Hepatologist for liver issues
Gastroenterologist for digestive problems
General Physician for monitoring
Emergency Department for severe symptoms`,

    gallbladder: `Gallbladder Information:

Care Instructions:
Follow low-fat diet
Stay hydrated
Take prescribed medicines
Avoid trigger foods

Seek immediate medical attention if:
Severe abdominal pain
Jaundice
High fever
Nausea and vomiting

Consult these doctors:
Gastroenterologist for digestive issues
General Surgeon for surgery
Emergency Department for severe pain
General Physician for monitoring`,

    // Mental Health
    anxiety: `Anxiety Information:

Care Instructions:
Practice deep breathing
Regular exercise
Get adequate sleep
Take prescribed medicines

Seek immediate medical attention if:
Severe panic attacks
Suicidal thoughts
Difficulty breathing
Chest pain

Consult these doctors:
Psychiatrist for medication
Psychologist for therapy
General Physician for initial assessment
Emergency Department for severe symptoms`,

    depression: `Depression Information:

Care Instructions:
Maintain routine
Stay connected
Regular exercise
Take prescribed medicines

Seek immediate medical attention if:
Suicidal thoughts
Severe hopelessness
Difficulty functioning
Extreme fatigue

Consult these doctors:
Psychiatrist for medication
Psychologist for therapy
General Physician for initial assessment
Emergency Department for severe symptoms`,

    insomnia: `Insomnia Information:

Care Instructions:
Maintain sleep schedule
Create bedtime routine
Avoid screens before bed
Take prescribed medicines

Seek immediate medical attention if:
Severe sleep deprivation
Hallucinations
Extreme fatigue
Difficulty functioning

Consult these doctors:
Sleep Specialist for sleep disorders
Psychiatrist for mental health issues
General Physician for initial assessment
Neurologist for neurological causes`,

    stress: `Stress Information:

Care Instructions:
Practice relaxation techniques
Regular exercise
Maintain work-life balance
Get adequate sleep

Seek immediate medical attention if:
Severe anxiety
Chest pain
Difficulty breathing
Extreme fatigue

Consult these doctors:
Psychiatrist for medication
Psychologist for therapy
General Physician for physical symptoms
Emergency Department for severe symptoms`,

    "panic attacks": `Panic Attacks Information:

Care Instructions:
Practice breathing exercises
Identify triggers
Take prescribed medicines
Stay grounded

Seek immediate medical attention if:
Severe chest pain
Difficulty breathing
Fainting
Severe dizziness

Consult these doctors:
Psychiatrist for medication
Psychologist for therapy
Emergency Department for severe attacks
General Physician for initial assessment`,

    // Skin Conditions
    eczema: `Eczema Information:

Care Instructions:
Keep skin moisturized
Avoid triggers
Use prescribed creams
Take lukewarm baths

Seek immediate medical attention if:
Severe itching
Infected skin
Fever with rash
Widespread rash

Consult these doctors:
Dermatologist for skin issues
Allergist for allergy triggers
General Physician for initial assessment
Emergency Department for severe reactions`,

    psoriasis: `Psoriasis Information:

Care Instructions:
Keep skin moisturized
Avoid triggers
Use prescribed treatments
Protect from sun

Seek immediate medical attention if:
Severe itching
Joint pain
Infected skin
Widespread rash

Consult these doctors:
Dermatologist for skin issues
Rheumatologist for joint problems
General Physician for monitoring
Emergency Department for severe reactions`,

    acne: `Acne Information:

Care Instructions:
Keep face clean
Use prescribed treatments
Avoid touching face
Protect from sun

Seek immediate medical attention if:
Severe inflammation
Infected cysts
Fever with acne
Severe scarring

Consult these doctors:
Dermatologist for skin issues
General Physician for initial assessment
Emergency Department for severe infections
Cosmetic Surgeon for scarring`,

    "skin cancer": `Skin Cancer Information:

Care Instructions:
Protect from sun
Regular skin checks
Use sunscreen
Monitor changes

Seek immediate medical attention if:
New or changing moles
Bleeding lesions
Rapid growth
Severe itching

Consult these doctors:
Dermatologist for skin cancer
Oncologist for cancer treatment
General Physician for initial assessment
Emergency Department for severe symptoms`,

    "hair loss": `Hair Loss Information:

Care Instructions:
Gentle hair care
Balanced diet
Manage stress
Use prescribed treatments

Seek immediate medical attention if:
Sudden hair loss
Scalp inflammation
Severe itching
Infection signs

Consult these doctors:
Dermatologist for hair issues
Endocrinologist for hormonal causes
General Physician for initial assessment
Trichologist for specialized care`,

    // Bone & Joint
    arthritis: `Arthritis Information:

Care Instructions:
Gentle exercise
Protect joints
Take prescribed medicines
Use hot/cold therapy

Seek immediate medical attention if:
Severe joint pain
Joint deformity
Fever with joint pain
Difficulty moving

Consult these doctors:
Rheumatologist for arthritis
Orthopedist for joint issues
Physiotherapist for exercises
General Physician for monitoring`,

    osteoporosis: `Osteoporosis Information:

Care Instructions:
Weight-bearing exercise
Calcium-rich diet
Take prescribed medicines
Prevent falls

Seek immediate medical attention if:
Sudden back pain
Height loss
Fractures
Severe pain

Consult these doctors:
Orthopedist for bone issues
Endocrinologist for hormonal causes
Physiotherapist for exercises
General Physician for monitoring`,

    sciatica: `Sciatica Information:

Care Instructions:
Gentle stretching
Take prescribed medicines
Use hot/cold therapy
Maintain posture

Seek immediate medical attention if:
Severe pain
Loss of bladder control
Numbness in legs
Difficulty walking

Consult these doctors:
Neurologist for nerve issues
Orthopedist for spine problems
Physiotherapist for exercises
General Physician for initial assessment`,

    "sports injury": `Sports Injury Information:

Care Instructions:
Rest injured area
Apply ice/heat
Take prescribed medicines
Gentle rehabilitation

Seek immediate medical attention if:
Severe pain
Swelling
Deformity
Loss of function

Consult these doctors:
Orthopedist for bone/joint issues
Sports Medicine Specialist for injuries
Physiotherapist for rehabilitation
Emergency Department for severe injuries`,

    // Women's Health
    "menstrual issues": `Menstrual Issues Information:

Care Instructions:
Track menstrual cycle
Manage pain with prescribed medicines
Stay hydrated
Rest when needed

Seek immediate medical attention if:
Severe pain
Heavy bleeding
Fainting
Severe cramps

Consult these doctors:
Gynecologist for women's health
Endocrinologist for hormonal issues
General Physician for initial assessment
Emergency Department for severe symptoms`,

    "pregnancy care": `Pregnancy Care Information:

Care Instructions:
Regular prenatal care
Take prescribed vitamins
Stay hydrated
Get adequate rest

Seek immediate medical attention if:
Vaginal bleeding
Severe pain
Contractions
Decreased fetal movement

Consult these doctors:
Obstetrician for pregnancy care
Gynecologist for women's health
Pediatrician for newborn care
Emergency Department for severe symptoms`,

    menopause: `Menopause Information:

Care Instructions:
Manage symptoms with prescribed medicines
Stay active
Maintain healthy diet
Get adequate sleep

Seek immediate medical attention if:
Severe hot flashes
Heavy bleeding
Severe mood changes
Chest pain

Consult these doctors:
Gynecologist for women's health
Endocrinologist for hormonal issues
General Physician for monitoring
Mental Health Specialist for mood changes`,

    "breast health": `Breast Health Information:

Care Instructions:
Regular self-exams
Mammograms as recommended
Maintain healthy lifestyle
Protect from sun

Seek immediate medical attention if:
New lumps
Breast changes
Nipple discharge
Severe pain

Consult these doctors:
Gynecologist for women's health
Oncologist for cancer concerns
General Physician for initial assessment
Emergency Department for severe symptoms`,

    pcos: `PCOS Information:

Care Instructions:
Manage weight
Regular exercise
Take prescribed medicines
Monitor symptoms

Seek immediate medical attention if:
Severe pain
Heavy bleeding
Difficulty breathing
Chest pain

Consult these doctors:
Gynecologist for women's health
Endocrinologist for hormonal issues
General Physician for monitoring
Nutritionist for diet advice`,

    // Children's Health
    "child fever": `Child Fever Information:

Care Instructions:
Monitor temperature
Keep child hydrated
Use prescribed medicines
Rest adequately

Seek immediate medical attention if:
Temperature above 103°F
Seizures
Difficulty breathing
Severe lethargy

Consult these doctors:
Pediatrician for children's health
Emergency Department for severe symptoms
General Physician for initial assessment
Infectious Disease Specialist for persistent fever`,

    "child growth": `Child Growth Information:

Care Instructions:
Balanced nutrition
Regular exercise
Adequate sleep
Regular check-ups

Seek immediate medical attention if:
Growth delays
Severe pain
Difficulty moving
Extreme fatigue

Consult these doctors:
Pediatrician for children's health
Endocrinologist for growth issues
Nutritionist for diet advice
General Physician for monitoring`,

    "child nutrition": `Child Nutrition Information:

Care Instructions:
Balanced diet
Regular meals
Limit processed foods
Stay hydrated

Seek immediate medical attention if:
Severe weight loss
Growth delays
Extreme fatigue
Nutritional deficiencies

Consult these doctors:
Pediatrician for children's health
Nutritionist for diet advice
General Physician for monitoring
Emergency Department for severe symptoms`,

    "child vaccination": `Child Vaccination Information:

Care Instructions:
Follow vaccination schedule
Monitor for reactions
Keep records updated
Stay informed

Seek immediate medical attention if:
Severe reactions
High fever
Difficulty breathing
Severe swelling

Consult these doctors:
Pediatrician for children's health
General Physician for vaccinations
Emergency Department for severe reactions
Public Health Specialist for schedule`,

    "child development": `Child Development Information:

Care Instructions:
Provide stimulation
Regular check-ups
Monitor milestones
Encourage learning

Seek immediate medical attention if:
Development delays
Regression
Severe behavioral issues
Learning difficulties

Consult these doctors:
Pediatrician for children's health
Child Psychologist for behavioral issues
Developmental Specialist for delays
General Physician for monitoring`,

    // Dental Health
    toothache: `Toothache Information:

Care Instructions:
Rinse with warm salt water
Apply cold compress
Take prescribed pain relievers
Avoid hot/cold foods

Seek immediate medical attention if:
Severe pain
Swelling in face/jaw
Fever with pain
Difficulty breathing

Consult these doctors:
Dentist for dental issues
Endodontist for root canal
Oral Surgeon for severe cases
Emergency Department for severe swelling`,

    "gum disease": `Gum Disease Information:

Care Instructions:
Brush twice daily
Floss regularly
Use antiseptic mouthwash
Regular dental check-ups

Seek immediate medical attention if:
Severe bleeding
Loose teeth
Severe pain
Swollen gums

Consult these doctors:
Dentist for dental care
Periodontist for gum treatment
Oral Surgeon for severe cases
Emergency Department for severe bleeding`,

    cavity: `Cavity Information:

Care Instructions:
Maintain oral hygiene
Limit sugary foods
Use fluoride toothpaste
Regular dental visits

Seek immediate medical attention if:
Severe tooth pain
Swelling
Fever
Difficulty eating

Consult these doctors:
Dentist for cavity treatment
Endodontist for deep cavities
Pediatric Dentist for children
Emergency Department for severe pain`,

    "wisdom teeth": `Wisdom Teeth Information:

Care Instructions:
Maintain oral hygiene
Use warm salt water rinse
Take prescribed pain relievers
Soft food diet

Seek immediate medical attention if:
Severe pain
Swelling
Difficulty opening mouth
Fever

Consult these doctors:
Dentist for initial assessment
Oral Surgeon for removal
Maxillofacial Surgeon for complex cases
Emergency Department for severe swelling`,

    "bad breath": `Bad Breath Information:

Care Instructions:
Brush teeth and tongue
Floss daily
Stay hydrated
Regular dental check-ups

Seek immediate medical attention if:
Severe pain
Swelling
Difficulty breathing
Fever

Consult these doctors:
Dentist for oral health
ENT Specialist for sinus issues
Gastroenterologist for digestive causes
General Physician for underlying conditions`,

    "tooth sensitivity": `Tooth Sensitivity Information:

Care Instructions:
Use sensitivity toothpaste
Avoid acidic foods
Gentle brushing
Regular dental visits

Seek immediate medical attention if:
Severe pain
Swelling
Fever
Difficulty eating

Consult these doctors:
Dentist for dental care
Endodontist for nerve issues
Pediatric Dentist for children
Emergency Department for severe pain`,

    "oral cancer": `Oral Cancer Information:

Care Instructions:
Regular dental check-ups
Avoid tobacco/alcohol
Protect from sun
Maintain oral hygiene

Seek immediate medical attention if:
Persistent sores
Difficulty swallowing
Lump in mouth
Unexplained bleeding

Consult these doctors:
Dentist for initial screening
Oral Surgeon for surgery
Oncologist for cancer treatment
ENT Specialist for throat issues`,

    "dental abscess": `Dental Abscess Information:

Care Instructions:
Take prescribed antibiotics
Rinse with salt water
Avoid hot/cold foods
Regular dental visits

Seek immediate medical attention if:
Severe pain
Swelling in face
Fever
Difficulty breathing

Consult these doctors:
Dentist for dental care
Endodontist for root canal
Oral Surgeon for drainage
Emergency Department for severe swelling`,

    "teeth grinding": `Teeth Grinding Information:

Care Instructions:
Use night guard
Manage stress
Avoid caffeine
Regular dental check-ups

Seek immediate medical attention if:
Severe pain
Jaw locking
Headaches
Difficulty eating

Consult these doctors:
Dentist for dental care
Orthodontist for bite issues
TMJ Specialist for jaw problems
Sleep Specialist for sleep-related grinding`,

    "dental trauma": `Dental Trauma Information:

Care Instructions:
Save broken tooth pieces
Rinse with water
Apply cold compress
Seek immediate dental care

Seek immediate medical attention if:
Severe bleeding
Knocked out tooth
Severe pain
Swelling

Consult these doctors:
Dentist for dental care
Oral Surgeon for severe trauma
Emergency Department for immediate care
Pediatric Dentist for children`,

    "oral thrush": `Oral Thrush Information:

Care Instructions:
Maintain oral hygiene
Use prescribed antifungal
Rinse mouth regularly
Regular dental visits

Seek immediate medical attention if:
Difficulty swallowing
Severe pain
Fever
Spread to throat

Consult these doctors:
Dentist for oral care
Infectious Disease Specialist for severe cases
Pediatrician for children
Emergency Department for severe symptoms`,

    "dental implants": `Dental Implants Information:

Care Instructions:
Follow post-surgery care
Maintain oral hygiene
Soft food diet
Regular check-ups

Seek immediate medical attention if:
Severe pain
Swelling
Bleeding
Fever

Consult these doctors:
Dentist for dental care
Oral Surgeon for surgery
Periodontist for gum health
Emergency Department for severe complications`,

    "orthodontic issues": `Orthodontic Issues Information:

Care Instructions:
Follow orthodontist instructions
Maintain oral hygiene
Avoid hard foods
Regular adjustments

Seek immediate medical attention if:
Severe pain
Broken braces
Difficulty breathing
Severe bleeding

Consult these doctors:
Orthodontist for braces
Dentist for general care
Oral Surgeon for severe cases
Emergency Department for severe pain`,

    "dental emergency": `Dental Emergency Information:

Care Instructions:
Save broken teeth
Control bleeding
Apply cold compress
Seek immediate care

Seek immediate medical attention if:
Severe pain
Swelling
Bleeding
Difficulty breathing

Consult these doctors:
Emergency Department for immediate care
Dentist for dental issues
Oral Surgeon for severe cases
Pediatric Dentist for children`,
  };

  // Function to calculate string similarity (Levenshtein distance)
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    return (longer.length - editDistance(longer, shorter)) / longer.length;
  };

  // Function to calculate edit distance between two strings
  const editDistance = (s1, s2) => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = [];
    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  };

  // Function to find closest match from predefined answers
  const findClosestMatch = (message) => {
    const messageLower = message.toLowerCase();
    let bestMatch = null;
    let bestSimilarity = 0;
    const SIMILARITY_THRESHOLD = 0.6; // Lowered threshold to 60% for better matching

    // Common misspellings mapping
    const commonMisspellings = {
      faver: "fever",
      fevr: "fever",
      fevor: "fever",
      hedache: "headache",
      hedake: "headache",
      toothake: "toothache",
      stomak: "stomach",
      stomache: "stomach",
      diabetis: "diabetes",
      diabetus: "diabetes",
      artritis: "arthritis",
      artrithis: "arthritis",
      bronkitis: "bronchitis",
      bronchytis: "bronchitis",
      pnemonia: "pneumonia",
      pnumonia: "pneumonia",
      sinusytis: "sinusitis",
      sinusytus: "sinusitis",
      alergis: "allergies",
      alergys: "allergies",
      blod: "blood",
      blud: "blood",
      presure: "pressure",
      cholestrol: "cholesterol",
      ulser: "ulcer",
      depresion: "depression",
      anxity: "anxiety",
      insomnia: "insomnia",
      stres: "stress",
      panik: "panic",
      ekzema: "eczema",
      psorisis: "psoriasis",
      akne: "acne",
      canser: "cancer",
      hairloss: "hair loss",
      ostioporosis: "osteoporosis",
      backpain: "back pain",
      sciatika: "sciatica",
      injery: "injury",
      menstral: "menstrual",
      pregnanse: "pregnancy",
      menopaus: "menopause",
      brest: "breast",
      pcos: "pcos",
      childfever: "child fever",
      childgrowt: "child growth",
      childnutriton: "child nutrition",
      childvax: "child vaccination",
      childdev: "child development",
    };

    // First check for common misspellings
    if (commonMisspellings[messageLower]) {
      return predefinedQA[commonMisspellings[messageLower]];
    }

    // Check all predefined answers
    for (const [key] of Object.entries(predefinedQA)) {
      const similarity = calculateSimilarity(messageLower, key);
      if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
        bestSimilarity = similarity;
        bestMatch = key;
      }
    }

    return bestMatch;
  };

  // Function to Check if Question is Health-Related
  const isHealthRelated = (message) => {
    const messageLower = message.toLowerCase().trim();

    // Allow basic greetings and common questions
    const allowedPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening|good night|bye|goodbye|thanks|thank you|please|sorry|excuse me)$/i,
      /^(what is your name|who are you|what can you do|how are you|are you real|are you human|are you a bot|are you ai)$/i,
    ];

    if (allowedPatterns.some((pattern) => pattern.test(messageLower))) {
      return true;
    }

    // Check if message exists in predefinedQA
    if (predefinedQA[messageLower]) {
      return true;
    }

    // Comprehensive health keywords list
    const healthKeywords = [
      // Symptoms
      "symptom",
      "pain",
      "fever",
      "cough",
      "headache",
      "ache",
      "swelling",
      "bleeding",
      "nausea",
      "vomiting",
      "diarrhea",
      "constipation",
      "fatigue",
      "weakness",
      "dizziness",
      "rash",
      "itch",
      "burning",
      "sore",
      "stiff",
      "numb",
      "tingling",
      "cramp",
      "spasm",

      // Body Parts
      "head",
      "neck",
      "back",
      "chest",
      "stomach",
      "abdomen",
      "arm",
      "leg",
      "hand",
      "foot",
      "eye",
      "ear",
      "nose",
      "throat",
      "mouth",
      "teeth",
      "gum",
      "tongue",
      "lip",
      "skin",
      "heart",
      "lung",
      "liver",
      "kidney",
      "brain",
      "bone",
      "joint",
      "muscle",
      "nerve",

      // Conditions
      "disease",
      "infection",
      "virus",
      "bacteria",
      "fungus",
      "injury",
      "wound",
      "cut",
      "bruise",
      "fracture",
      "sprain",
      "strain",
      "cancer",
      "diabetes",
      "asthma",
      "allergy",
      "ulcer",
      "inflammation",
      "swelling",
      "tumor",
      "cyst",
      "abscess",
      "rash",
      "blister",

      // Medical Terms
      "medical",
      "health",
      "doctor",
      "hospital",
      "clinic",
      "medicine",
      "treatment",
      "therapy",
      "diagnosis",
      "prognosis",
      "prescription",
      "medicine",
      "drug",
      "vaccine",
      "immunization",
      "checkup",
      "examination",
      "test",
      "scan",
      "x-ray",
      "mri",
      "ct",
      "ultrasound",

      // Health Categories
      "dental",
      "mental",
      "physical",
      "emotional",
      "psychological",
      "neurological",
      "cardiovascular",
      "respiratory",
      "digestive",
      "endocrine",
      "immune",
      "reproductive",

      // Treatments
      "treatment",
      "cure",
      "remedy",
      "medicine",
      "drug",
      "therapy",
      "surgery",
      "operation",
      "procedure",
      "rehabilitation",
      "recovery",
      "healing",
      "prevention",
      "preventive",

      // Lifestyle
      "diet",
      "nutrition",
      "exercise",
      "fitness",
      "sleep",
      "rest",
      "stress",
      "anxiety",
      "depression",
      "weight",
      "obesity",
      "hypertension",
      "cholesterol",
      "vitamin",
      "mineral",

      // Special Populations
      "pregnancy",
      "child",
      "baby",
      "infant",
      "elderly",
      "senior",
      "adult",
      "pediatric",
      "maternal",
      "prenatal",
      "postnatal",
      "menstrual",
      "menopause",
      "hormone",
      "thyroid",

      // Emergency Terms
      "emergency",
      "urgent",
      "acute",
      "severe",
      "critical",
      "life-threatening",
      "dangerous",
      "poison",
      "overdose",
      "allergic",
      "reaction",
      "shock",
      "bleeding",
      "unconscious",

      // Common Health Questions
      "what should i do",
      "how to treat",
      "how to cure",
      "how to prevent",
      "what causes",
      "what are the symptoms",
      "what are the signs",
      "when to see a doctor",
      "which doctor",
      "how long",
      "how often",
      "how much",
      "how many",
      "is it serious",
      "is it dangerous",

      // Additional Patient Questions
      "can you help me",
      "i need help",
      "i have a problem",
      "i am worried about",
      "what medicine should i take",
      "which medicine is best",
      "is there any medicine",
      "do i need surgery",
      "is surgery required",
      "what are the treatment options",
      "what are the side effects",
      "is it contagious",
      "can it spread",
      "how long will it take to recover",
      "when will i feel better",
      "will i get better",
      "what should i eat",
      "what foods to avoid",
      "diet recommendations",
      "can i exercise",
      "should i rest",
      "how much rest do i need",
      "is it normal",
      "is this common",
      "should i be worried",
      "what are the complications",
      "what could happen",
      "is it life threatening",
      "do i need tests",
      "what tests are required",
      "do i need blood test",
      "can it be cured",
      "is there a cure",
      "will it come back",
      "is it hereditary",
      "runs in family",
      "genetic condition",
      "home remedies",
      "natural treatment",
      "alternative medicine",
      "emergency symptoms",
      "warning signs",
      "red flags",
      "second opinion",
      "specialist doctor",
      "expert consultation",
      "vaccination needed",
      "preventive measures",
      "how to protect",
      "recovery time",
      "healing period",
      "when can i resume work",
      "follow up needed",
      "next appointment",
      "regular checkup",
      "medical history",
      "previous conditions",
      "related problems",
      "age related",
      "common in children",
      "affects elderly",
      "lifestyle changes",
      "habits to change",
      "what to avoid",
      "prescription needed",
      "over the counter",
      "pharmacy medicine",
      "cost of treatment",
      "insurance coverage",
      "medical expenses",
      "new symptoms",
      "getting worse",
      "not improving",
      "seasonal problem",
      "weather effects",
      "environmental factors",
      "mental health",
      "emotional support",
      "counseling needed",
      "pregnancy safe",
      "breastfeeding safe",
      "child safe",
      "emergency care",
      "urgent care",
      "hospital visit",
      "chronic condition",
      "long term effects",
      "permanent damage",
      "disability",
      "work limitation",
      "daily activities",
      "pain management",
      "pain relief",
      "reduce pain",
      "medical procedure",
      "operation details",
      "surgical options",
      "rehabilitation",
      "physical therapy",
      "occupational therapy",
      "alternative treatment",
      "complementary medicine",
      "holistic approach",
      "medical equipment",
      "devices needed",
      "mobility aids",
      "support groups",
      "patient communities",
      "care services",
      "clinical trials",
      "new treatments",
      "research studies",
      "medical records",
      "health documents",
      "test reports",
      "travel restrictions",
      "activity limitations",
      "lifestyle impact",
      "family planning",
      "fertility issues",
      "reproductive health",
      "dental care",
      "oral health",
      "teeth problems",
      "eye care",
      "vision problems",
      "optical issues",
      "hearing problems",
      "ear issues",
      "auditory concerns",
      "skin care",
      "dermatological issues",
      "cosmetic concerns",
      "weight management",
      "obesity issues",
      "diet control",
      "vaccination schedule",
      "immunization records",
      "booster shots",
      "medical cannabis",
      "alternative therapy",
      "pain medication",
      "organ donation",
      "transplant options",
      "medical procedures",
      "blood tests",
      "diagnostic tests",
      "screening tests",
      "medical history",
      "family history",
      "genetic testing",
      "medical emergency",
      "urgent care",
      "immediate attention",
      "specialist referral",
      "doctor recommendation",
      "medical opinion",
      "treatment plan",
      "care protocol",
      "medical regimen",
      "recovery timeline",
      "healing process",
      "rehabilitation period",
      "medical costs",
      "insurance coverage",
      "payment options",
      "side effects",
      "adverse reactions",
      "complications",
      "medical certificates",
      "health documents",
      "medical reports",
      "travel clearance",
      "fit to fly",
      "medical restrictions",
      "work restrictions",
      "medical leave",
      "sick note",
      "follow up care",
      "post treatment",
      "ongoing care",
      "preventive care",
      "health screening",
      "regular checkups",
      "lifestyle modifications",
      "behavioral changes",
      "habit changes",
      "medical equipment",
      "assistive devices",
      "mobility aids",
      "home care",
      "nursing care",
      "palliative care",
      "emergency contacts",
      "medical helpline",
      "healthcare support",
      "medical research",
      "clinical studies",
      "treatment advances",
      "alternative medicine",
      "complementary therapy",
      "natural remedies",
      "medical tourism",
      "overseas treatment",
      "healthcare abroad",
      "telemedicine",
      "online consultation",
      "virtual doctor",
      "medical insurance",
      "health coverage",
      "medical benefits",
      "medical transportation",
      "ambulance service",
      "patient transfer",
      "organ transplant",
      "tissue donation",
      "medical procedures",
      "blood donation",
      "plasma therapy",
      "transfusion services",
      "vaccination records",
      "immunization history",
      "medical records",
      "medical education",
      "health awareness",
      "patient information",
      "medical compliance",
      "treatment adherence",
      "medication schedule",
      "medical devices",
      "health gadgets",
      "monitoring equipment",
      "medical supplies",
      "healthcare products",
      "medical accessories",
      "medical waste",
      "biohazard disposal",
      "healthcare safety",
      "medical ethics",
      "patient rights",
      "healthcare laws",
      "medical privacy",
      "health data",
      "confidentiality",
      "medical research",
      "clinical trials",
      "experimental treatment",
      "medical tourism",
      "healthcare abroad",
      "international treatment",
      "telemedicine",
      "remote healthcare",
      "virtual consultation",
      "medical insurance",
      "healthcare coverage",
      "medical benefits",
      "medical transportation",
      "patient transfer",
      "ambulance services",
    ];

    // Check if message contains any health-related keywords
    const hasHealthKeyword = healthKeywords.some((keyword) =>
      messageLower.includes(keyword)
    );

    // Check for question patterns related to health
    const healthQuestionPatterns = [
      /(what|how|why|when|where|which|is|are|do|does|did|can|could|should|would|will|may|might)/i,
      /(doctor|hospital|clinic|medicine|treatment|therapy|surgery|operation|procedure)/i,
      /(symptom|pain|fever|cough|headache|ache|swelling|bleeding|nausea|vomiting)/i,
      /(disease|infection|virus|bacteria|fungus|injury|wound|cut|bruise|fracture)/i,
    ];

    const hasHealthQuestionPattern = healthQuestionPatterns.some((pattern) =>
      pattern.test(messageLower)
    );

    return hasHealthKeyword || hasHealthQuestionPattern;
  };

  // Function to Check Predefined Answers
  const checkPredefinedResponse = (message) => {
    const messageLower = message.toLowerCase().trim();

    // First check for exact matches in basic greetings
    const greetings = {
      hi: "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
      hello:
        "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
      hey: "Hello! I'm your AI Healthcare Assistant. I can help you with medical conditions, care instructions, and doctor recommendations. How can I assist you with your health concerns today?",
    };

    if (greetings[messageLower]) {
      return greetings[messageLower];
    }

    // Then check predefinedQA
    if (predefinedQA[messageLower]) {
      return predefinedQA[messageLower];
    }

    // Check for symptom variations
    for (const [key, variations] of Object.entries(symptomVariations)) {
      if (variations.some((variation) => messageLower.includes(variation))) {
        return predefinedQA[key];
      }
    }

    // Check for spelling mistakes and find closest match
    const closestMatch = findClosestMatch(message);
    if (closestMatch) {
      return predefinedQA[closestMatch];
    }

    return null;
  };

  // Function to format message content with proper styling
  const formatMessageContent = (content) => {
    let formattedContent = content;

    // List of doctor specialties to be made bold
    const doctorSpecialties = [
      "General Physician",
      "Pediatrician",
      "Cardiologist",
      "Neurologist",
      "Dermatologist",
      "Orthopedist",
      "Gynecologist",
      "Psychiatrist",
      "ENT Specialist",
      "Ophthalmologist",
      "Dentist",
      "Endodontist",
      "Periodontist",
      "Oral Surgeon",
      "Endocrinologist",
      "Gastroenterologist",
      "Pulmonologist",
      "Rheumatologist",
      "Oncologist",
      "Urologist",
      "Allergist",
      "Emergency Department",
      "Infectious Disease Specialist",
      "Physiotherapist",
      "Maxillofacial Surgeon",
      "TMJ Specialist",
      "Pediatric Dentist",
      "Orthodontist",
    ];

    // Make doctor specialties bold
    doctorSpecialties.forEach((specialty) => {
      const regex = new RegExp(`(${specialty})`, "gi");
      formattedContent = formattedContent.replace(regex, "<strong>$1</strong>");
    });

    // Convert line breaks to proper spacing
    formattedContent = formattedContent.replace(
      /\n\n/g,
      '<div class="h-3"></div>'
    );
    formattedContent = formattedContent.replace(/\n/g, "<br>");

    return formattedContent;
  };

  // Function to scroll to bottom of chat
  const scrollToBottom = () => {
    const chatBody = document.querySelector(".chat-body");
    if (chatBody) {
      chatBody.scrollTo({
        top: chatBody.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Function to Generate Bot Response (API or Predefined)
  const generateBotResponse = async (message) => {
    setIsTyping(true);

    // Check if message is health-related
    if (!isHealthRelated(message)) {
      const response =
        "I'm a healthcare assistant and can only help with health-related questions. Please ask about medical conditions, symptoms, treatments, or general health advice. For non-health questions, please consult other appropriate resources.";

      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: response },
      ]);
      setIsTyping(false);
      setTimeout(scrollToBottom, 100);
      return;
    }

    // Check if message exists in predefined Q&A
    const predefinedResponse = checkPredefinedResponse(message);
    if (predefinedResponse) {
      setChatHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: predefinedResponse },
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
            parts: [
              {
                text: "You are a healthcare assistant. Provide only essential medical information in 2-3 sentences. Include: 1) Brief condition description 2) When to see a doctor 3) Which doctor to consult. Keep responses under 50 words. Focus on accuracy and clarity.",
              },
            ],
          },
          ...updatedHistory.map((msg) => ({
            role: msg.role,
            parts: [{ text: msg.content }],
          })),
        ],
      }),
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiResponseText = data.candidates[0].content.parts[0].text.trim();

      // Format API response to match our concise style
      const formattedResponse = formatApiResponse(apiResponseText);

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: formattedResponse },
      ]);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error(error);
      const errorMessage =
        "I apologize, but I'm having trouble processing your health-related question. Please try rephrasing your question or ask about a specific health concern.";

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsTyping(false);
    }
  };

  // Function to format API response to match our concise style
  const formatApiResponse = (response) => {
    // Remove any unnecessary details and keep only essential information
    const lines = response.split("\n");
    const essentialInfo = lines.filter(
      (line) =>
        line.toLowerCase().includes("doctor") ||
        line.toLowerCase().includes("seek") ||
        line.toLowerCase().includes("consult") ||
        line.toLowerCase().includes("see") ||
        line.toLowerCase().includes("visit")
    );

    if (essentialInfo.length > 0) {
      return essentialInfo.join("\n");
    }

    // If no essential info found, return a concise version of the first 2-3 sentences
    return response.split(".").slice(0, 3).join(".") + ".";
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

  return (
    <div className="min-h-screen flex items-center justify-center p-1 sm:p-4 pt-16 sm:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-[90%] sm:w-full max-w-lg h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)] flex flex-col bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-white/10 p-1.5 rounded-full"
            >
              <FaStethoscope className="w-4 h-4 text-white" />
            </motion.div>
            <div>
              <h1 className="text-white text-base font-semibold">
                AI HealthCare Assistant
              </h1>
              <p className="text-white/80 text-xs">Your 24/7 Medical Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleClearChat}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => window.history.back()}
              className="text-white/80 hover:text-white transition-colors"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Chat Body */}
        <div className="chat-body flex-1 p-3 overflow-y-auto bg-gray-50 scrollbar-hide">
          {/* Suggestion Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 bg-gray-50 pb-3"
          >
            {/* Heading */}
            <div className="text-center mb-4">
              <p className="text-xs text-gray-500 mt-1">
                Choose a topic or ask your question
              </p>
            </div>

            {/* First Row of Horizontal Questions */}
            <div className="flex gap-0.5 overflow-x-auto pb-2 scrollbar-hide mb-2">
              {horizontalQuestions.slice(0, 10).map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleSuggestionClick(question)}
                  className="flex-shrink-0 bg-white px-1.5 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs text-gray-700 hover:bg-gray-50 whitespace-nowrap w-[100px] sm:w-[120px] flex items-center"
                >
                  {question.icon}
                  <span className="truncate">{question.text}</span>
                </motion.button>
              ))}
            </div>

            {/* Second Row of Horizontal Questions */}
            <div className="flex gap-0.5 overflow-x-auto pb-2 scrollbar-hide">
              {horizontalQuestions.slice(10).map((question, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => handleSuggestionClick(question)}
                  className="flex-shrink-0 bg-white px-1.5 py-1 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-xs text-gray-700 hover:bg-gray-50 whitespace-nowrap w-[100px] sm:w-[120px] flex items-center"
                >
                  {question.icon}
                  <span className="truncate">{question.text}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Chat Messages */}
          <div className="mt-3">
            {chatHistory.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } mb-3`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100"
                  }`}
                >
                  <div
                    className="message-content text-xs leading-relaxed whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{
                      __html: formatMessageContent(message.content),
                    }}
                  />
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-3"
              >
                <div className="flex items-center gap-2 text-gray-500 text-xs">
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
          className="border-t border-gray-200 p-3 bg-white"
        >
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <motion.textarea
              whileFocus={{ scale: 1.02 }}
              className="message-input flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none text-xs transition-all duration-200 scrollbar-hide"
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
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <FaPaperPlane className="w-3.5 h-3.5" />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Chatbot;
