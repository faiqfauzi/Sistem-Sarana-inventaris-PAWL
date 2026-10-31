const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const userController = require("../controllers/userController");

const router = express.Router();

// Semua endpoint user hanya untuk admin.
router.use(adminMiddleware);

// GET /api/users/responsibles
// Route statis harus didaftarkan sebelum /:id.
router.get("/responsibles", userController.responsibles);

// GET /api/users
router.get("/", userController.index);

// POST /api/users
router.post("/", userController.store);

// PUT /api/users/:id
router.put("/:id", userController.update);

// DELETE /api/users/:id
router.delete("/:id", userController.destroy);

module.exports = router;
