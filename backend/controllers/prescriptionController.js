const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Get prescriptions for a doctor
exports.getDoctorPrescriptions = async (req, res) => {
  try {
    const query = { doctorId: req.user._id };
    
    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions.map(prescription => ({
        _id: prescription._id,
        patient: {
          _id: prescription.patientId._id,
          firstName: prescription.patientId.firstName,
          lastName: prescription.patientId.lastName,
          email: prescription.patientId.email
        },
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        medications: prescription.medications,
        instructions: prescription.instructions,
        status: prescription.status,
        createdAt: prescription.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch prescriptions' 
    });
  }
};

// Get prescriptions for a patient
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: prescriptions.map(prescription => ({
        _id: prescription._id,
        doctor: {
          _id: prescription.doctorId._id,
          firstName: prescription.doctorId.firstName,
          lastName: prescription.doctorId.lastName,
          specialization: prescription.doctorId.specialization
        },
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        medications: prescription.medications,
        instructions: prescription.instructions,
        status: prescription.status,
        createdAt: prescription.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching patient prescriptions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch prescriptions' 
    });
  }
};

// Get a specific prescription
exports.getPrescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName email');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: prescription._id,
        doctor: {
          _id: prescription.doctorId._id,
          firstName: prescription.doctorId.firstName,
          lastName: prescription.doctorId.lastName,
          specialization: prescription.doctorId.specialization
        },
        patient: {
          _id: prescription.patientId._id,
          firstName: prescription.patientId.firstName,
          lastName: prescription.patientId.lastName,
          email: prescription.patientId.email
        },
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        medications: prescription.medications,
        instructions: prescription.instructions,
        status: prescription.status,
        createdAt: prescription.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching prescription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch prescription' 
    });
  }
};

// Create a new prescription
exports.createPrescription = async (req, res) => {
  try {
    const { patientId, diagnosis, symptoms, medications, instructions } = req.body;
    // Verify doctor's authorization
    if (!req.user.specialization) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors can create prescriptions' 
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const prescription = new Prescription({
      doctorId: req.user._id,
      patientId,
      diagnosis,
      symptoms,
      medications,
      instructions,
      status: 'active'
    });

    await prescription.save();

    // Populate doctor and patient details
    await prescription.populate('doctorId', 'firstName lastName specialization');
    await prescription.populate('patientId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: {
        _id: prescription._id,
        doctor: {
          _id: prescription.doctorId._id,
          firstName: prescription.doctorId.firstName,
          lastName: prescription.doctorId.lastName,
          specialization: prescription.doctorId.specialization
        },
        patient: {
          _id: prescription.patientId._id,
          firstName: prescription.patientId.firstName,
          lastName: prescription.patientId.lastName,
          email: prescription.patientId.email
        },
        diagnosis: prescription.diagnosis,
        symptoms: prescription.symptoms,
        medications: prescription.medications,
        instructions: prescription.instructions,
        status: prescription.status,
        createdAt: prescription.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating prescription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create prescription',
      error: error.message 
    });
  }
};

// Update prescription status
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prescription not found' 
      });
    }

    // Only allow doctor who created the prescription to update it
    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this prescription' 
      });
    }

    prescription.status = status;
    await prescription.save();

    res.json({
      success: true,
      message: 'Prescription status updated successfully',
      data: prescription
    });
  } catch (error) {
    console.error('Error updating prescription status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update prescription status' 
    });
  }
};

exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Check if the doctor is deleting the prescription
    if (prescription.doctorId.toString() === req.user._id.toString()) {
      // Doctor deletes the prescription, so remove only doctor reference
      prescription.doctorId = null; // Unset doctorId reference
      await prescription.save(); // Save the updated prescription without the doctor's ID
      return res.json({
        success: true,
        message: 'Prescription removed from doctor\'s page'
      });
    }

    // Check if the patient is deleting the prescription
    if (prescription.patientId.toString() === req.user._id.toString()) {
      // Patient deletes the prescription, so remove only patient reference
      prescription.patientId = null; // Unset patientId reference
      await prescription.save(); // Save the updated prescription without the patient's ID
      return res.json({
        success: true,
        message: 'Prescription removed from patient\'s page'
      });
    }

    // If neither doctor nor patient tries to delete
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this prescription'
    });

  } catch (error) {
    console.error('Error deleting prescription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription'
    });
  }
};


// Download prescription as PDF
exports.downloadPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName email');

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Prescription - ${prescription._id}`,
        Author: `Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`
      }
    });

    const filename = `prescription_${prescription._id}.pdf`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add header with logo and title
    doc.fontSize(24)
       .fillColor('#2563eb')
       .text('Medical Prescription', { align: 'center' })
       .moveDown();

    // Add prescription details in a modern table format
    const startX = 50;
    let startY = 150;

    // Doctor Information
    doc.fontSize(12)
       .fillColor('#1e40af')
       .text('Doctor Information', startX, startY)
       .moveDown(0.5);
    
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text(`Name: Dr. ${prescription.doctorId.firstName} ${prescription.doctorId.lastName}`, startX + 20, startY + 20)
       .text(`Specialization: ${prescription.doctorId.specialization}`, startX + 20, startY + 35)
       .moveDown();

    // Patient Information
    startY += 80;
    doc.fontSize(12)
       .fillColor('#1e40af')
       .text('Patient Information', startX, startY)
       .moveDown(0.5);
    
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text(`Name: ${prescription.patientId.firstName} ${prescription.patientId.lastName}`, startX + 20, startY + 20)
       .text(`Email: ${prescription.patientId.email}`, startX + 20, startY + 35)
       .moveDown();

    // Diagnosis and Symptoms
    startY += 80;
    doc.fontSize(12)
       .fillColor('#1e40af')
       .text('Diagnosis & Symptoms', startX, startY)
       .moveDown(0.5);
    
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text(`Diagnosis: ${prescription.diagnosis}`, startX + 20, startY + 20)
       .text('Symptoms:', startX + 20, startY + 35);
    
    prescription.symptoms.forEach((symptom, index) => {
      doc.text(`• ${symptom}`, startX + 40, startY + 50 + (index * 15));
    });
    doc.moveDown();

    // Medications Table
    startY += 100;
    doc.fontSize(12)
       .fillColor('#1e40af')
       .text('Prescribed Medications', startX, startY)
       .moveDown(0.5);

    // Table header
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text('Medication', startX + 20, startY + 20)
       .text('Dosage', startX + 200, startY + 20)
       .text('Frequency', startX + 300, startY + 20)
       .text('Duration', startX + 400, startY + 20);

    // Table rows
    prescription.medications.forEach((med, index) => {
      const rowY = startY + 40 + (index * 25);
      doc.text(med.name, startX + 20, rowY)
         .text(med.dosage, startX + 200, rowY)
         .text(med.frequency, startX + 300, rowY)
         .text(med.duration, startX + 400, rowY);
    });
    doc.moveDown();

    // Instructions
    startY += 100;
    doc.fontSize(12)
       .fillColor('#1e40af')
       .text('Instructions', startX, startY)
       .moveDown(0.5);
    
    doc.fontSize(10)
       .fillColor('#1f2937')
       .text(prescription.instructions, startX + 20, startY + 20)
       .moveDown();

    // Footer
    const footerY = doc.page.height - 100;
    doc.fontSize(8)
       .fillColor('#6b7280')
       .text(`Prescription ID: ${prescription._id}`, startX, footerY)
       .text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, startX, footerY + 15)
       .text(`Status: ${prescription.status}`, startX, footerY + 30);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error downloading prescription:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download prescription' 
    });
  }
}; 