const express = require("express");
const router = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const inventoryController = require("../controllers/inventoryController");

// Riwayat inventaris
router.post("/:id/history/:type", inventoryController.createHistory);

router.put("/:id/history/:type/:historyId", inventoryController.updateHistory);

router.delete(
  "/:id/history/:type/:historyId",
  adminMiddleware,
  inventoryController.deleteHistory,
);

router.get("/:id/history/:type", inventoryController.historyIndex);

// Route statis harus berada sebelum route dinamis /:id
router.get("/options", inventoryController.options);
router.get("/print/qr", inventoryController.printQr);
router.delete("/bulk", adminMiddleware, inventoryController.destroyBulk);

// Daftar dan tambah inventaris
router.get("/", inventoryController.index);
router.post("/", inventoryController.store);

// QR dan dokumen inventaris
router.get("/:id/qr", inventoryController.showQr);
router.get("/:id/document", inventoryController.document);

// Detail, edit, dan hapus satu inventaris
router.get("/:id", inventoryController.show);
router.put("/:id", inventoryController.update);
router.delete("/:id", adminMiddleware, inventoryController.destroy);

module.exports = router;
