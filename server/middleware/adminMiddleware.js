// Middleware to restrict routes to admin users only.
// Must be used AFTER authMiddleware (which sets req.userRole).

const adminMiddleware = (req, res, next) => {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

module.exports = adminMiddleware;
