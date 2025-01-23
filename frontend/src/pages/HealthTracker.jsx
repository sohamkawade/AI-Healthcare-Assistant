import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBed, FaAppleAlt, FaSmile, FaDumbbell, FaBullhorn } from 'react-icons/fa';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import 'react-toastify/dist/ReactToastify.css';
import BackButton from '../components/BackButton';

const HealthTracker = () => {
  const [sleep, setSleep] = useState({ duration: 7, quality: 'Good' });
  const [nutrition, setNutrition] = useState({ calories: 5, macronutrients: 'Protein' });
  const [mentalHealth, setMentalHealth] = useState({ mood: 'Happy', stressLevel: 5 });
  const [exercise, setExercise] = useState({ type: '', duration: '30' });
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [recommendations, setRecommendations] = useState('');

  const handleChange = (e, setter) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  const generatePersonalizedRecommendations = () => {
    let rec = '';
    if (parseFloat(sleep.duration) < 6) {
      rec += 'Try to get at least 7-8 hours of sleep for better recovery and focus. ';
    }
    if (parseInt(mentalHealth.stressLevel) > 7) {
      rec += 'Your stress level is high! Consider relaxation techniques like meditation or breathing exercises. ';
    }
    if (parseInt(mentalHealth.stressLevel) <= 3 && parseFloat(sleep.duration) >= 7) {
      rec += 'You are managing stress well and getting good sleep—keep it up! ';
    }
    setRecommendations(rec);
  };

  const handleSubmitSleep = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        await apiService.saveSleepData(sleep);
        toast.success('Sleep data tracked successfully!', { theme: "colored" });
        generatePersonalizedRecommendations();
      } catch (error) {
        toast.error('Error tracking sleep data. Please try again.', { theme: "colored" });
      }
    } else {
      toast.info('You must be authenticated to submit the data.', { theme: "colored" });
    }
  };

  const handleSubmitNutrition = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        await apiService.saveNutritionData(nutrition);
        toast.success('Nutrition data tracked successfully!', { theme: "colored" });  //
      } catch (error) {
        toast.error('Error tracking nutrition data. Please try again.', { theme: "colored" });
      }
    } else {
      toast.info('You must be authenticated to submit the data.', { theme: "colored" });
    }
  };

  const handleSubmitMentalHealth = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        await apiService.saveMentalHealthData(mentalHealth);
        toast.success('Mental health data tracked successfully!', { theme: "colored" });
        generatePersonalizedRecommendations();
      } catch (error) {
        toast.error('Error tracking mental health data. Please try again.', { theme: "colored" });
      }
    } else {
      toast.info('You must be authenticated to submit the data.', { theme: "colored" });
    }
  };

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      try {
        await apiService.saveExerciseData(exercise);
        toast.success('Exercise data tracked successfully!', { theme: "colored" });
      } catch (error) {
        toast.error('Error tracking exercise data. Please try again.', { theme: "colored" });
      }
    } else {
      toast.info('You must be authenticated to submit the data.', { theme: "colored" });
    }
  };

  const fetchHealthData = async () => {
    if (isAuthenticated) {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const data = await apiService.getHealthData(userId);
          setSleep(data.sleep || { duration: 7, quality: 'Good' });
          setNutrition(data.nutrition || { calories: '', macronutrients: 'Protein' });
          setMentalHealth(data.mentalHealth || { mood: 'Happy', stressLevel: 5 });
          setExercise(data.exercise || { type: '', duration: '30' });
        }
      } catch (error) {
        toast.error('Error fetching health data. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, [isAuthenticated]);

  return (
    <div className=" min-h-screen  bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 p-11">
      {/* Back Button */}
      <BackButton />
      <h1 className="text-5xl font-extrabold mb-8 text-center text-indigo-800 tracking-wide">Health Tracker</h1>
      {isAuthenticated ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sleep Tracking Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
            className="bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-500"
          >
            <FaBed className="text-5xl mb-4 text-white" />
            <h2 className="text-xl font-semibold mb-4 text-white">Sleep Tracking</h2>
            <form onSubmit={handleSubmitSleep}>
              <div className="mb-4">
                <label className="block text-white mb-2">Sleep Duration (hours)</label>
                <input
                  type="number"
                  name="duration"
                  value={sleep.duration}
                  onChange={(e) => handleChange(e, setSleep)}
                  min="4"
                  max="12"
                  className="w-full p-4 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Quality</label>
                <select
                  name="quality"
                  value={sleep.quality}
                  onChange={(e) => handleChange(e, setSleep)}
                  className="w-full p-4 bg-white border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save Sleep Data
              </button>
            </form>
          </motion.div>

          {/* Nutrition Tracking Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: 'tween', ease: 'easeOut' }}
            className="bg-gradient-to-r from-green-600 to-green-400 shadow-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-500"
          >
            <FaAppleAlt className="text-5xl mb-4 text-white" />
            <h2 className="text-xl font-semibold mb-4 text-white">Nutrition Tracking</h2>
            <form onSubmit={handleSubmitNutrition}>
              <div className="mb-4">
                <label className="block text-white mb-2">Calories Consumed</label>
                <input
                  type="number"
                  name="calories"
                  placeholder="Calories"
                  value={nutrition.calories}
                  onChange={(e) => handleChange(e, setNutrition)}
                  className="w-full p-4 bg-white border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Macronutrient</label>
                <select
                  name="macronutrients"
                  value={nutrition.macronutrients}
                  onChange={(e) => handleChange(e, setNutrition)}
                  className="w-full p-4 bg-white border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm"
                >
                  <option value="Protein">Protein</option>
                  <option value="Carbs">Carbs</option>
                  <option value="Fats">Fats</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save Nutrition Data
              </button>
            </form>
          </motion.div>

          {/* Mental Health Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
            className="bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-500"
          >
            <FaSmile className="text-5xl mb-4 text-white" />
            <h2 className="text-xl font-semibold mb-4 text-white">Mental Health Tracking</h2>
            <form onSubmit={handleSubmitMentalHealth}>

              <div className="mb-4">
                <label className="block text-white mb-2">Stress Level (1-10)</label>
                <input
                  type="number"
                  name="stressLevel"
                  value={mentalHealth.stressLevel}
                  onChange={(e) => handleChange(e, setMentalHealth)}
                  min="1"
                  max="10"
                  className="w-full p-4 bg-white border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Mood</label>
                <select
                  name="mood"
                  value={mentalHealth.mood}
                  onChange={(e) => handleChange(e, setMentalHealth)}
                  className="w-full p-4 bg-white border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
                >
                  <option value="Happy">Happy</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Sad">Sad</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-600 text-white py-3 rounded-md hover:bg-yellow-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save Mental Health Data
              </button>
            </form>
          </motion.div>

          {/* Exercise Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, type: 'tween', ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg rounded-3xl p-6 transform hover:scale-105 transition-all duration-500"
          >
            <FaDumbbell className="text-5xl mb-4 text-white" />
            <h2 className="text-xl font-semibold mb-4 text-white">Exercise Tracking</h2>
            <form onSubmit={handleSubmitExercise}>
              <div className="mb-4">
                <label className="block text-white mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  name="duration"
                  value={exercise.duration}
                  onChange={(e) => handleChange(e, setExercise)}
                  min="10"
                  max="120"
                  className="w-full p-4 bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Exercise Type</label>
                <input
                  type="text"
                  name="type"
                  value={exercise.type}
                  onChange={(e) => handleChange(e, setExercise)}
                  className="w-full p-4 bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
              >
                Save Exercise Data
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        <div className="text-center text-red-600">
          You need to be authenticated to track your health data.
        </div>
      )}
      {/* Display recommendations */}
      <div className="mt-12 text-center animate__animated animate__fadeIn">
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
          <h2 className="text-4xl font-extrabold text-white mb-4 flex items-center justify-center space-x-3">
            <FaBullhorn className="text-white text-3xl" />
            <span>Personalized Recommendations:</span>
          </h2>
          <p className="text-xl text-white font-medium leading-relaxed">
            {recommendations}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthTracker;
