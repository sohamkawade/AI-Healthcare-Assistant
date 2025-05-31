const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getDoctorPrescriptions,
  getPatientPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescriptionStatus,
  downloadPrescription,
  deletePrescription
} = require('../controllers/prescriptionController');
const PDFDocument = require('pdfkit');
const Prescription = require('../models/Prescription');

// Get prescriptions for a doctor
router.get('/doctor', authenticate, getDoctorPrescriptions);

// Get prescriptions for a patient
router.get('/patient/:patientId', authenticate, getPatientPrescriptions);

// Get a specific prescription
router.get('/:id', authenticate, getPrescriptionById);

// Create a new prescription
router.post('/', authenticate, createPrescription);

// Update prescription status
router.patch('/:id/status', authenticate, updatePrescriptionStatus);

// Download prescription as PDF
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    if (!prescription.doctorId || !prescription.patientId) {
      return res.status(400).json({ message: 'Invalid prescription data: missing doctor or patient information' });
    }

    const doc = new PDFDocument({
      size: 'A5',
      margin: 40
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescription._id}.pdf`);
    doc.pipe(res);

    // Title
    doc.fontSize(16)
       .text('PRESCRIPTION', { align: 'center' });
    
    doc.moveDown();
    
    // Doctor Info
    doc.fontSize(10)
       .text('Dr. ' + prescription.doctorId.firstName + ' ' + prescription.doctorId.lastName)
       .text(prescription.doctorId.specialization || 'General Practitioner')
       .moveDown(0.5);

    // Line separator
    doc.moveTo(40, doc.y)
       .lineTo(doc.page.width - 40, doc.y)
       .stroke();
    
    doc.moveDown(0.5);

    // Patient and Date Info
    doc.text(`Patient Name: ${prescription.patientId.firstName} ${prescription.patientId.lastName}`)
       .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`)
       .moveDown();

    // Diagnosis
    doc.text('Diagnosis:')
       .text(prescription.diagnosis || 'N/A', { indent: 20 })
       .moveDown();

    // Symptoms
    doc.text('Symptoms:')
       .text(prescription.symptoms?.join(', ') || 'None specified', { indent: 20 })
       .moveDown();

    // Medicines Header
    doc.text('Medicines:').moveDown(0.5);

    // Medicines List
    if (prescription.medications && prescription.medications.length > 0) {
      prescription.medications.forEach((medicine, index) => {
        doc.text(`${index + 1}. ${medicine.name || 'N/A'}`, { indent: 20 })
           .text(`   Dosage: ${medicine.dosage || 'N/A'}`, { indent: 30 })
           .text(`   Duration: ${medicine.duration || 'N/A'}`, { indent: 30 })
           .moveDown(0.5);
      });
    } else {
      doc.text('No medicines prescribed', { indent: 20 });
    }

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ 
      message: 'Error generating PDF',
      error: error.message 
    });
  }
});


// Delete a prescription
router.delete('/:id', authenticate, deletePrescription);

module.exports = router; 