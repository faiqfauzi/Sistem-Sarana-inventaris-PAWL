const db = require("../config/database");

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const [
      masterResult,
      inventarisResult,
      lokasiResult,
      penanggungJawabResult,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM master_sarana_inventaris"),
      db.query("SELECT COUNT(*) AS total FROM inventories"),
      db.query("SELECT COUNT(*) AS total FROM locations"),
      db.query("SELECT COUNT(*) AS total FROM responsibles"),
    ]);

    res.json({
      success: true,
      data: {
        masterSaranaInventaris: Number(masterResult[0][0].total),
        totalInventaris: Number(inventarisResult[0][0].total),
        lokasi: Number(lokasiResult[0][0].total),
        penanggungJawab: Number(penanggungJawabResult[0][0].total),
      },
    });
  } catch (error) {
    console.error("Error dashboard:", error);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik dashboard.",
      error: error.message,
    });
  }
};
