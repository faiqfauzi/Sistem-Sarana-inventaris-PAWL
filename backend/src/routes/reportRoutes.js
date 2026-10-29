const express = require("express");
const router = express.Router();
const db = require("../config/database");
const ExcelJS = require("exceljs");

// Daftar kolom yang tersedia untuk laporan
const availableColumns = {
  nomor_inventaris: "Nomor Inventaris",
  tanggal_perolehan: "Tanggal Perolehan",
  sarana_inventaris: "Sarana Inventaris",
  foto: "Foto",
  spesifikasi: "Spesifikasi",
  lokasi: "Lokasi",
  user: "User",
  penanggung_jawab: "Penanggung Jawab",
  tanggal_perawatan: "Tanggal Perawatan",
  jenis_perawatan: "Jenis Perawatan",
  tanggal_perbaikan: "Tanggal Perbaikan",
  jenis_perbaikan: "Jenis Perbaikan",
  foto_so: "Foto Stock Opname",
  tanggal_so: "Tanggal Stock Opname",
  status_kondisi: "Status / Kondisi",
};

// Pemetaan kolom frontend ke field hasil query database
const columnFields = {
  nomor_inventaris: "nomor_inventaris",
  tanggal_perolehan: "tanggal_perolehan",
  sarana_inventaris: "nama_sarana_inventaris",
  foto: "foto",
  spesifikasi: "spesifikasi",
  lokasi: "nama_lokasi",
  user: "user",
  penanggung_jawab: "nama_penanggung_jawab",
  tanggal_perawatan: "tanggal_perawatan",
  jenis_perawatan: "jenis_perawatan",
  tanggal_perbaikan: "tanggal_perbaikan",
  jenis_perbaikan: "jenis_perbaikan",
  foto_so: "foto_so",
  tanggal_so: "tanggal_so",
  status_kondisi: "kondisi_so",
};

// Query laporan utama dengan filter dan ID inventaris
async function getReportData(inventoryIds = null, filters = {}) {
  let sql = `
    SELECT
      i.id,
      i.nomor_inventaris,
      i.tanggal_perolehan,
      i.foto,
      i.spesifikasi,
      i.user,
      i.status,
      i.master_sarana_inventaris_id,
      i.location_id,
      i.responsible_id,

      m.nama_sarana_inventaris,
      l.nama_lokasi,
      r.nama_penanggung_jawab,

      (
        SELECT im.tanggal_perawatan
        FROM inventory_maintenances im
        WHERE im.inventory_id = i.id
        ORDER BY im.tanggal_perawatan DESC, im.id DESC
        LIMIT 1
      ) AS tanggal_perawatan,

      (
        SELECT im.jenis_perawatan
        FROM inventory_maintenances im
        WHERE im.inventory_id = i.id
        ORDER BY im.tanggal_perawatan DESC, im.id DESC
        LIMIT 1
      ) AS jenis_perawatan,

      (
        SELECT ir.tanggal_pengajuan
        FROM inventory_repairs ir
        WHERE ir.inventory_id = i.id
        ORDER BY ir.tanggal_pengajuan DESC, ir.id DESC
        LIMIT 1
      ) AS tanggal_perbaikan,

      (
        SELECT ir.jenis_perbaikan
        FROM inventory_repairs ir
        WHERE ir.inventory_id = i.id
        ORDER BY ir.tanggal_pengajuan DESC, ir.id DESC
        LIMIT 1
      ) AS jenis_perbaikan,

      (
        SELECT iso.foto
        FROM inventory_stock_opnames iso
        WHERE iso.inventory_id = i.id
        ORDER BY iso.tanggal DESC, iso.id DESC
        LIMIT 1
      ) AS foto_so,

      (
        SELECT iso.tanggal
        FROM inventory_stock_opnames iso
        WHERE iso.inventory_id = i.id
        ORDER BY iso.tanggal DESC, iso.id DESC
        LIMIT 1
      ) AS tanggal_so,

      (
        SELECT iso.kondisi
        FROM inventory_stock_opnames iso
        WHERE iso.inventory_id = i.id
        ORDER BY iso.tanggal DESC, iso.id DESC
        LIMIT 1
      ) AS kondisi_so

    FROM inventories i
    LEFT JOIN master_sarana_inventaris m
      ON m.id = i.master_sarana_inventaris_id
    LEFT JOIN locations l
      ON l.id = i.location_id
    LEFT JOIN responsibles r
      ON r.id = i.responsible_id
    WHERE 1 = 1
  `;

  const params = [];

  if (Array.isArray(inventoryIds)) {
    if (inventoryIds.length === 0) {
      return [];
    }

    sql += ` AND i.id IN (${inventoryIds.map(() => "?").join(", ")})`;
    params.push(...inventoryIds);
  }

  const {
    tanggal_awal,
    tanggal_akhir,
    master_sarana_inventaris_id,
    location_id,
    responsible_id,
  } = filters || {};

  if (tanggal_awal) {
    sql += " AND i.tanggal_perolehan >= ?";
    params.push(tanggal_awal);
  }

  if (tanggal_akhir) {
    sql += " AND i.tanggal_perolehan <= ?";
    params.push(tanggal_akhir);
  }

  if (master_sarana_inventaris_id) {
    sql += " AND i.master_sarana_inventaris_id = ?";
    params.push(master_sarana_inventaris_id);
  }

  if (location_id) {
    sql += " AND i.location_id = ?";
    params.push(location_id);
  }

  if (responsible_id) {
    sql += " AND i.responsible_id = ?";
    params.push(responsible_id);
  }

  sql += " ORDER BY i.nomor_inventaris ASC";

  const [rows] = await db.query(sql, params);
  return rows;
}

