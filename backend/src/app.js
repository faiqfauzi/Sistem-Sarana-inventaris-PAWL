require("dotenv").config();

const express = require("express");
const pool = require("./config/database");
const cookieParser = require("cookie-parser");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const apiRoutes = require("./routes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const masterSaranaRoutes = require("./routes/masterSaranaRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const locationRoutes = require("./routes/locationRoutes");
const responsibleRoutes = require("./routes/responsibleRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

const cors = require("cors");

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(cookieParser());

// Endpoint autentikasi tetap dapat diakses tanpa login
app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/reports/export", authMiddleware);


// Lindungi API aplikasi setelah endpoint autentikasi didaftarkan
app.use("/api", authMiddleware);
app.use("/api", apiRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/master-sarana", masterSaranaRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/responsibles", responsibleRoutes);


app.get("/api/db-health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.json({
      success: true,
      message: "Database berhasil terhubung",
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Koneksi database gagal",
    });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const [[masterRows], [inventoryRows], [locationRows], [responsibleRows]] =
      await Promise.all([
        pool.query("SELECT COUNT(*) AS total FROM master_sarana_inventaris"),
        pool.query("SELECT COUNT(*) AS total FROM inventories"),
        pool.query("SELECT COUNT(*) AS total FROM locations"),
        pool.query("SELECT COUNT(*) AS total FROM responsibles"),
      ]);

    res.json({
      success: true,
      stats: {
        masterSaranaInventaris: masterRows[0].total,
        totalInventaris: inventoryRows[0].total,
        lokasi: locationRows[0].total,
        penanggungJawab: responsibleRows[0].total,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik dashboard",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Express berjalan di http://localhost:${PORT}`);
});
