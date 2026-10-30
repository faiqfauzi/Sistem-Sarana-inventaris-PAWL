const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const router = express.Router();

const COOKIE_NAME = "inventaris_token";

function createCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  };
}

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username dan password wajib diisi.",
      });
    }

    const [users] = await pool.query(
      `SELECT id, username, password, role, responsible_id
       FROM users
       WHERE username = ?
       LIMIT 1`,
      [username.trim()],
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Username atau password salah.",
      });
    }

    const user = users[0];
    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({
        message: "Username atau password salah.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET belum diatur di file .env");
      return res.status(500).json({
        message: "Konfigurasi autentikasi server belum lengkap.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        responsible_id: user.responsible_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.cookie(COOKIE_NAME, token, createCookieOptions());

    return res.json({
      message: "Login berhasil.",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        responsible_id: user.responsible_id,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Terjadi kesalahan saat login.",
    });
  }
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({
      message: "Belum login.",
    });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        responsible_id: user.responsible_id,
      },
    });
  } catch {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(401).json({
      message: "Sesi login tidak valid atau sudah berakhir.",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.json({
    message: "Logout berhasil.",
  });
});

module.exports = router;
