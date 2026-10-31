const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");

router.get("/options", reportController.options);
router.get("/", reportController.index);

router.post("/export/excel", authMiddleware, reportController.exportExcel);

router.post("/export/pdf", authMiddleware, reportController.exportPdf);

module.exports = router;
