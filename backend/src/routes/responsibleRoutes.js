const express = require("express");
const router = express.Router();
const db = require("../config/database");
const adminMiddleware = require("../middleware/adminMiddleware");

const PAGE_SIZE = 10;

// GET /api/responsibles - Daftar dan pencarian
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * PAGE_SIZE;
    const keyword = `%${search}%`;

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM responsibles
       WHERE nama_penanggung_jawab LIKE ?`,
      [keyword],
    );

    const [rows] = await db.query(
      `SELECT
         r.id,
         r.nama_penanggung_jawab,
         r.created_at,
         r.updated_at,
         (
           SELECT COUNT(*)
           FROM inventories i
           WHERE i.responsible_id = r.id
         ) AS jumlah_inventaris
       FROM responsibles r
       WHERE r.nama_penanggung_jawab LIKE ?
       ORDER BY r.nama_penanggung_jawab ASC
       LIMIT ? OFFSET ?`,
      [keyword, PAGE_SIZE, offset],
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        current_page: page,
        per_page: PAGE_SIZE,
        total: countRow.total,
        last_page: Math.max(1, Math.ceil(countRow.total / PAGE_SIZE)),
      },
    });
  } catch (error) {
    console.error("Gagal mengambil data penanggung jawab:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data penanggung jawab.",
    });
  }
});

// DOCUMENT STOCK OPNAME PENANGGUNG JAWAB
router.get("/:id/document-stock-opname", async (req, res) => {
  try {
    const { id } = req.params;

    const [responsibles] = await db.query(
      `SELECT id, nama_penanggung_jawab
       FROM responsibles
       WHERE id = ?`,
      [id],
    );

    if (responsibles.length === 0) {
      return res.status(404).send("Penanggung jawab tidak ditemukan.");
    }

    const [rows] = await db.query(
      `SELECT
          i.nomor_inventaris,
          m.nama_sarana_inventaris,
          i.user,
          l.nama_lokasi,
          i.spesifikasi,
          i.tanggal_perolehan,
          i.status,
          so.tanggal AS tanggal_stock_opname,
          so.kondisi,
          so.auditor
       FROM inventory_stock_opnames so
       JOIN inventories i ON i.id = so.inventory_id
       LEFT JOIN master_sarana_inventaris m
         ON m.id = i.master_sarana_inventaris_id
       LEFT JOIN locations l ON l.id = i.location_id
       WHERE i.responsible_id = ?
       ORDER BY so.tanggal DESC`,
      [id],
    );

    const escapeHtml = (value) =>
      String(value ?? "-").replace(
        /[&<>"']/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char],
      );

    const tanggal = (value) =>
      value
        ? new Date(value).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC",
          })
        : "-";

    const tableRows = rows.length
      ? rows
          .map(
            (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.nomor_inventaris)}</td>
            <td>${escapeHtml(item.nama_sarana_inventaris)}</td>
            <td>${escapeHtml(item.user)}</td>
            <td>${escapeHtml(item.nama_lokasi)}</td>
            <td>${escapeHtml(item.spesifikasi)}</td>
            <td>${tanggal(item.tanggal_perolehan)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${tanggal(item.tanggal_stock_opname)}</td>
            <td>${escapeHtml(item.kondisi)}</td>
            <td>${escapeHtml(item.auditor)}</td>
          </tr>
        `,
          )
          .join("")
      : `<tr><td colspan="11">Belum ada data Stock Opname.</td></tr>`;

    const nama = escapeHtml(responsibles[0].nama_penanggung_jawab);

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Dokumen Stock Opname</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #111; }
          h2, p { text-align: center; margin: 5px 0; }
          .info { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 5px; text-align: left; }
          th { text-align: center; background: #eee; }
          button { margin-bottom: 15px; padding: 8px 14px; cursor: pointer; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Cetak / Simpan PDF</button>
        <h2>DOKUMEN STOCK OPNAME</h2>
        <p>Sistem Sarana Inventaris</p>
        <div class="info">
          <strong>Penanggung Jawab:</strong> ${nama}
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th><th>Nomor Inventaris</th><th>Sarana Inventaris</th>
              <th>User</th><th>Lokasi</th><th>Spesifikasi</th>
              <th>Tanggal Perolehan</th><th>Status</th>
              <th>Tanggal Stock Opname</th><th>Kondisi</th><th>Auditor</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Gagal membuat dokumen Stock Opname:", error);
    res.status(500).send("Gagal membuat dokumen Stock Opname.");
  }
});

