const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET;
    return jwt.sign(
        { 
            email: user.email, 
            id: user._id, 
            role: user.specialization ? 'doctor' : 'patient',
            specialization: user.specialization || null 
        },
        secret,
        { expiresIn: '365d' }
    );
};

module.exports = { generateToken };
