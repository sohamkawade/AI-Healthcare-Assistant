const express = require('express');
const router = express.Router();
const { registerPatient } = require('../controllers/patientController');
const doctorController = require('../controllers/doctorController');
const { login, logout } = require('../controllers/loginController');
const { getProfile } = require('../controllers/profileController');
const validateBody = require('../middlewares/validateBody');
const { authenticate } = require('../middlewares/authMiddleware');
const { forgotPassword, resetPassword } = require('../controllers/authController');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected error occurred.',
  });
};

router.post(
  '/register-patient',
  validateBody(['firstName', 'lastName', 'email', 'password', 'address', 'contactNumber', 'birthdate']),
  registerPatient
);

router.post('/register-doctor',
  validateBody(['firstName', 'lastName', 'email', 'password', 'contactNumber', 'specialization', 'fees', 'degree']),
  doctorController.registerDoctor
);


router.post('/login',
  validateBody(['email', 'password']),
  login
);

router.get('/profile', authenticate, getProfile);

router.get('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(errorHandler);

module.exports = router;

