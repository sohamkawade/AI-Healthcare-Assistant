const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const secret = process.env.JWT_KEY;
    return jwt.sign(
        { email: user.email, id: user._id, userType: user.userType },
        secret,
        // { expiresIn: '365d' } 
    );
};

module.exports.generateToken = generateToken;
