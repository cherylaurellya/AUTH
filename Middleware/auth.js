const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ error: 'Akses ditolak, token tidak tersedia' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token tidak valid' });
    req.user = user;
    next();
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.user.role !== role) {
      return res.status(403).json({ error: 'Akses ditolak, peran tidak sesuai' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };