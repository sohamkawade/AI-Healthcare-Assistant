const express = require("express");
const router = express.Router();
const RecordController = require("../controllers/recordController");

// Routes related to patient records
router.get("/records/:patientId", RecordController.getPatientRecords); // Get records for a patient
router.post("/records", RecordController.addRecord); // Add new record
router.delete("/records/:recordId", RecordController.deleteRecord); // Delete a record

module.exports = router;
