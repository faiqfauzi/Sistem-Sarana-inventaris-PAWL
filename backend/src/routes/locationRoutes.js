const express = require("express");
const router = express.Router();
const db = require("../config/database");
const QRCode = require("qrcode");
const adminMiddleware = require("../middleware/adminMiddleware");

const PAGE_SIZE = 10;

// GET /api/locations?search=&page=1
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const offset = (page - 1) * PAGE_SIZE;
    const keyword = `%${search}%`;

    const [[countRow]] = await db.query(
      `SELECT COUNT(*) AS total
       FROM locations
       WHERE nama_lokasi LIKE ?`,
      [keyword],
    );

    const [rows] = await db.query(
      `SELECT
         l.id,
         l.nama_lokasi,
         l.keterangan,
         l.created_at,
         l.updated_at,
         (SELECT COUNT(*)
          FROM inventories i
          WHERE i.location_id = l.id) AS jumlah_inventaris
       FROM locations l
       WHERE l.nama_lokasi LIKE ?
       ORDER BY l.nama_lokasi ASC
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
    console.error("Gagal mengambil data lokasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data lokasi.",
    });
  }
});

// GET /api/locations/print/qr
// Cetak QR Code semua lokasi.
router.get("/print/qr", async (req, res) => {
  try {
    const [locations] = await db.execute(
      `SELECT id, nama_lokasi, keterangan
       FROM locations
       ORDER BY nama_lokasi ASC`,
    );

    if (locations.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="UTF-8" />
            <title>QR Code Lokasi</title>
          </head>
          <body>
            <h2>Belum ada data lokasi untuk dicetak.</h2>
          </body>
        </html>
      `);
    }

    const frontendUrl = "http://localhost:5173";

    const cards = await Promise.all(
      locations.map(async (location) => {
        // QR mengarah ke halaman detail lokasi di aplikasi React.
        const detailUrl = `${frontendUrl}/lokasi/${location.id}`;

        const qrCode = await QRCode.toDataURL(detailUrl, {
          width: 170,
          margin: 1,
          errorCorrectionLevel: "H",
        });

        const escapeHtml = (value) =>
          String(value ?? "").replace(/[&<>"']/g, (character) => {
            const entities = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            };

            return entities[character];
          });

        return `
          <div class="qr-card">
            <img src="${qrCode}" alt="QR Code ${escapeHtml(location.nama_lokasi)}" />
            <div class="location-name">${escapeHtml(location.nama_lokasi)}</div>
            <div class="location-id">ID Lokasi: ${location.id}</div>
          </div>
        `;
      }),
    );

    res.setHeader("Content-Type", "text/html; charset=utf-8");

    res.send(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Cetak Semua QR Lokasi</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 24px;
              font-family: Arial, sans-serif;
              color: #222;
            }

            .page-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 16px;
              margin-bottom: 24px;
            }

            .page-header h1 {
              margin: 0 0 6px;
              font-size: 24px;
            }

            .page-header p {
              margin: 0;
              color: #666;
              font-size: 13px;
            }

            .print-button {
              border: none;
              border-radius: 5px;
              background: #0d6efd;
              color: white;
              padding: 10px 16px;
              cursor: pointer;
              font-size: 14px;
            }

            .qr-grid {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 18px;
            }

            .qr-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 235px;
              padding: 14px;
              border: 1px solid #ccc;
              border-radius: 6px;
              text-align: center;
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .qr-card img {
              width: 170px;
              height: 170px;
              object-fit: contain;
            }

            .location-name {
              margin-top: 8px;
              font-size: 15px;
              font-weight: bold;
              overflow-wrap: anywhere;
            }

            .location-id {
              margin-top: 4px;
              font-size: 11px;
              color: #666;
            }

            @media (max-width: 900px) {
              .qr-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
              }
            }

            @media print {
              @page {
                size: A4 portrait;
                margin: 10mm;
              }

              body {
                padding: 0;
              }

              .page-header {
                margin-bottom: 16px;
              }

              .page-header h1 {
                font-size: 18px;
              }

              .print-button {
                display: none;
              }

              .qr-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 8px;
              }

              .qr-card {
                min-height: 200px;
                padding: 8px;
                border: 1px solid #999;
              }

              .qr-card img {
                width: 140px;
                height: 140px;
              }

              .location-name {
                font-size: 12px;
              }

              .location-id {
                font-size: 10px;
              }
            }
          </style>
        </head>

        <body>
          <div class="page-header">
            <div>
              <h1>QR Code Lokasi</h1>
              <p>Total lokasi: ${locations.length}</p>
            </div>

            <button class="print-button" onclick="window.print()">
              Cetak Semua QR
            </button>
          </div>

          <div class="qr-grid">
            ${cards.join("")}
          </div>

          <script>
            window.addEventListener("load", () => {
              setTimeout(() => window.print(), 500);
            });
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Gagal membuat QR Code lokasi:", error);

    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <title>Gagal Mencetak QR</title>
        </head>
        <body>
          <h2>Gagal membuat QR Code lokasi.</h2>
          <p>Silakan periksa terminal backend untuk detail kesalahan.</p>
        </body>
      </html>
    `);
  }
});

// GET /api/locations/:id
// Detail lokasi, ringkasan sarana, dan daftar inventaris.
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID lokasi tidak valid.",
      });
    }

    const [locations] = await db.execute(
      `SELECT id, nama_lokasi, keterangan, created_at, updated_at
       FROM locations
       WHERE id = ?`,
      [id],
    );

    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lokasi tidak ditemukan.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = PAGE_SIZE;
    const offset = (page - 1) * pageSize;

    const [[countRow]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM inventories
       WHERE location_id = ?`,
      [id],
    );

    const [summary] = await db.execute(
      `SELECT
         m.id AS master_sarana_inventaris_id,
         m.nama_sarana_inventaris AS nama,
         COUNT(i.id) AS jumlah
       FROM inventories i
       LEFT JOIN master_sarana_inventaris m
         ON m.id = i.master_sarana_inventaris_id
       WHERE i.location_id = ?
       GROUP BY m.id, m.nama_sarana_inventaris
       ORDER BY m.nama_sarana_inventaris ASC`,
      [id],
    );

    const [inventories] = await db.execute(
      `SELECT
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
         r.nama_penanggung_jawab
       FROM inventories i
       LEFT JOIN master_sarana_inventaris m
         ON m.id = i.master_sarana_inventaris_id
       LEFT JOIN responsibles r
         ON r.id = i.responsible_id
       WHERE i.location_id = ?
       ORDER BY i.nomor_inventaris ASC
       LIMIT ? OFFSET ?`,
      [id, pageSize, offset],
    );

    res.json({
      success: true,
      data: {
        location: locations[0],
        summary,
        inventories,
        pagination: {
          current_page: page,
          per_page: pageSize,
          total: countRow.total,
          last_page: Math.max(1, Math.ceil(countRow.total / pageSize)),
        },
      },
    });
  } catch (error) {
    console.error("Gagal mengambil detail lokasi:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail lokasi.",
    });
  }
});

