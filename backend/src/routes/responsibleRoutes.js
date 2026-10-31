const express = require("express");
const router = express.Router();

const responsibleController = require("../controllers/responsibleController");
const adminMiddleware = require("../middleware/adminMiddleware");

// Daftar dan pencarian penanggung jawab
router.get("/", responsibleController.index);

// Dokumen Stock Opname
router.get(
  "/:id/document-stock-opname",
  responsibleController.documentStockOpname,
);

// Detail penanggung jawab dan inventaris
router.get("/:id", responsibleController.show);

// Tambah, edit, dan hapus hanya untuk admin
router.post("/", adminMiddleware, responsibleController.store);
router.put("/:id", adminMiddleware, responsibleController.update);
router.delete("/:id", adminMiddleware, responsibleController.destroy);

module.exports = router;
