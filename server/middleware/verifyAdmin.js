import { verifyToken } from './verifyToken.js';

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  });
};