// GET /api/reports/options
router.get("/options", async (req, res) => {
  try {
    const [locations] = await db.query(
      "SELECT id, nama_lokasi FROM locations ORDER BY nama_lokasi",
    );

    const [responsibles] = await db.query(`
      SELECT id, nama_penanggung_jawab
      FROM responsibles
      ORDER BY nama_penanggung_jawab
    `);

    const [masterSaranaInventaris] = await db.query(`
      SELECT id, nama_sarana_inventaris
      FROM master_sarana_inventaris
      ORDER BY nama_sarana_inventaris
    `);

    res.json({
      locations,
      responsibles,
      masterSaranaInventaris,
      availableColumns,
    });
  } catch (error) {
    console.error("Gagal mengambil opsi laporan:", error);
    res.status(500).json({
      message: "Gagal mengambil opsi laporan",
    });
  }
});

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    const inventories = await getReportData(null, req.query);

    res.json({
      inventories,
      availableColumns,
      total: inventories.length,
    });
  } catch (error) {
    console.error("Gagal mengambil laporan:", error);
    res.status(500).json({
      message: "Gagal mengambil data laporan",
    });
  }
});

// POST /api/reports/export/excel
router.post("/export/excel", async (req, res) => {
  try {
    const { inventory_ids, columns, filters } = req.body;

    if (!Array.isArray(inventory_ids) || inventory_ids.length === 0) {
      return res.status(400).json({
        message: "Pilih minimal satu inventaris untuk diekspor.",
      });
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: "Pilih minimal satu kolom laporan.",
      });
    }

    const validIds = inventory_ids.filter(
      (id) => Number.isInteger(Number(id)) && Number(id) > 0,
    );

    const validColumns = [...new Set(columns)].filter((column) =>
      Object.prototype.hasOwnProperty.call(availableColumns, column),
    );

    if (validIds.length === 0) {
      return res.status(400).json({
        message: "ID inventaris yang dipilih tidak valid.",
      });
    }

    if (validColumns.length === 0) {
      return res.status(400).json({
        message: "Kolom laporan yang dipilih tidak valid.",
      });
    }

    const rows = await getReportData(validIds, filters || {});

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sistem Inventaris";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("Laporan Inventaris");

    worksheet.columns = validColumns.map((column) => ({
      header: availableColumns[column],
      key: column,
      width: Math.max(18, availableColumns[column].length + 4),
    }));

    rows.forEach((item) => {
      const exportRow = {};

      validColumns.forEach((column) => {
        let value = item[columnFields[column]];

        if (column === "status_kondisi") {
          value = item.kondisi_so || item.status || "-";
        }

        if (value instanceof Date) {
          value = value.toISOString().slice(0, 10);
        }

        exportRow[column] = value ?? "-";
      });

      worksheet.addRow(exportRow);
    });

    const header = worksheet.getRow(1);
    header.font = { bold: true };
    header.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    header.height = 28;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = {
          vertical: "middle",
          wrapText: true,
        };
      }
    });

    worksheet.views = [{ state: "frozen", ySplit: 1 }];
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: validColumns.length },
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="laporan-inventaris.xlsx"',
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Gagal export Excel:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Gagal mengekspor laporan Excel.",
      });
    }
  }
});

const PDFDocument = require("pdfkit");