// POST /api/locations
router.post("/", adminMiddleware, async (req, res) => {
  try {
    const nama_lokasi = String(req.body.nama_lokasi || "").trim();
    const keterangan = String(req.body.keterangan || "").trim();

    if (!nama_lokasi) {
      return res.status(400).json({
        success: false,
        message: "Nama lokasi wajib diisi.",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM locations WHERE nama_lokasi = ? LIMIT 1",
      [nama_lokasi],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama lokasi sudah digunakan.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO locations
         (nama_lokasi, keterangan, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [nama_lokasi, keterangan || null],
    );

    res.status(201).json({
      success: true,
      message: "Lokasi berhasil ditambahkan.",
      data: {
        id: result.insertId,
        nama_lokasi,
        keterangan: keterangan || null,
      },
    });
  } catch (error) {
    console.error("Gagal menambahkan lokasi:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Nama lokasi sudah digunakan.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal menambahkan lokasi.",
    });
  }
});

// PUT /api/locations/:id
router.put("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const nama_lokasi = String(req.body.nama_lokasi || "").trim();
    const keterangan = String(req.body.keterangan || "").trim();

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID lokasi tidak valid.",
      });
    }

    if (!nama_lokasi) {
      return res.status(400).json({
        success: false,
        message: "Nama lokasi wajib diisi.",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM locations WHERE nama_lokasi = ? AND id <> ? LIMIT 1",
      [nama_lokasi, id],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Nama lokasi sudah digunakan.",
      });
    }

    const [result] = await db.execute(
      `UPDATE locations
       SET nama_lokasi = ?, keterangan = ?, updated_at = NOW()
       WHERE id = ?`,
      [nama_lokasi, keterangan || null, id],
    );

    if (result.affectedRows === 0) {
      const [found] = await db.execute(
        "SELECT id FROM locations WHERE id = ?",
        [id],
      );

      if (found.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lokasi tidak ditemukan.",
        });
      }
    }

    res.json({
      success: true,
      message: "Lokasi berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui lokasi:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "Nama lokasi sudah digunakan.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal memperbarui lokasi.",
    });
  }
});

// DELETE /api/locations/:id
router.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID lokasi tidak valid.",
      });
    }

    const [result] = await db.execute("DELETE FROM locations WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Lokasi tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      message: "Lokasi berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus lokasi:", error);

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_NO_REFERENCED_ROW_2"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Lokasi tidak dapat dihapus karena masih digunakan oleh data inventaris.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Gagal menghapus lokasi.",
    });
  }
});

module.exports = router;
