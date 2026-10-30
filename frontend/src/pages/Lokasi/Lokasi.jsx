import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

export default function Lokasi({
  onChanged,
  onTambah,
  onDetail,
  onEdit,
  isAdmin = false,
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/locations", {
        params: { search: appliedSearch },
      });

      setItems(response.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data lokasi:", err);
      setError(err.response?.data?.message || "Gagal mengambil data lokasi.");
    } finally {
      setLoading(false);
    }
  }, [appliedSearch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus lokasi "${item.nama_lokasi}"?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/locations/${item.id}`);
      setNotice("Lokasi berhasil dihapus.");

      await fetchItems();
      await onChanged?.();
    } catch (err) {
      console.error("Gagal menghapus lokasi:", err);
      setError(err.response?.data?.message || "Gagal menghapus lokasi.");
    }
  }

  return (
    <>
      {notice && (
        <div className="alert-custom alert-success" role="status">
          <i className="ti ti-circle-check" />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Tutup"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Tutup">
            ×
          </button>
        </div>
      )}

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Data Lokasi</h2>
            <p>Kelola lokasi penyimpanan inventaris perusahaan.</p>
          </div>

          <div className="row-actions">
            <button
              type="button"
              className="btn-outline-custom"
              onClick={() =>
                window.open(
                  "http://localhost:3000/api/locations/print/qr",
                  "_blank",
                )
              }
            >
              <i className="ti ti-qrcode" />
              <span>Print Semua QR</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                className="btn-primary-custom"
                onClick={onTambah}
              >
                <i className="ti ti-plus" />
                <span>Tambah</span>
              </button>
            )}
          </div>
        </div>

        <form
          className="master-search"
          onSubmit={(event) => {
            event.preventDefault();
            setAppliedSearch(search.trim());
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama lokasi..."
            aria-label="Cari nama lokasi"
          />

          <button type="submit" className="btn-primary-custom">
            <i className="ti ti-search" /> Cari
          </button>

          <button
            type="button"
            className="btn-outline-custom"
            onClick={() => {
              setSearch("");
              setAppliedSearch("");
            }}
          >
            Reset
          </button>
        </form>

        {loading ? (
          <div className="empty-state">Memuat data lokasi…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-map-pin" />
            <strong>Belum ada data lokasi</strong>
            <span>Tambahkan lokasi untuk mulai mengelola data.</span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="text-center">No.</th>
                  <th>Nama Lokasi</th>
                  <th>Keterangan</th>
                  <th className="text-center">Jumlah Inventaris</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="inventory-number">{item.nama_lokasi}</td>
                    <td>{item.keterangan || "—"}</td>
                    <td className="text-center">
                      <span className="count-badge">
                        {item.jumlah_inventaris}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions justify-center">
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => onDetail?.(item.id)}
                          title="Detail"
                          aria-label={`Detail lokasi ${item.nama_lokasi}`}
                        >
                          <i className="ti ti-eye" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              type="button"
                              className="btn-icon-action edit"
                              onClick={() => onEdit?.(item.id)}
                              title="Edit lokasi"
                              aria-label={`Edit lokasi ${item.nama_lokasi}`}
                            >
                              <i className="ti ti-edit" />
                            </button>

                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() => handleDelete(item)}
                              title="Hapus lokasi"
                              aria-label={`Hapus lokasi ${item.nama_lokasi}`}
                            >
                              <i className="ti ti-trash" />
                            </button>
                          </>
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
    </>
  );
}
