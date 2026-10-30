const express = require("express");
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const imageDirectory = path.resolve(
  __dirname,
  "../../../frontend/public/images",
);

fs.mkdirSync(imageDirectory, { recursive: true });

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      callback(null, imageDirectory);
    },
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      callback(null, `daftar-sarana-inventaris${extension}`);
    },
  }),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error("Format gambar harus JPG, JPEG, PNG, atau WEBP."),
      );
    }

    callback(null, true);
  },
});

// GET: daftar master sarana beserta jumlah inventarisnya
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const [rows] = await pool.query(
      `SELECT
        m.id,
        m.nama_sarana_inventaris,
        COUNT(i.id) AS jumlah_inventaris
      FROM master_sarana_inventaris AS m
      LEFT JOIN inventories AS i
        ON i.master_sarana_inventaris_id = m.id
      WHERE m.nama_sarana_inventaris LIKE ?
      GROUP BY m.id, m.nama_sarana_inventaris
      ORDER BY m.nama_sarana_inventaris ASC`,
      [`%${search}%`],
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Gagal mengambil master sarana:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data master sarana inventaris.",
    });
  }
});

router.get("/header", (_req, res) => {
  const extension = allowedExtensions.find((ext) =>
    fs.existsSync(path.join(imageDirectory, `daftar-sarana-inventaris${ext}`)),
  );

  const filename = extension
    ? `daftar-sarana-inventaris${extension}`
    : "daftar-sarana-inventaris.png";

  res.json({
    success: true,
    data: {
      filename,
      url: `/images/${filename}`,
    },
  });
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID master sarana tidak valid.",
      });
    }

    // Informasi master sarana
    const [masterRows] = await pool.query(
      `SELECT id, nama_sarana_inventaris
       FROM master_sarana_inventaris
       WHERE id = ?`,
      [id],
    );

    if (!masterRows.length) {
      return res.status(404).json({
        success: false,
        message: "Master sarana tidak ditemukan.",
      });
    }

    // Ringkasan jumlah inventaris per penanggung jawab
    const [summary] = await pool.query(
      `SELECT
         COALESCE(r.nama_penanggung_jawab, '-') AS nama,
         COUNT(i.id) AS jumlah
       FROM inventories AS i
       LEFT JOIN responsibles AS r
         ON r.id = i.responsible_id
       WHERE i.master_sarana_inventaris_id = ?
       GROUP BY i.responsible_id, r.nama_penanggung_jawab
       ORDER BY nama ASC`,
      [id],
    );

    // Total data untuk pagination
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM inventories
       WHERE master_sarana_inventaris_id = ?`,
      [id],
    );

    const total = Number(countRows[0].total);

    // Daftar inventaris pada halaman yang diminta
    const [inventories] = await pool.query(
      `SELECT
         i.id,
         i.nomor_inventaris,
         i.user,
         i.spesifikasi,
         i.tanggal_perolehan,
         i.responsible_id,
         i.location_id,
         COALESCE(r.nama_penanggung_jawab, '-') AS nama_penanggung_jawab,
         COALESCE(l.nama_lokasi, '-') AS nama_lokasi
       FROM inventories AS i
       LEFT JOIN responsibles AS r
         ON r.id = i.responsible_id
       LEFT JOIN locations AS l
         ON l.id = i.location_id
       WHERE i.master_sarana_inventaris_id = ?
       ORDER BY i.nomor_inventaris ASC
       LIMIT ? OFFSET ?`,
      [id, limit, offset],
    );

    res.json({
      success: true,
      data: {
        masterSaranaInventaris: masterRows[0],
        summary,
        inventories,
        pagination: {
          currentPage: page,
          perPage: limit,
          total,
          lastPage: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil detail master sarana:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail master sarana inventaris.",
    });
  }
});

// POST: tambah sarana
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const nama = String(req.body.nama_sarana_inventaris || "").trim();

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: "Nama sarana wajib diisi.",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM master_sarana_inventaris WHERE nama_sarana_inventaris = ?",
      [nama],
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Nama sarana tersebut sudah terdaftar.",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO master_sarana_inventaris (nama_sarana_inventaris) VALUES (?)",
      [nama],
    );

    res.status(201).json({
      success: true,
      message: "Master sarana berhasil ditambahkan.",
      data: {
        id: result.insertId,
        nama_sarana_inventaris: nama,
        jumlah_inventaris: 0,
      },
    });
  } catch (error) {
    console.error("Gagal menambah master sarana:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menambahkan master sarana inventaris.",
    });
  }
});

// PUT: ubah sarana
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nama = String(req.body.nama_sarana_inventaris || "").trim();

    if (!Number.isInteger(id) || id < 1 || !nama) {
      return res.status(400).json({
        success: false,
        message: "ID dan nama sarana wajib valid.",
      });
    }

    const [existing] = await pool.query(
      `SELECT id
       FROM master_sarana_inventaris
       WHERE nama_sarana_inventaris = ? AND id <> ?`,
      [nama, id],
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "Nama sarana tersebut sudah digunakan.",
      });
    }

    const [result] = await pool.query(
      "UPDATE master_sarana_inventaris SET nama_sarana_inventaris = ? WHERE id = ?",
      [nama, id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Master sarana tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      message: "Master sarana berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal mengubah master sarana:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal memperbarui master sarana inventaris.",
    });
  }
});

// DELETE: hapus sarana
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID sarana tidak valid.",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM master_sarana_inventaris WHERE id = ?",
      [id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Master sarana tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      message: "Master sarana berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus master sarana:", error.message);

    res.status(409).json({
      success: false,
      message:
        "Sarana tidak dapat dihapus. Pastikan tidak ada inventaris yang masih menggunakan sarana ini.",
    });
  }
});

router.post("/header", adminMiddleware, (req, res) => {
  upload.single("header")(req, res, (uploadError) => {
    if (uploadError) {
      const message =
        uploadError.code === "LIMIT_FILE_SIZE"
          ? "Ukuran gambar maksimal 2 MB."
          : uploadError.message || "Gagal mengunggah gambar header.";

      return res.status(400).json({
        success: false,
        message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Pilih gambar header terlebih dahulu.",
      });
    }

    try {
      const uploadedFile = req.file.filename;

      // Hapus gambar lama dengan ekstensi berbeda.
      for (const extension of allowedExtensions) {
        const oldFile = path.join(
          imageDirectory,
          `daftar-sarana-inventaris${extension}`,
        );

        if (oldFile !== req.file.path && fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }

      return res.json({
        success: true,
        message: "Gambar header berhasil diperbarui.",
        data: {
          filename: uploadedFile,
          url: `/images/${uploadedFile}`,
        },
      });
    } catch (error) {
      console.error("Gagal memperbarui gambar header:", error.message);

      return res.status(500).json({
        success: false,
        message: "Gagal memperbarui gambar header.",
      });
    }
  });
});

module.exports = router;
