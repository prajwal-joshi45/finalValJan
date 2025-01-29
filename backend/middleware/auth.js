const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ message: 'No authentication token found' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    req.user = decoded.user;
       console.log('Setting req.user to:', req.user);

    next();
  } catch (err) {
    console.error('Auth Middleware Error:', err);
    res.status(401).json({ message: 'Token is invalid', error: err.message });
  }
};

module.exports = authMiddleware;

