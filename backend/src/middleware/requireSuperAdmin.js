// backend/middleware/requireSuperAdmin.js
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No user found',
    });
  }

  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Super Admins only',
    });
  }

  next();
};

export default requireSuperAdmin;
