
import { useCallback, useEffect, useState } from "react";
import api from "./services/api";

export default function MasterSarana() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [nama, setNama] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/master-sarana", {
        params: { search },
      });
      setItems(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data master sarana."
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function openAddForm() {
    setEditingId(null);
    setNama("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setNama(item.nama_sarana_inventaris);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const namaBersih = nama.trim();
    if (!namaBersih) {
      setError("Nama sarana wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (editingId) {
        await api.put(`/master-sarana/${editingId}`, {
          nama_sarana_inventaris: namaBersih,
        });
        setNotice("Master sarana berhasil diperbarui.");
      } else {
        await api.post("/master-sarana", {
          nama_sarana_inventaris: namaBersih,
        });
        setNotice("Master sarana berhasil ditambahkan.");
      }

      setShowForm(false);
      setEditingId(null);
      setNama("");
      await fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan master sarana."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus sarana "${item.nama_sarana_inventaris}"?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/master-sarana/${item.id}`);
      setNotice("Master sarana berhasil dihapus.");
      await fetchItems();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Gagal menghapus master sarana."
      );
    }
  }

  return (
    <section className="master-page">
      <div className="master-page-heading">
        <div>
          <h2>Master Sarana Inventaris</h2>
          <p>Kelola daftar jenis sarana inventaris.</p>
        </div>

        <button className="btn btn-primary" onClick={openAddForm}>
          <i className="ti ti-plus" /> Tambah Sarana
        </button>
      </div>

      {notice && (
        <div className="alert alert-success" role="status">
          {notice}
        </div>
      )}

      {error && !showForm && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card master-table-card">
        <div className="card-header master-table-header">
          <h3 className="card-title">Daftar Sarana</h3>

          <input
            className="form-control master-search-input"
            type="search"
            placeholder="Cari nama sarana..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="table-responsive">
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th style={{ width: 70 }}>No.</th>
                <th>Nama Sarana Inventaris</th>
                <th style={{ width: 170 }}>Jumlah Inventaris</th>
                <th style={{ width: 150 }}>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Data master sarana belum tersedia.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.nama_sarana_inventaris}</td>
                    <td>
                      <span className="badge bg-blue-lt">
                        {item.jumlah_inventaris}
                      </span>
                    </td>
                    <td>
                      <div className="master-row-actions">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openEditForm(item)}
                          title="Edit"
                        >
                          <i className="ti ti-edit" /> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item)}
                          title="Hapus"
                        >
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="dialog"
            aria-modal="true"
            aria-labelledby="master-form-title"
          >
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title" id="master-form-title">
                  {editingId ? "Edit Sarana" : "Tambah Sarana"}
                </h3>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Tutup"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                />
              </div>

              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <label
                  className="form-label"
                  htmlFor="nama-sarana"
                >
                  Nama Sarana Inventaris
                </label>
                <input
                  id="nama-sarana"
                  className="form-control"
                  value={nama}
                  onChange={(event) => setNama(event.target.value)}
                  placeholder="Masukkan nama sarana"
                  maxLength={255}
                  required
                  autoFocus
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
