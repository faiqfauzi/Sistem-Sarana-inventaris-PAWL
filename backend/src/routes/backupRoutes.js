const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");

const adminMiddleware = require("../middleware/adminMiddleware");
const backupRestoreController = require("../controllers/backupRestoreController");

const router = express.Router();

const upload = multer({
  dest: path.join(os.tmpdir(), "inventaris-restore-upload"),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    if (path.extname(file.originalname).toLowerCase() !== ".sql") {
      return callback(new Error("File restore harus berformat .sql."));
    }

    callback(null, true);
  },
});

// Semua endpoint backup dan restore hanya untuk admin.
router.use(adminMiddleware);

// GET /api/backup-restore/download
router.get("/download", backupRestoreController.download);

// POST /api/backup-restore/restore
router.post(
  "/restore",
  (req, res, next) => {
    upload.single("backup_file")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          success: false,
          message:
            error.message ||
            "File backup tidak valid atau melebihi batas 50 MB.",
        });
      }

      next();
    });
  },
  backupRestoreController.restore,
);

module.exports = router;
