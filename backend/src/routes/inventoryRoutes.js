const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const adminMiddleware = require("../middleware/adminMiddleware");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const uploadDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(pdf|jpg|jpeg|png|doc|docx|xls|xlsx)$/i.test(
      path.extname(file.originalname),
    );

    if (!allowed) {
      return cb(new Error("Format file tidak didukung."));
    }

    cb(null, true);
  },
});

const historyConfig = {
  perawatan: {
    table: "inventory_maintenances",
    fileField: null,
  },
  perbaikan: {
    table: "inventory_repairs",
    fileField: "dokumen",
  },
  "stock-opname": {
    table: "inventory_stock_opnames",
    fileField: "foto",
  },
  mutasi: {
    table: "inventory_mutations",
    fileField: "dokumen",
  },
};

async function checkInventoryAccess(req, res, inventoryId) {
  const [rows] = await pool.execute(
    "SELECT id, responsible_id FROM inventories WHERE id = ?",
    [inventoryId],
  );

  if (!rows.length) {
    res.status(404).json({
      success: false,
      message: "Inventaris tidak ditemukan.",
    });
    return false;
  }

  const user = req.user;
  const inventory = rows[0];

  if (
    user.role !== "admin" &&
    (user.responsible_id == null ||
      String(user.responsible_id) !== String(inventory.responsible_id))
  ) {
    res.status(403).json({
      success: false,
      message: "Anda tidak memiliki akses ke riwayat inventaris ini.",
    });
    return false;
  }

  return inventory;
}

router.post("/:id/history/:type", async (req, res, next) => {
  const config = historyConfig[req.params.type];

  if (!config) {
    return res.status(400).json({
      success: false,
      message: "Jenis riwayat tidak valid.",
    });
  }

  if (config.fileField) {
    return upload.single(config.fileField)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Upload file gagal.",
        });
      }

      return createHistory(req, res, config);
    });
  }

  return createHistory(req, res, config);
});

async function createHistory(req, res, config) {
  try {
    const inventoryId = Number(req.params.id);
    const inventory = await checkInventoryAccess(req, res, inventoryId);
    if (!inventory) return;

    const body = req.body;
    let fields = [];

    switch (req.params.type) {
      case "perawatan":
        fields = [
          "tanggal_perawatan",
          "tanggal_perawatan_selanjutnya",
          "jenis_perawatan",
          "pelaksana",
        ];
        if (
          !body.tanggal_perawatan ||
          !body.jenis_perawatan ||
          !body.pelaksana
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Tanggal perawatan, jenis perawatan, dan pelaksana wajib diisi.",
          });
        }
        break;

      case "perbaikan":
        fields = [
          "tanggal_pengajuan",
          "tanggal_tindak_lanjut",
          "jenis_perbaikan",
          "pelaksana",
        ];
        if (
          !body.tanggal_pengajuan ||
          !body.jenis_perbaikan ||
          !body.pelaksana
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Tanggal pengajuan, jenis perbaikan, dan pelaksana wajib diisi.",
          });
        }
        break;

      case "stock-opname":
        fields = ["tanggal", "kondisi", "auditor"];
        if (!body.tanggal || !body.kondisi || !body.auditor) {
          return res.status(400).json({
            success: false,
            message: "Tanggal, kondisi, dan auditor wajib diisi.",
          });
        }
        break;

      case "mutasi":
        fields = ["jenis", "tanggal", "alasan"];
        if (
          !["Pemindahan", "Pemusnahan"].includes(body.jenis) ||
          !body.tanggal ||
          !body.alasan
        ) {
          return res.status(400).json({
            success: false,
            message: "Jenis, tanggal, dan alasan wajib diisi dengan benar.",
          });
        }
        break;
    }

    const values = fields.map((field) => body[field] || null);

    if (config.fileField && req.file) {
      fields.push(config.fileField);
      values.push(
        `/${path.relative(path.join(__dirname, "../.."), req.file.path).replace(/\\/g, "/")}`,
      );
    }

    fields.unshift("inventory_id");
    values.unshift(inventoryId);

    const columns = fields.map((field) => `\`${field}\``).join(", ");
    const placeholders = fields.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `INSERT INTO ${config.table} (${columns}) VALUES (${placeholders})`,
      values,
    );

    return res.status(201).json({
      success: true,
      message: "Riwayat berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Gagal menambah riwayat:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menambah riwayat.",
    });
  }
}

