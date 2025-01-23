const HealthData = require('../models/HealthData');

const saveSleepData = async (req, res) => {
  try {
    const { duration, quality} = req.body;

    if (!duration || !quality) {
      return res.status(400).json({ message: 'Sleep duration and quality are required' });
    }

    const newSleepData = new HealthData({
      sleep: { duration, quality },
      userId: req.user.id, 
    });

    await newSleepData.save();
    res.status(201).json({ message: 'Sleep data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving sleep data', error: error.message });
  }
};

// Controller to save nutrition data
const saveNutritionData = async (req, res) => {
  try {
    const { calories, macronutrients} = req.body;

    if (!calories || !macronutrients ) {
      return res.status(400).json({ message: 'Calories and macronutrients are required' });
    }

    const newNutritionData = new HealthData({
      nutrition: { calories, macronutrients },
      userId : req.user.id,
    });

    await newNutritionData.save();
    res.status(201).json({ message: 'Nutrition data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving nutrition data', error: error.message });
  }
};

// Controller to save mental health data
const saveMentalHealthData = async (req, res) => {
  try {
    const { mood, stressLevel} = req.body;

    if (!mood || !stressLevel ) {
      return res.status(400).json({ message: 'Mood, stress level, and userId are required' });
    }

    const newMentalHealthData = new HealthData({
      mentalHealth: { mood, stressLevel },
      userId: req.user.id,
    });

    await newMentalHealthData.save();
    res.status(201).json({ message: 'Mental health data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving mental health data', error: error.message });
  }
};

const saveExerciseData = async (req, res) => {
  try {
    const { type, duration } = req.body;

    if (!type || !duration ) {
      return res.status(400).json({ message: 'Exercise type and duration are required' });
    }

    const newExerciseData = new HealthData({
      exercise: { type, duration },
      userId: req.user.id,
    });

    await newExerciseData.save();
    res.status(201).json({ message: 'Exercise data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving exercise data', error: error.message });
  }
};

const getHealthData = async (req, res) => {
  try {
    const userId = req.params.userId;
    const healthData = await HealthData.find({ userId });

    if (!healthData || healthData.length === 0) {
      return res.status(404).json({ message: 'No health data found for this user' });
    }

    res.status(200).json(healthData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving health data', error: error.message });
  }
};

module.exports = {
  saveSleepData,
  saveNutritionData,
  saveMentalHealthData,
  saveExerciseData,
  getHealthData
};
