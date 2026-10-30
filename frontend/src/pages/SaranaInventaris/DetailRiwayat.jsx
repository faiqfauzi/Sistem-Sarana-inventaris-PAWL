import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const historyConfig = {
  perawatan: {
    title: "Riwayat Perawatan",
    fields: [
      {
        name: "tanggal_perawatan",
        label: "Tanggal Perawatan",
        type: "date",
        required: true,
      },
      {
        name: "tanggal_perawatan_selanjutnya",
        label: "Tanggal Perawatan Selanjutnya",
        type: "date",
      },
      { name: "jenis_perawatan", label: "Jenis Perawatan", required: true },
      { name: "pelaksana", label: "Pelaksana", required: true },
    ],
  },
  perbaikan: {
    title: "Riwayat Perbaikan",
    fields: [
      {
        name: "tanggal_pengajuan",
        label: "Tanggal Pengajuan",
        type: "date",
        required: true,
      },
      {
        name: "tanggal_tindak_lanjut",
        label: "Tanggal Tindak Lanjut",
        type: "date",
      },
      { name: "jenis_perbaikan", label: "Jenis Perbaikan", required: true },
      { name: "pelaksana", label: "Pelaksana", required: true },
      { name: "dokumen", label: "Dokumen", type: "file" },
    ],
  },
  "stock-opname": {
    title: "Riwayat Stok Opname",
    fields: [
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "kondisi", label: "Kondisi", required: true },
      { name: "auditor", label: "Auditor", required: true },
      { name: "foto", label: "Foto", type: "file" },
    ],
  },
  mutasi: {
    title: "Riwayat Pemindahan & Pemusnahan",
    fields: [
      {
        name: "jenis",
        label: "Jenis",
        type: "select",
        options: ["Pemindahan", "Pemusnahan"],
        required: true,
      },
      { name: "tanggal", label: "Tanggal", type: "date", required: true },
      { name: "alasan", label: "Alasan", type: "textarea", required: true },
      { name: "dokumen", label: "Dokumen", type: "file" },
    ],
  },
};

function formatValue(value) {
  if (value == null || value === "") return "-";

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return new Date(value).toLocaleDateString("id-ID", {
      timeZone: "UTC",
    });
  }

  return String(value);
}

function dateInputValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export default function DetailRiwayat({
  inventoryId,
  type,
  action,
  editId,
  onBack,
  currentUser,
}) {
  const config = historyConfig[type];

  const [inventory, setInventory] = useState(null);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [files, setFiles] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const canManage =
    isAdmin ||
    (currentUser?.responsible_id != null &&
      inventory?.responsible_id != null &&
      String(currentUser.responsible_id) === String(inventory.responsible_id));

  const fetchHistory = useCallback(async () => {
    if (!config || inventoryId == null) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/inventories/${inventoryId}/history/${type}`,
      );

      const data = response.data?.data ?? response.data;
      setInventory(data?.inventory ?? null);
      setRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch (err) {
      console.error("Gagal mengambil riwayat:", err);
      setError(err.response?.data?.message || "Gagal memuat riwayat.");
    } finally {
      setLoading(false);
    }
  }, [config, inventoryId, type]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (action !== "edit" || editId == null || rows.length === 0) return;

    const selectedRow = rows.find((row) => String(row.id) === String(editId));

    if (selectedRow) {
      startEdit(selectedRow);
    }
  }, [action, editId, rows]);

  const resetForm = () => {
    setForm({});
    setFiles({});
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const startEdit = (row) => {
    const values = {};

    config.fields.forEach((field) => {
      if (field.type !== "file") {
        values[field.name] =
          field.type === "date"
            ? dateInputValue(row[field.name])
            : (row[field.name] ?? "");
      }
    });

    setForm(values);
    setFiles({});
    setEditingId(row.id);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (action !== "create" && editingId == null) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const hasFileField = config.fields.some((field) => field.type === "file");

      let payload;

      if (hasFileField) {
        payload = new FormData();

        config.fields.forEach((field) => {
          if (field.type === "file") {
            if (files[field.name]) {
              payload.append(field.name, files[field.name]);
            }
          } else {
            payload.append(field.name, form[field.name] ?? "");
          }
        });
      } else {
        payload = { ...form };
      }

      if (action === "create") {
        await api.post(`/inventories/${inventoryId}/history/${type}`, payload);
      } else {
        await api.put(
          `/inventories/${inventoryId}/history/${type}/${editingId}`,
          payload,
        );
      }

      onBack();
    } catch (err) {
      console.error("Gagal menyimpan riwayat:", err);
      setError(err.response?.data?.message || "Gagal menyimpan riwayat.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      "Yakin ingin menghapus riwayat ini? Data yang dihapus tidak dapat dikembalikan.",
    );

    if (!confirmed) return;

    setDeletingId(row.id);
    setError("");
    setSuccess("");

    try {
      await api.delete(`/inventories/${inventoryId}/history/${type}/${row.id}`);

      setRows((previous) => previous.filter((item) => item.id !== row.id));

      setSuccess("Riwayat berhasil dihapus.");
    } catch (err) {
      console.error("Gagal menghapus riwayat:", err);
      setError(err.response?.data?.message || "Gagal menghapus riwayat.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!config) {
    return (
      <section className="content-card">
        <p>Jenis riwayat tidak valid.</p>
        <button type="button" className="btn-outline-custom" onClick={onBack}>
          Kembali
        </button>
      </section>
    );
  }

  const isEditPage = action === "edit";
  const showForm = action === "create" || isEditPage;

  const renderForm = () => (
    <form className="content-card" onSubmit={handleSubmit}>
      <div className="content-card-header">
        <h3>
          {action === "create"
            ? `Tambah ${config.title}`
            : `Edit ${config.title.replace(/^Riwayat /, "")}`}
        </h3>
      </div>

      {config.fields.map((field) => (
        <div key={field.name} style={{ marginBottom: 16 }}>
          <label
            htmlFor={field.name}
            style={{ display: "block", marginBottom: 6 }}
          >
            {field.label}
            {field.required ? " *" : ""}
          </label>

          {field.type === "textarea" ? (
            <textarea
              id={field.name}
              className="form-control"
              rows={4}
              required={field.required}
              value={form[field.name] ?? ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [field.name]: event.target.value,
                }))
              }
            />
          ) : field.type === "select" ? (
            <select
              id={field.name}
              className="form-select"
              required={field.required}
              value={form[field.name] ?? ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [field.name]: event.target.value,
                }))
              }
            >
              <option value="">Pilih {field.label}</option>
              {field.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : field.type === "file" ? (
            <input
              id={field.name}
              type="file"
              className="form-control"
              accept={
                field.name === "foto"
                  ? ".jpg,.jpeg,.png"
                  : ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              }
              onChange={(event) =>
                setFiles((previous) => ({
                  ...previous,
                  [field.name]: event.target.files?.[0] ?? null,
                }))
              }
            />
          ) : (
            <input
              id={field.name}
              type={field.type || "text"}
              className="form-control"
              required={field.required}
              value={form[field.name] ?? ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  [field.name]: event.target.value,
                }))
              }
            />
          )}
        </div>
      ))}

      {config.fields.some((field) => field.type === "file") && (
        <p className="text-muted">
          Jika tidak memilih file baru, file lama akan dipertahankan.
        </p>
      )}

      <div className="row-actions">
        <button
          type="button"
          className="btn-outline-custom"
          disabled={saving}
          onClick={onBack}
        >
          Batal
        </button>

        <button type="submit" className="btn-primary-custom" disabled={saving}>
          {saving
            ? "Menyimpan..."
            : action === "create"
              ? "Simpan"
              : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="master-page">
      <div className="master-page-heading">
        <div>
          <h2>
            {action === "create"
              ? `Tambah ${config.title}`
              : action === "edit"
                ? `Edit ${config.title.replace(/^Riwayat /, "")}`
                : config.title}
          </h2>

          <p>Nomor inventaris: {inventory?.nomor_inventaris || "-"}</p>

          <p>ID Sarana Inventaris: {inventory?.id ?? inventoryId}</p>
        </div>

        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      {action !== "edit" && action !== "create" && (
        <section className="content-card">
          <div className="content-card-header">
            <h3>Informasi Sarana Inventaris</h3>
          </div>

          {loading && !inventory ? (
            <div className="empty-state">Memuat informasi inventaris...</div>
          ) : (
            <div className="table-responsive">
              <table className="inventory-table">
                <tbody>
                  <tr>
                    <th>Nomor Inventaris</th>
                    <td>{inventory?.nomor_inventaris || "-"}</td>
                  </tr>
                  <tr>
                    <th>Nama Sarana Inventaris</th>
                    <td>{inventory?.nama_sarana_inventaris || "-"}</td>
                  </tr>
                  <tr>
                    <th>Pengguna</th>
                    <td>{inventory?.user || "-"}</td>
                  </tr>
                  <tr>
                    <th>Lokasi</th>
                    <td>{inventory?.nama_lokasi || "-"}</td>
                  </tr>
                  <tr>
                    <th>Penanggung Jawab</th>
                    <td>{inventory?.nama_penanggung_jawab || "-"}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{inventory?.status || "-"}</td>
                  </tr>
                  <tr>
                    <th>Tanggal Perolehan</th>
                    <td>{formatValue(inventory?.tanggal_perolehan)}</td>
                  </tr>
                  <tr>
                    <th>Spesifikasi</th>
                    <td>{inventory?.spesifikasi || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          {error}
          <button type="button" onClick={fetchHistory}>
            Coba lagi
          </button>
        </div>
      )}

      {success && (
        <div className="alert-custom" role="status">
          {success}
        </div>
      )}

      {showForm && renderForm()}

      {!showForm && (
        <section className="content-card">
          <div className="content-card-header">
            <h3>Daftar Riwayat</h3>
          </div>

          {loading ? (
            <div className="empty-state">Memuat riwayat...</div>
          ) : rows.length === 0 ? (
            <div className="empty-state">Belum ada data riwayat.</div>
          ) : (
            <div className="table-responsive">
              <table className="inventory-table">
                <thead>
                  <tr>
                    {config.fields.map((field) => (
                      <th key={field.name}>{field.label}</th>
                    ))}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {config.fields.map((field) => (
                        <td key={field.name}>
                          {field.type === "file" && row[field.name] ? (
                            <a
                              href={`${api.defaults.baseURL || ""}${row[field.name]}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Lihat file
                            </a>
                          ) : (
                            formatValue(row[field.name])
                          )}
                        </td>
                      ))}

                      <td>
                        <div className="row-actions">
                          {canManage && (
                            <button
                              type="button"
                              className="btn-outline-custom"
                              onClick={() => {
                                window.history.pushState(
                                  {},
                                  "",
                                  `/sarana-inventaris/${inventoryId}/${type}/edit/${row.id}`,
                                );

                                window.dispatchEvent(
                                  new PopStateEvent("popstate"),
                                );
                              }}
                              disabled={saving}
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