/* PUT: mengedit riwayat inventaris */
router.put("/:id/history/:type/:historyId", async (req, res) => {
  const config = historyConfig[req.params.type];

  if (!config) {
    return res.status(400).json({
      success: false,
      message: "Jenis riwayat tidak valid.",
    });
  }

  const handleUpdate = async () => {
    try {
      const inventoryId = Number(req.params.id);
      const historyId = Number(req.params.historyId);

      if (
        !Number.isInteger(inventoryId) ||
        inventoryId < 1 ||
        !Number.isInteger(historyId) ||
        historyId < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "ID inventaris atau riwayat tidak valid.",
        });
      }

      const inventory = await checkInventoryAccess(req, res, inventoryId);

      if (!inventory) return;

      const [historyRows] = await pool.execute(
        `SELECT id FROM ${config.table}
         WHERE id = ? AND inventory_id = ?`,
        [historyId, inventoryId],
      );

      if (!historyRows.length) {
        return res.status(404).json({
          success: false,
          message: "Riwayat inventaris tidak ditemukan.",
        });
      }

      const body = req.body;
      let fields = [];

      switch (req.params.type) {
        case "perawatan":
          fields = [
            "tanggal_perawatan",
            "tanggal_perawatan_selanjutnya",
            "jenis_perawatan",
            "pelaksana",
          ];

          if (
            !body.tanggal_perawatan ||
            !body.jenis_perawatan ||
            !body.pelaksana
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Tanggal perawatan, jenis perawatan, dan pelaksana wajib diisi.",
            });
          }
          break;

        case "perbaikan":
          fields = [
            "tanggal_pengajuan",
            "tanggal_tindak_lanjut",
            "jenis_perbaikan",
            "pelaksana",
          ];

          if (
            !body.tanggal_pengajuan ||
            !body.jenis_perbaikan ||
            !body.pelaksana
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Tanggal pengajuan, jenis perbaikan, dan pelaksana wajib diisi.",
            });
          }
          break;

        case "stock-opname":
          fields = ["tanggal", "kondisi", "auditor"];

          if (!body.tanggal || !body.kondisi || !body.auditor) {
            return res.status(400).json({
              success: false,
              message: "Tanggal, kondisi, dan auditor wajib diisi.",
            });
          }
          break;

        case "mutasi":
          fields = ["jenis", "tanggal", "alasan"];

          if (
            !["Pemindahan", "Pemusnahan"].includes(body.jenis) ||
            !body.tanggal ||
            !body.alasan
          ) {
            return res.status(400).json({
              success: false,
              message: "Jenis, tanggal, dan alasan wajib diisi dengan benar.",
            });
          }
          break;
      }

      const values = fields.map((field) => body[field] || null);

      if (config.fileField && req.file) {
        fields.push(config.fileField);
        values.push(
          `/${path
            .relative(path.join(__dirname, "../.."), req.file.path)
            .replace(/\\/g, "/")}`,
        );
      }

      const setClause = fields.map((field) => `\`${field}\` = ?`).join(", ");

      values.push(historyId, inventoryId);

      await pool.execute(
        `UPDATE ${config.table}
         SET ${setClause}
         WHERE id = ? AND inventory_id = ?`,
        values,
      );

      return res.json({
        success: true,
        message: "Riwayat berhasil diperbarui.",
      });
    } catch (error) {
      console.error("Gagal mengedit riwayat:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal mengedit riwayat.",
      });
    }
  };

  if (config.fileField) {
    return upload.single(config.fileField)(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Upload file gagal.",
        });
      }

      return handleUpdate();
    });
  }

  return handleUpdate();
});