// POST /api/reports/export/pdf
router.post("/export/pdf", async (req, res) => {
  try {
    const { inventory_ids, columns, filters } = req.body;

    if (!Array.isArray(inventory_ids) || inventory_ids.length === 0) {
      return res.status(400).json({
        message: "Pilih minimal satu inventaris untuk diekspor.",
      });
    }

    if (!Array.isArray(columns) || columns.length === 0) {
      return res.status(400).json({
        message: "Pilih minimal satu kolom laporan.",
      });
    }

    const validIds = inventory_ids.filter(
      (id) => Number.isInteger(Number(id)) && Number(id) > 0,
    );

    const validColumns = [...new Set(columns)].filter((column) =>
      Object.prototype.hasOwnProperty.call(availableColumns, column),
    );

    if (validIds.length === 0 || validColumns.length === 0) {
      return res.status(400).json({
        message: "Data inventaris atau kolom laporan tidak valid.",
      });
    }

    // Mengambil data dengan filter dan ID yang dipilih
    const rows = await getReportData(validIds, filters || {});

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margins: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
      bufferPages: false,
      autoFirstPage: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="laporan-inventaris.pdf"',
    );

    doc.pipe(res);

    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const left = doc.page.margins.left;
    const bottomLimit = doc.page.height - doc.page.margins.bottom;

    // Pemetaan kolom yang ditampilkan ke field database
    const fields = {
      nomor_inventaris: "nomor_inventaris",
      tanggal_perolehan: "tanggal_perolehan",
      sarana_inventaris: "nama_sarana_inventaris",
      foto: "foto",
      spesifikasi: "spesifikasi",
      lokasi: "nama_lokasi",
      user: "user",
      penanggung_jawab: "nama_penanggung_jawab",
      tanggal_perawatan: "tanggal_perawatan",
      jenis_perawatan: "jenis_perawatan",
      tanggal_perbaikan: "tanggal_perbaikan",
      jenis_perbaikan: "jenis_perbaikan",
      foto_so: "foto_so",
      tanggal_so: "tanggal_so",
      status_kondisi: "kondisi_so",
    };

    const formatValue = (value) => {
      if (value === null || value === undefined || value === "") {
        return "-";
      }

      if (value instanceof Date) {
        return value.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }

      return String(value);
    };

    // Lebar kolom dibagi rata agar sesuai halaman landscape
    const columnWidth = pageWidth / validColumns.length;
    const padding = 4;
    const fontSize = validColumns.length > 9 ? 6 : 8;
    const headerFontSize = validColumns.length > 9 ? 6 : 7;

    const drawTitle = () => {
      doc
        .font("Helvetica-Bold")
        .fontSize(15)
        .text("LAPORAN SARANA INVENTARIS", left, 30, {
          width: pageWidth,
          align: "center",
        });

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          `Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`,
          left,
          52,
          {
            width: pageWidth,
            align: "center",
          },
        );

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(`Jumlah data: ${rows.length} inventaris`, left, 66);

      doc.y = 84;
    };

    const drawTableHeader = () => {
      const headerY = doc.y;

      doc.font("Helvetica-Bold").fontSize(headerFontSize);

      const headerHeights = validColumns.map((column) =>
        doc.heightOfString(availableColumns[column], {
          width: columnWidth - padding * 2,
          align: "left",
        }),
      );

      const headerHeight = Math.max(24, ...headerHeights) + padding * 2;

      doc.rect(left, headerY, pageWidth, headerHeight).fill("#e5e7eb");

      doc.fillColor("#111827");

      validColumns.forEach((column, index) => {
        const x = left + index * columnWidth;

        doc.text(availableColumns[column], x + padding, headerY + padding, {
          width: columnWidth - padding * 2,
          height: headerHeight - padding * 2,
          align: "left",
          valign: "center",
        });

        if (index > 0) {
          doc
            .moveTo(x, headerY)
            .lineTo(x, headerY + headerHeight)
            .strokeColor("#9ca3af")
            .lineWidth(0.5)
            .stroke();
        }
      });

      doc
        .rect(left, headerY, pageWidth, headerHeight)
        .strokeColor("#9ca3af")
        .lineWidth(0.5)
        .stroke();

      doc.y = headerY + headerHeight;
    };

    const drawPageHeading = () => {
      drawTitle();
      drawTableHeader();
    };

    drawPageHeading();

    if (rows.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#111827")
        .text(
          "Tidak ada data yang sesuai dengan pilihan filter.",
          left,
          doc.y + 12,
        );
    }

    rows.forEach((item, rowIndex) => {
      const values = validColumns.map((column) => {
        let value = item[fields[column]];

        if (column === "status_kondisi") {
          value = item.kondisi_so || item.status || "-";
        }

        return formatValue(value);
      });

      doc.font("Helvetica").fontSize(fontSize);

      const cellHeights = values.map((value) =>
        doc.heightOfString(value, {
          width: columnWidth - padding * 2,
          align: "left",
        }),
      );

      const rowHeight = Math.max(22, ...cellHeights) + padding * 2;

      if (doc.y + rowHeight > bottomLimit) {
        doc.addPage();
        drawPageHeading();
      }

      const rowY = doc.y;

      if (rowIndex % 2 === 1) {
        doc.rect(left, rowY, pageWidth, rowHeight).fill("#f9fafb");
      }

      doc.fillColor("#111827");
      doc.font("Helvetica").fontSize(fontSize);

      values.forEach((value, index) => {
        const x = left + index * columnWidth;

        doc.text(value, x + padding, rowY + padding, {
          width: columnWidth - padding * 2,
          height: rowHeight - padding * 2,
          align: "left",
          valign: "top",
        });

        if (index > 0) {
          doc
            .moveTo(x, rowY)
            .lineTo(x, rowY + rowHeight)
            .strokeColor("#d1d5db")
            .lineWidth(0.4)
            .stroke();
        }
      });

      doc
        .moveTo(left, rowY + rowHeight)
        .lineTo(left + pageWidth, rowY + rowHeight)
        .strokeColor("#d1d5db")
        .lineWidth(0.4)
        .stroke();

      doc.y = rowY + rowHeight;
    });

    doc.end();
  } catch (error) {
    console.error("Gagal export PDF:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Gagal mengekspor laporan PDF.",
      });
    } else {
      res.destroy(error);
    }
  }
});

module.exports = router;
