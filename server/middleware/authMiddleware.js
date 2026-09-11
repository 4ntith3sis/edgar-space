const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { sendError } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Middleware to protect admin routes
 */
async function authMiddleware(req, res, next) {
  try {
    let token = req.cookies ? req.cookies.admin_token : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Akses ditolak. Silakan masuk terlebih dahulu.', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || !decoded.id) {
      return sendError(res, 'Sesi tidak valid. Silakan masuk kembali.', 401);
    }

    const admin = await prisma.admin.findUnique({
      where: { id: Number(decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return sendError(res, 'Akun admin tidak ditemukan atau telah dihapus.', 401);
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Sesi Anda telah berakhir. Silakan masuk kembali.', 401);
    }
    return sendError(res, 'Autentikasi gagal. Silakan masuk kembali.', 401);
  }
}

module.exports = authMiddleware;