/* DELETE: menghapus riwayat, khusus admin */
router.delete(
  "/:id/history/:type/:historyId",
  adminMiddleware,
  async (req, res) => {
    try {
      const inventoryId = Number(req.params.id);
      const historyId = Number(req.params.historyId);
      const config = historyConfig[req.params.type];

      if (!config) {
        return res.status(400).json({
          success: false,
          message: "Jenis riwayat tidak valid.",
        });
      }

      if (
        !Number.isInteger(inventoryId) ||
        inventoryId < 1 ||
        !Number.isInteger(historyId) ||
        historyId < 1
      ) {
        return res.status(400).json({
          success: false,
          message: "ID inventaris atau riwayat tidak valid.",
        });
      }

      const [rows] = await pool.execute(
        `SELECT id FROM ${config.table}
         WHERE id = ? AND inventory_id = ?`,
        [historyId, inventoryId],
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Riwayat inventaris tidak ditemukan.",
        });
      }

      await pool.execute(
        `DELETE FROM ${config.table}
         WHERE id = ? AND inventory_id = ?`,
        [historyId, inventoryId],
      );

      return res.json({
        success: true,
        message: "Riwayat berhasil dihapus.",
      });
    } catch (error) {
      console.error("Gagal menghapus riwayat:", error);

      return res.status(500).json({
        success: false,
        message: "Gagal menghapus riwayat.",
      });
    }
  },
);

