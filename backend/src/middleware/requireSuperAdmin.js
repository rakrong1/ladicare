const requireSuperAdmin = (req, res, next) => {
  const user = req.user || { role: 'admin' };

  if (user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Super Admins only',
    });
  }

  next();
};

export default requireSuperAdmin;