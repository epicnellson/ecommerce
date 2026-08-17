import jwt from 'jsonwebtoken';
import config from '../config/config.js';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: config.nodeEnv !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};


export default generateToken;
