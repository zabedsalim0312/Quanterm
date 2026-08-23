const { verifyToken } = require('../lib/tokens');

const authenticate = (req, res, next) => {
  const cookieToken = req.cookies?.access_token;
  const headerToken = req.header('Authorization')?.split(' ')[1];
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.purpose && decoded.purpose !== 'access') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
