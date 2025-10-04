const jwt = require('jsonwebtoken');
const Form = require('../models/formModels'); // important: correct path

module.exports = async function authTenant(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Missing token' });

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const tenant = await Form.findById(payload.id);
    if (!tenant) return res.status(401).json({ message: 'Invalid token / tenant missing' });

    req.tenant = tenant;
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
