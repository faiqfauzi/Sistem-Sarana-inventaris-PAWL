const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const adminMiddleware = require("../middleware/adminMiddleware");
const masterSaranaController = require("../controllers/masterSaranaController");

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

// GET: daftar master sarana
router.get("/", masterSaranaController.index);

// GET: informasi gambar header
router.get("/header", masterSaranaController.headerInfo);

// GET: detail master sarana beserta inventaris
router.get("/:id", masterSaranaController.show);

// POST: tambah sarana (admin)
router.post("/", adminMiddleware, masterSaranaController.store);

// PUT: ubah sarana (admin)
router.put("/:id", adminMiddleware, masterSaranaController.update);

// DELETE: hapus sarana (admin)
router.delete("/:id", adminMiddleware, masterSaranaController.destroy);

// POST: upload gambar header (admin)
router.post(
  "/header",
  adminMiddleware,
  (req, res, next) => {
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

      next();
    });
  },
  masterSaranaController.updateHeader,
);

module.exports = router;
