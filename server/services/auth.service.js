const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = '7d';

/**
 * Admin Login
 * @param {string} email 
 * @param {string} password 
 */
async function login(email, password) {
  if (!email || !password) {
    const error = new Error('Email dan kata sandi wajib diisi.');
    error.statusCode = 400;
    throw error;
  }

  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  if (!admin) {
    const error = new Error('Email atau kata sandi salah.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Email atau kata sandi salah.');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt
    },
    token
  };
}

/**
 * Get current admin profile
 * @param {number} id 
 */
async function getAdminById(id) {
  const admin = await prisma.admin.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!admin) {
    const error = new Error('Admin tidak ditemukan.');
    error.statusCode = 404;
    throw error;
  }

  return admin;
}

module.exports = {
  login,
  getAdminById
};
