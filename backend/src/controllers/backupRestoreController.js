const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const pool = require("../config/database");

const backupDirectory = path.resolve(__dirname, "../../backups");

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: String(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || "sistem_inventaris",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  };
}

function getExecutable(envName, fallback) {
  return process.env[envName] || fallback;
}

function runDatabaseCommand(executable, args, inputStream = null) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderr = "";

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(stderr.trim() || `Proses database gagal (kode ${code}).`),
        );
      }
    });

    if (inputStream) {
      inputStream.pipe(child.stdin);
      inputStream.on("error", (error) => child.stdin.destroy(error));
    } else {
      child.stdin.end();
    }
  });
}

function databaseArgs(includeDatabase = true) {
  const db = getDatabaseConfig();

  const args = [
    `--host=${db.host}`,
    `--port=${db.port}`,
    `--user=${db.user}`,
    "--protocol=tcp",
  ];

  if (db.password) {
    args.push(`--password=${db.password}`);
  }

  if (includeDatabase) {
    args.push(db.database);
  }

  return args;
}

async function createBackup(destination) {
  const executable = getExecutable("MYSQL_DUMP_PATH", "mysqldump");

  const args = [
    ...databaseArgs(),
    "--single-transaction",
    "--routines",
    "--triggers",
    "--result-file=" + destination,
  ];

  await runDatabaseCommand(executable, args);

  if (!fs.existsSync(destination) || fs.statSync(destination).size === 0) {
    throw new Error("File backup tidak berhasil dibuat atau kosong.");
  }
}

function safeUnlink(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// GET /api/backup-restore/download
exports.download = async (req, res) => {
  const filename = `backup-inventaris-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.sql`;

  const destination = path.join(os.tmpdir(), filename);

  try {
    await createBackup(destination);

    res.download(destination, filename, (error) => {
      safeUnlink(destination);

      if (error && !res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Gagal mengunduh file backup.",
        });
      }
    });
  } catch (error) {
    console.error("Backup download error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Backup database gagal dibuat. Periksa terminal backend.",
      });
    }
  }
};

// POST /api/backup-restore/restore
exports.restore = async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: "Pilih file backup berformat .sql.",
    });
  }

  const confirmation = req.body.confirmation;

  if (!["1", "true", "on"].includes(String(confirmation))) {
    safeUnlink(uploadedFile.path);

    return res.status(400).json({
      success: false,
      message: "Konfirmasi restore wajib dicentang.",
    });
  }

  try {
    // Siapkan folder emergency backup.
    fs.mkdirSync(backupDirectory, { recursive: true });

    const emergencyFilename = `emergency-before-restore-${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.sql`;

    const emergencyPath = path.join(backupDirectory, emergencyFilename);

    // Pastikan koneksi database tersedia.
    await pool.query("SELECT 1");

    // Backup database sekarang sebelum restore.
    await createBackup(emergencyPath);

    // Jalankan restore dari file SQL yang diunggah.
    const mysqlExecutable = getExecutable("MYSQL_PATH", "mysql");
    const restoreStream = fs.createReadStream(uploadedFile.path);

    await runDatabaseCommand(mysqlExecutable, databaseArgs(), restoreStream);

    return res.json({
      success: true,
      message:
        "Database berhasil dipulihkan. Emergency backup dibuat sebelum restore.",
    });
  } catch (error) {
    console.error("Restore database gagal:", error);

    return res.status(500).json({
      success: false,
      message:
        "Restore database gagal. Periksa terminal backend untuk detail error.",
    });
  } finally {
    // File upload sementara dihapus; emergency backup tetap disimpan.
    safeUnlink(uploadedFile.path);
  }
};
