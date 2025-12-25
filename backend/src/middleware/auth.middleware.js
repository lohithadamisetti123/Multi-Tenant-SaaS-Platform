const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ success: false, message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({ success: false, message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure required fields exist
    if (!decoded.userId || !decoded.tenantId) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