// GET /api/responsibles/:id - Detail penanggung jawab dan inventaris
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID penanggung jawab tidak valid.",
      });
    }

    const [responsibles] = await db.query(
      `SELECT id, nama_penanggung_jawab, created_at, updated_at
       FROM responsibles
       WHERE id = ?`,
      [id],
    );

    if (responsibles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data penanggung jawab tidak ditemukan.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * PAGE_SIZE;

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM inventories
       WHERE responsible_id = ?`,
      [id],
    );

    const [inventories] = await db.query(
      `SELECT
         i.id,
         i.nomor_inventaris,
         i.user,
         i.status,
         i.tanggal_perolehan,
         i.spesifikasi,
         i.master_sarana_inventaris_id,
         i.location_id,
         i.responsible_id,
         m.nama_sarana_inventaris,
         l.nama_lokasi
       FROM inventories i
       LEFT JOIN master_sarana_inventaris m
         ON m.id = i.master_sarana_inventaris_id
       LEFT JOIN locations l
         ON l.id = i.location_id
       WHERE i.responsible_id = ?
       ORDER BY i.nomor_inventaris ASC
       LIMIT ? OFFSET ?`,
      [id, PAGE_SIZE, offset],
    );

    const [summary] = await db.query(
      `SELECT
         i.master_sarana_inventaris_id,
         COALESCE(m.nama_sarana_inventaris, 'Tidak ditentukan') AS nama,
         COUNT(*) AS jumlah
       FROM inventories i
       LEFT JOIN master_sarana_inventaris m
         ON m.id = i.master_sarana_inventaris_id
       WHERE i.responsible_id = ?
       GROUP BY i.master_sarana_inventaris_id, m.nama_sarana_inventaris
       ORDER BY nama ASC`,
      [id],
    );

    res.json({
      success: true,
      data: {
        responsible: responsibles[0],
        summary,
        inventories,
        pagination: {
          current_page: page,
          per_page: PAGE_SIZE,
          total: countRow.total,
          last_page: Math.max(1, Math.ceil(countRow.total / PAGE_SIZE)),
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil detail penanggung jawab:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail penanggung jawab.",
    });
  }
});

// POST /api/responsibles - Tambah penanggung jawab
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const nama = String(req.body.nama_penanggung_jawab || "").trim();

    if (!nama) {
      return res.status(422).json({
        success: false,
        message: "Nama penanggung jawab wajib diisi.",
      });
    }

    if (nama.length > 255) {
      return res.status(422).json({
        success: false,
        message: "Nama penanggung jawab maksimal 255 karakter.",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM responsibles
       WHERE nama_penanggung_jawab = ?
       LIMIT 1`,
      [nama],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama penanggung jawab sudah digunakan.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO responsibles (nama_penanggung_jawab, created_at, updated_at)
       VALUES (?, NOW(), NOW())`,
      [nama],
    );

    const [rows] = await db.query(
      `SELECT id, nama_penanggung_jawab, created_at, updated_at
       FROM responsibles
       WHERE id = ?`,
      [result.insertId],
    );

    res.status(201).json({
      success: true,
      message: "Penanggung jawab berhasil ditambahkan.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Gagal menambahkan penanggung jawab:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Nama penanggung jawab sudah digunakan.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan penanggung jawab.",
    });
  }
});

// PUT /api/responsibles/:id - Edit penanggung jawab
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nama = String(req.body.nama_penanggung_jawab || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID penanggung jawab tidak valid.",
      });
    }

    if (!nama) {
      return res.status(422).json({
        success: false,
        message: "Nama penanggung jawab wajib diisi.",
      });
    }

    if (nama.length > 255) {
      return res.status(422).json({
        success: false,
        message: "Nama penanggung jawab maksimal 255 karakter.",
      });
    }

    const [responsibles] = await db.query(
      `SELECT id
       FROM responsibles
       WHERE id = ?`,
      [id],
    );

    if (responsibles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data penanggung jawab tidak ditemukan.",
      });
    }

    const [existing] = await db.query(
      `SELECT id
       FROM responsibles
       WHERE nama_penanggung_jawab = ? AND id <> ?
       LIMIT 1`,
      [nama, id],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama penanggung jawab sudah digunakan.",
      });
    }

    await db.query(
      `UPDATE responsibles
       SET nama_penanggung_jawab = ?, updated_at = NOW()
       WHERE id = ?`,
      [nama, id],
    );

    const [rows] = await db.query(
      `SELECT id, nama_penanggung_jawab, created_at, updated_at
       FROM responsibles
       WHERE id = ?`,
      [id],
    );

    res.json({
      success: true,
      message: "Penanggung jawab berhasil diperbarui.",
      data: rows[0],
    });
  } catch (error) {
    console.error("Gagal memperbarui penanggung jawab:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Nama penanggung jawab sudah digunakan.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui penanggung jawab.",
    });
  }
});

// DELETE /api/responsibles/:id - Hapus penanggung jawab
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID penanggung jawab tidak valid.",
      });
    }

    const [responsibles] = await db.query(
      `SELECT id
       FROM responsibles
       WHERE id = ?`,
      [id],
    );

    if (responsibles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data penanggung jawab tidak ditemukan.",
      });
    }

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM inventories
       WHERE responsible_id = ?`,
      [id],
    );

    if (Number(countRow.total) > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Penanggung jawab tidak dapat dihapus karena masih memiliki data inventaris.",
      });
    }

    await db.query(
      `DELETE FROM responsibles
       WHERE id = ?`,
      [id],
    );

    res.json({
      success: true,
      message: "Penanggung jawab berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus penanggung jawab:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus penanggung jawab.",
    });
  }
});

module.exports = router;
