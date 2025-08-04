const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
} catch (error) {
    console.error('Error creating uploads directory:', error);
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function(req, file, cb) {
        // Get file extension
        const ext = path.extname(file.originalname);
        // Create filename with timestamp and sanitize it
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, filename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Not an image! Please upload only images.'), false);
    }
    cb(null, true);
};

// Create multer upload instance with error handling
const uploadMiddleware = (req, res, next) => {
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB max file size
        }
    }).single('profilePicture');

    upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size is too large. Maximum size is 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            // An unknown error occurred
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload failed'
            });
        }
        // Everything went fine
        next();
    });
};

module.exports = uploadMiddleware; 