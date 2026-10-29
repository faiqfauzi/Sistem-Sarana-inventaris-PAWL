const express = require("express");
const router = express.Router();
const pool = require("../config/database");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

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
router.post("/", async (req, res) => {
  try {
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
        message: "Nomor inventaris wajib diisi",
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
        responsible_id || null,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Inventaris berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Gagal menambah inventaris:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal menambah inventaris. Periksa kolom dan relasi database.",
    });
  }
});

/* GET: detail satu inventaris beserta 4 riwayat terbaru */

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
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
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
        message: "Nomor inventaris wajib diisi",
      });
    }

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
        responsible_id || null,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Inventaris tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Inventaris berhasil diperbarui",
    });
  } catch (error) {
    console.error("Gagal mengedit inventaris:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengedit inventaris. Periksa kolom dan relasi database.",
    });
  }
});

/* DELETE: menghapus beberapa inventaris sekaligus */
router.delete("/bulk", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
