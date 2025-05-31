const Record = require("../models/Record");
const Patient = require("../models/Patient"); // Import the Patient model
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOCX, JPEG, and PNG allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
}).single("file");

// Main function to add a new record
exports.addRecord = [
  (req, res, next) => {
    upload(req, res, function (err) {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    const { title, description, patientId } = req.body;

    // Validate the patient ID format
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid Patient ID format" });
    }

    try {
      // **Check if the patient exists in the database**
      const patientExists = await Patient.findById(patientId);
      if (!patientExists) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Create a new record, handling the file (if uploaded)
      const newRecord = new Record({
        title,
        description,
        date: new Date(),
        file: req.file ? req.file.filename : null,
        patientId: new mongoose.Types.ObjectId(patientId),
      });

      const savedRecord = await newRecord.save();
      res.status(201).json({ message: "Record created successfully", record: savedRecord });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error while saving record", error: error.message });
    }
  },
];
