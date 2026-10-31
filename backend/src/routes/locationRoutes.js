const express = require("express");
const router = express.Router();

const locationController = require("../controllers/locationController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Membaca daftar lokasi
router.get("/", locationController.index);

// Cetak QR semua lokasi
// Letakkan route spesifik ini sebelum route /:id.
router.get("/print/qr", locationController.printQr);

// Detail lokasi
router.get("/:id", locationController.show);

// CRUD lokasi hanya untuk admin
router.post("/", adminMiddleware, locationController.store);
router.put("/:id", adminMiddleware, locationController.update);
router.delete("/:id", adminMiddleware, locationController.destroy);

module.exports = router;