/* GET: mengambil pilihan sarana, lokasi, dan penanggung jawab */
router.get("/options", async (req, res) => {
  try {
    const [sarana] = await pool.query(`
      SELECT id, nama_sarana_inventaris
      FROM master_sarana_inventaris
      ORDER BY nama_sarana_inventaris ASC
    `);

    const [lokasi] = await pool.query(`
      SELECT id, nama_lokasi
      FROM locations
      ORDER BY nama_lokasi ASC
    `);

    const [penanggungJawab] = await pool.query(`
      SELECT id, nama_penanggung_jawab
      FROM responsibles
      ORDER BY nama_penanggung_jawab ASC
    `);

    res.json({
      success: true,
      data: {
        sarana,
        lokasi,
        penanggungJawab,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil pilihan form:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil pilihan form inventaris",
    });
  }
});

// GET: mengambil semua data inventaris
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.id,
        i.nomor_inventaris,
        i.user,
        i.status,
        i.foto,
        i.tanggal_perolehan,
        i.spesifikasi,
        i.master_sarana_inventaris_id,
        i.location_id,
        i.responsible_id,
        m.nama_sarana_inventaris,
        l.nama_lokasi,
        r.nama_penanggung_jawab,
        so.tanggal AS update_stok_opname
      FROM inventories AS i
      LEFT JOIN master_sarana_inventaris AS m
        ON i.master_sarana_inventaris_id = m.id
      LEFT JOIN locations AS l
        ON i.location_id = l.id
      LEFT JOIN responsibles AS r
        ON i.responsible_id = r.id
      LEFT JOIN (
        SELECT inventory_id, MAX(tanggal) AS tanggal
        FROM inventory_stock_opnames
        GROUP BY inventory_id
      ) AS so
        ON so.inventory_id = i.id
      ORDER BY i.id DESC

    `);

    res.json({
      success: true,
      total: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Gagal mengambil inventaris:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data inventaris",
    });
  }
});

// POST: menambahkan inventaris baru

/* POST: menambahkan inventaris baru */
router.post("/", async (req, res) => {
  try {
    const currentUser = req.user;
    const isAdmin = currentUser.role === "admin";

    const {
      nomor_inventaris,
      user,
      status,
      foto,
      tanggal_perolehan,
      spesifikasi,
      master_sarana_inventaris_id,
      location_id,
      responsible_id,
    } = req.body;

    if (!nomor_inventaris || !nomor_inventaris.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nomor inventaris wajib diisi.",
      });
    }

    // Admin boleh memilih penanggung jawab.
    // Pengguna lain otomatis menggunakan penanggung jawab akunnya.
    const finalResponsibleId = isAdmin
      ? responsible_id || null
      : currentUser.responsible_id;

    if (!finalResponsibleId) {
      return res.status(400).json({
        success: false,
        message: "Penanggung jawab belum ditentukan pada akun ini.",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO inventories (
        nomor_inventaris,
        user,
        status,
        foto,
        tanggal_perolehan,
        spesifikasi,
        master_sarana_inventaris_id,
        location_id,
        responsible_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nomor_inventaris.trim(),
        user || null,
        status || "Baik",
        foto || null,
        tanggal_perolehan || null,
        spesifikasi || null,
        master_sarana_inventaris_id || null,
        location_id || null,
        finalResponsibleId,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Inventaris berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Gagal menambah inventaris:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menambah inventaris. Periksa kolom dan relasi database.",
    });
  }
});

/* GET: detail satu inventaris beserta 4 riwayat terbaru */

/* GET: mengambil seluruh riwayat berdasarkan inventaris dan jenisnya */
router.get("/:id/history/:type", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type } = req.params;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID inventaris tidak valid.",
      });
    }

    // Nama tabel dan kolom pengurutan hanya boleh berasal dari daftar ini.
    const historyConfig = {
      perawatan: {
        table: "inventory_maintenances",
        order: "tanggal_perawatan",
      },
      perbaikan: {
        table: "inventory_repairs",
        order: "tanggal_pengajuan",
      },
      "stock-opname": {
        table: "inventory_stock_opnames",
        order: "tanggal",
      },
      mutasi: {
        table: "inventory_mutations",
        order: "tanggal",
      },
    };

    const config = historyConfig[type];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Jenis riwayat tidak valid.",
      });
    }

    const [inventories] = await pool.execute(
      `SELECT
        i.id,
        i.nomor_inventaris,
        i.user,
        i.status,
        i.foto,
        i.tanggal_perolehan,
        i.spesifikasi,
        i.responsible_id,
        i.master_sarana_inventaris_id,
        i.location_id,
        m.nama_sarana_inventaris,
        l.nama_lokasi,
        r.nama_penanggung_jawab
          FROM inventories AS i
          LEFT JOIN master_sarana_inventaris AS m
            ON m.id = i.master_sarana_inventaris_id
          LEFT JOIN locations AS l
            ON l.id = i.location_id
          LEFT JOIN responsibles AS r
            ON r.id = i.responsible_id
          WHERE i.id = ?`,
      [id],
    );

    if (inventories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan.",
      });
    }

    const [rows] = await pool.query(
      `SELECT *
       FROM ${config.table}
       WHERE inventory_id = ?
       ORDER BY ${config.order} DESC, id DESC`,
      [id],
    );

    return res.json({
      success: true,
      data: {
        inventory: inventories[0],
        rows,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil seluruh riwayat:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil seluruh riwayat inventaris.",
    });
  }
});

/* GET: detail satu inventaris beserta riwayat Laravel */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID inventaris tidak valid.",
      });
    }

    // 1. Informasi utama inventaris
    const [rows] = await pool.execute(
      `
      SELECT
        i.id,
        i.nomor_inventaris,
        i.user,
        i.status,
        i.foto,
        i.tanggal_perolehan,
        i.spesifikasi,
        i.master_sarana_inventaris_id,
        i.location_id,
        i.responsible_id,
        m.nama_sarana_inventaris,
        l.nama_lokasi,
        r.nama_penanggung_jawab
      FROM inventories AS i
      LEFT JOIN master_sarana_inventaris AS m
        ON m.id = i.master_sarana_inventaris_id
      LEFT JOIN locations AS l
        ON l.id = i.location_id
      LEFT JOIN responsibles AS r
        ON r.id = i.responsible_id
      WHERE i.id = ?
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan.",
      });
    }

    // 2. Ambil tiga riwayat terbaru untuk setiap kategori
    const [maintenances] = await pool.execute(
      `SELECT id, inventory_id, tanggal_perawatan,
              tanggal_perawatan_selanjutnya, jenis_perawatan, pelaksana
       FROM inventory_maintenances
       WHERE inventory_id = ?
       ORDER BY tanggal_perawatan DESC, id DESC
       LIMIT 3`,
      [id],
    );

    const [repairs] = await pool.execute(
      `SELECT id, inventory_id, tanggal_pengajuan,
              tanggal_tindak_lanjut, dokumen, jenis_perbaikan, pelaksana
       FROM inventory_repairs
       WHERE inventory_id = ?
       ORDER BY tanggal_pengajuan DESC, id DESC
       LIMIT 3`,
      [id],
    );

    const [stockOpnames] = await pool.execute(
      `SELECT id, inventory_id, tanggal, kondisi, auditor, foto, dokumen
       FROM inventory_stock_opnames
       WHERE inventory_id = ?
       ORDER BY tanggal DESC, id DESC
       LIMIT 3`,
      [id],
    );

    const [mutations] = await pool.execute(
      `SELECT id, inventory_id, jenis, tanggal, alasan, dokumen
       FROM inventory_mutations
       WHERE inventory_id = ?
       ORDER BY tanggal DESC, id DESC
       LIMIT 3`,
      [id],
    );

    return res.json({
      success: true,
      data: {
        ...rows[0],
        maintenances,
        repairs,
        stockOpnames,
        mutations,
      },
    });
  } catch (error) {
    console.error("Gagal mengambil detail inventaris beserta riwayat:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail inventaris beserta riwayat.",
    });
  }
});

