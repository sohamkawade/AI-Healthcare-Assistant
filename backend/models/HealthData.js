// models/HealthData.js
const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  duration: { type: Number, required: true },
  quality: { type: String, required: true },
}, { timestamps: true });

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  macronutrients: { type: String, required: true },
}, { timestamps: true });

const mentalHealthSchema = new mongoose.Schema({
  mood: { type: String, required: true },
  stressLevel: { type: Number, required: true },
}, { timestamps: true });

const exerciseSchema = new mongoose.Schema({
  type: { type: String, required: true },
  duration: { type: Number, required: true },
}, { timestamps: true });

const healthDataSchema = new mongoose.Schema({
  sleep: sleepSchema,
  nutrition: nutritionSchema,
  mentalHealth: mentalHealthSchema,
  exercise: exerciseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const HealthData = mongoose.model('HealthData', healthDataSchema, 'HealthData');

module.exports = HealthData;
