const express = require('express');
const healthController = require('../controllers/healthController');
const { authenticate } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/trackSleepData', authenticate, healthController.saveSleepData);
router.post('/trackNutritionData', authenticate, healthController.saveNutritionData);
router.post('/trackMentalHealthData', authenticate, healthController.saveMentalHealthData);
router.post('/trackExerciseData', authenticate, healthController.saveExerciseData);

router.get('/healthData/:userId', authenticate, healthController.getHealthData);

module.exports = router;