// PUT: memperbarui inventaris berdasarkan ID

/* PUT: memperbarui inventaris berdasarkan ID */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const {
      nomor_inventaris,
      user,
      status,
      foto,
      tanggal_perolehan,
      spesifikasi,
      master_sarana_inventaris_id,
      location_id,
      responsible_id,
    } = req.body;

    // Pastikan inventaris memang ada.
    const [inventories] = await pool.execute(
      "SELECT id, responsible_id FROM inventories WHERE id = ?",
      [id],
    );

    if (inventories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan.",
      });
    }

    const inventory = inventories[0];
    const isAdmin = currentUser.role === "admin";

    // Non-admin hanya boleh mengedit inventaris miliknya sendiri.
    if (
      !isAdmin &&
      (currentUser.responsible_id == null ||
        inventory.responsible_id == null ||
        String(inventory.responsible_id) !== String(currentUser.responsible_id))
    ) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses untuk mengubah inventaris ini.",
      });
    }

    if (!nomor_inventaris || !nomor_inventaris.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nomor inventaris wajib diisi.",
      });
    }

    // Admin boleh menentukan penanggung jawab.
    // Non-admin harus tetap menggunakan penanggung jawab miliknya.
    const finalResponsibleId = isAdmin
      ? responsible_id || null
      : currentUser.responsible_id;

    const [result] = await pool.execute(
      `UPDATE inventories SET
        nomor_inventaris = ?,
        user = ?,
        status = ?,
        foto = ?,
        tanggal_perolehan = ?,
        spesifikasi = ?,
        master_sarana_inventaris_id = ?,
        location_id = ?,
        responsible_id = ?
      WHERE id = ?`,
      [
        nomor_inventaris.trim(),
        user || null,
        status || "Baik",
        foto || null,
        tanggal_perolehan || null,
        spesifikasi || null,
        master_sarana_inventaris_id || null,
        location_id || null,
        finalResponsibleId,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Inventaris berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal mengedit inventaris:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengedit inventaris.",
    });
  }
});

/* DELETE: menghapus beberapa inventaris sekaligus */
router.delete("/bulk", adminMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pilih minimal satu inventaris untuk dihapus.",
      });
    }

    // Pastikan ID berupa bilangan bulat positif dan tidak duplikat.
    const validIds = [
      ...new Set(
        ids
          .filter((id) => Number.isSafeInteger(Number(id)) && Number(id) > 0)
          .map(Number),
      ),
    ];

    if (validIds.length === 0 || validIds.length !== ids.length) {
      return res.status(400).json({
        success: false,
        message: "Daftar ID inventaris tidak valid.",
      });
    }

    const placeholders = validIds.map(() => "?").join(", ");

    const [result] = await pool.execute(
      `DELETE FROM inventories WHERE id IN (${placeholders})`,
      validIds,
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data inventaris yang dipilih tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: `${result.affectedRows} data inventaris berhasil dihapus.`,
      deletedCount: result.affectedRows,
    });
  } catch (error) {
    console.error("Gagal menghapus banyak inventaris:", error.message);

    return res.status(500).json({
      success: false,
      message:
        "Gagal menghapus data terpilih. Sebagian data mungkin masih digunakan oleh tabel lain.",
    });
  }
});

// DELETE: menghapus inventaris berdasarkan ID
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM inventories WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Inventaris berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal menghapus inventaris:", error.message);
    res.status(500).json({
      success: false,
      message:
        "Gagal menghapus inventaris. Data mungkin masih digunakan oleh tabel lain.",
    });
  }
});

