const bcrypt = require("bcryptjs");
const pool = require("../config/database");

const validRoles = ["admin", "responsible"];

async function responsibleExists(responsibleId) {
  if (responsibleId == null || responsibleId === "") return false;

  const [rows] = await pool.execute(
    "SELECT id FROM responsibles WHERE id = ? LIMIT 1",
    [responsibleId],
  );

  return rows.length > 0;
}

function normalizeAccount(body) {
  const username =
    typeof body.username === "string" ? body.username.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";
  const responsibleId =
    body.responsible_id === "" || body.responsible_id == null
      ? null
      : Number(body.responsible_id);

  return { username, role, responsibleId };
}

// GET /api/users
exports.index = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        u.id,
        u.username,
        u.role,
        u.responsible_id,
        r.nama_penanggung_jawab
      FROM users AS u
      LEFT JOIN responsibles AS r ON r.id = u.responsible_id
      ORDER BY u.id DESC
    `);

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Gagal mengambil akun:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar akun.",
    });
  }
};

// GET /api/users/responsibles
exports.responsibles = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nama_penanggung_jawab
      FROM responsibles
      ORDER BY nama_penanggung_jawab ASC
    `);

    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Gagal mengambil penanggung jawab:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar penanggung jawab.",
    });
  }
};

// POST /api/users
exports.store = async (req, res) => {
  try {
    const { username, role, responsibleId } = normalizeAccount(req.body);
    const { password, password_confirmation } = req.body;

    if (!username || !role || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username, role, dan password wajib diisi.",
      });
    }

    if (username.length > 255) {
      return res.status(422).json({
        success: false,
        message: "Username maksimal 255 karakter.",
      });
    }

    if (!validRoles.includes(role)) {
      return res.status(422).json({
        success: false,
        message: "Role tidak valid.",
      });
    }

    if (password.length < 8) {
      return res.status(422).json({
        success: false,
        message: "Password minimal 8 karakter.",
      });
    }

    if (password !== password_confirmation) {
      return res.status(422).json({
        success: false,
        message: "Konfirmasi password tidak cocok.",
      });
    }

    if (role === "responsible") {
      if (!(await responsibleExists(responsibleId))) {
        return res.status(422).json({
          success: false,
          message: "Penanggung jawab wajib dipilih untuk role responsible.",
        });
      }
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username],
    );

    if (existing.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Username sudah digunakan.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const finalResponsibleId = role === "admin" ? null : responsibleId;

    const [result] = await pool.execute(
      `INSERT INTO users
        (username, password, role, responsible_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [username, passwordHash, role, finalResponsibleId],
    );

    return res.status(201).json({
      success: true,
      message: "Akun berhasil ditambahkan.",
      data: {
        id: result.insertId,
        username,
        role,
        responsible_id: finalResponsibleId,
      },
    });
  } catch (error) {
    console.error("Gagal menambahkan akun:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan akun.",
    });
  }
};

// PUT /api/users/:id
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { username, role, responsibleId } = normalizeAccount(req.body);
    const { password, password_confirmation } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID akun tidak valid.",
      });
    }

    if (!username || !role) {
      return res.status(400).json({
        success: false,
        message: "Username dan role wajib diisi.",
      });
    }

    if (username.length > 255 || !validRoles.includes(role)) {
      return res.status(422).json({
        success: false,
        message: "Username atau role tidak valid.",
      });
    }

    const [accounts] = await pool.execute(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [id],
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1",
      [username, id],
    );

    if (existing.length > 0) {
      return res.status(422).json({
        success: false,
        message: "Username sudah digunakan.",
      });
    }

    if (role === "responsible") {
      if (!(await responsibleExists(responsibleId))) {
        return res.status(422).json({
          success: false,
          message: "Penanggung jawab wajib dipilih untuk role responsible.",
        });
      }
    }

    const finalResponsibleId = role === "admin" ? null : responsibleId;

    if (password) {
      if (typeof password !== "string" || password.length < 8) {
        return res.status(422).json({
          success: false,
          message: "Password baru minimal 8 karakter.",
        });
      }

      if (password !== password_confirmation) {
        return res.status(422).json({
          success: false,
          message: "Konfirmasi password baru tidak cocok.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await pool.execute(
        `UPDATE users
         SET username = ?, role = ?, responsible_id = ?, password = ?, updated_at = NOW()
         WHERE id = ?`,
        [username, role, finalResponsibleId, passwordHash, id],
      );
    } else {
      await pool.execute(
        `UPDATE users
         SET username = ?, role = ?, responsible_id = ?, updated_at = NOW()
         WHERE id = ?`,
        [username, role, finalResponsibleId, id],
      );
    }

    return res.json({
      success: true,
      message: "Akun berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Gagal memperbarui akun:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui akun.",
    });
  }
};

// DELETE /api/users/:id
exports.destroy = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "ID akun tidak valid.",
      });
    }

    if (Number(req.user.id) === id) {
      return res.status(422).json({
        success: false,
        message: "Akun yang sedang digunakan tidak dapat dihapus.",
      });
    }

    const [accounts] = await pool.execute(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [id],
    );

    if (accounts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    return res.json({
      success: true,
      message: "Akun berhasil dihapus.",
    });
  } catch (error) {
    console.error("Gagal menghapus akun:", error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        success: false,
        message:
          "Akun tidak dapat dihapus karena masih digunakan oleh data lain.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus akun.",
    });
  }
};