/* GET: cetak QR seluruh inventaris */
router.get("/print/qr", async (req, res) => {
  try {
    const [inventories] = await pool.query(`
      SELECT id, nomor_inventaris
      FROM inventories
      ORDER BY nomor_inventaris ASC
    `);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const items = await Promise.all(
      inventories.map(async (item) => {
        const documentUrl = `${baseUrl}/api/inventories/${item.id}/document`;

        const qrSvg = await QRCode.toString(documentUrl, {
          type: "svg",
          width: 170,
          margin: 2,
        });

        const safeNumber = String(item.nomor_inventaris)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");

        return `
          <div class="item">
            ${qrSvg}
            <br>
            <strong>${safeNumber}</strong>
          </div>
        `;
      }),
    );

    res.type("html").send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Print QR Sarana Inventaris</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .item {
            width: 220px;
            display: inline-block;
            margin: 20px;
            text-align: center;
            page-break-inside: avoid;
          }
          svg { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${items.join("")}
        <script>window.onload = () => window.print();</script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Gagal mencetak semua QR:", error.message);
    res.status(500).send("Gagal mencetak QR inventaris");
  }
});

/* GET: halaman QR untuk satu inventaris */
router.get("/:id/qr", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT id, nomor_inventaris
       FROM inventories
       WHERE id = ?`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).send("Inventaris tidak ditemukan");
    }

    const inventory = rows[0];

    // QR mengarah ke dokumen PDF inventaris
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const documentUrl = `${baseUrl}/api/inventories/${inventory.id}/document`;

    const qrSvg = await QRCode.toString(documentUrl, {
      type: "svg",
      width: 350,
      margin: 2,
    });

    res.type("html").send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>QR ${inventory.nomor_inventaris}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 30px;
            color: #182433;
          }
          .qr { margin: 20px auto; }
          .qr svg { width: 350px; max-width: 90vw; height: auto; }
          button { padding: 10px 18px; cursor: pointer; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h2>QR Code Sarana Inventaris</h2>
        <div class="qr">${qrSvg}</div>
        <h3>${String(inventory.nomor_inventaris)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</h3>
        <p>Sarana Inventaris</p>
        <button onclick="window.print()">Print QR</button>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Gagal membuat QR:", error.message);
    res.status(500).send("Gagal membuat QR inventaris");
  }
});

/* GET: dokumen PDF satu inventaris */
router.get("/:id/document", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT
        i.id,
        i.nomor_inventaris,
        i.user,
        i.status,
        i.tanggal_perolehan,
        i.spesifikasi,
        m.nama_sarana_inventaris,
        l.nama_lokasi,
        r.nama_penanggung_jawab,
        (
          SELECT MAX(so.tanggal)
          FROM inventory_stock_opnames AS so
          WHERE so.inventory_id = i.id
        ) AS update_stok_opname
      FROM inventories AS i
      LEFT JOIN master_sarana_inventaris AS m
        ON i.master_sarana_inventaris_id = m.id
      LEFT JOIN locations AS l ON i.location_id = l.id
      LEFT JOIN responsibles AS r ON i.responsible_id = r.id
      WHERE i.id = ?
    `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).send("Inventaris tidak ditemukan");
    }

    const item = rows[0];
    const filename = `Inventaris-${String(item.nomor_inventaris).replace(
      /[\/\\:*?"<>|]/g,
      "-",
    )}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);

    const pdf = new PDFDocument({
      size: "A4",
      margin: 45,
      info: { Title: "Dokumen Sarana Inventaris" },
    });

    pdf.on("error", (error) => {
      console.error("Gagal membuat PDF:", error.message);
      if (!res.headersSent) res.status(500);
      res.end();
    });

    pdf.pipe(res);

    pdf
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("DOKUMEN SARANA INVENTARIS", { align: "center" });

    pdf.moveDown();
    pdf.fontSize(12).font("Helvetica-Bold").text("INFORMASI SARANA INVENTARIS");

    pdf.moveDown(0.5);

    const fields = [
      ["Nomor Inventaris", item.nomor_inventaris],
      ["Sarana Inventaris", item.nama_sarana_inventaris],
      ["User", item.user],
      ["Lokasi", item.nama_lokasi],
      ["Penanggung Jawab", item.nama_penanggung_jawab],
      ["Status", item.status],
      ["Tanggal Perolehan", item.tanggal_perolehan],
      ["Spesifikasi", item.spesifikasi],
      ["Update Stok Opname", item.update_stok_opname],
    ];

    for (const [label, value] of fields) {
      pdf.font("Helvetica-Bold").fontSize(10).text(`${label}:`, {
        continued: true,
      });
      pdf.font("Helvetica").text(` ${value || "-"}`);
      pdf.moveDown(0.4);
    }

    pdf.end();
  } catch (error) {
    console.error("Gagal membuat dokumen inventaris:", error.message);
    if (!res.headersSent) {
      res.status(500).send("Gagal membuat dokumen inventaris");
    }
  }
});

module.exports = router;
