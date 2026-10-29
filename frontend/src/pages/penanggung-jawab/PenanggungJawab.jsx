import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const PAGE_SIZE = 10;

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.last_page <= 1) return null;

  const { current_page, last_page, total, per_page } = pagination;
  const first = total === 0 ? 0 : (current_page - 1) * per_page + 1;
  const last = Math.min(current_page * per_page, total);

  return (
    <div className="master-pagination">
      <div className="master-pagination-info">
        Menampilkan <strong>{first}</strong> sampai <strong>{last}</strong> dari{" "}
        <strong>{total}</strong> data
      </div>

      <div className="master-pagination-nav">
        <button
          type="button"
          className="pagination-btn"
          disabled={current_page <= 1}
          onClick={() => onPageChange(current_page - 1)}
        >
          Sebelumnya
        </button>

        <span>
          Halaman {current_page} dari {last_page}
        </span>

        <button
          type="button"
          className="pagination-btn"
          disabled={current_page >= last_page}
          onClick={() => onPageChange(current_page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}

export default function PenanggungJawab({ onTambah, onDetail, onEdit }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: PAGE_SIZE,
    total: 0,
    last_page: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchResponsibles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/responsibles", {
        params: { page, search },
      });

      setItems(response.data.data || []);
      setPagination(
        response.data.pagination || {
          current_page: page,
          per_page: PAGE_SIZE,
          total: 0,
          last_page: 1,
        },
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengambil data penanggung jawab.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchResponsibles();
  }, [fetchResponsibles]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus penanggung jawab "${item.nama_penanggung_jawab}"?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/responsibles/${item.id}`);
      setNotice("Penanggung jawab berhasil dihapus.");

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page;

      if (nextPage !== page) {
        setPage(nextPage);
      } else {
        await fetchResponsibles();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal menghapus data penanggung jawab.",
      );
    }
  };

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
            <h3>Data Penanggung Jawab</h3>
            <p>
              Daftar penanggung jawab dan jumlah inventaris yang menjadi
              tanggung jawabnya.
            </p>
          </div>

          <button
            type="button"
            className="btn-primary-custom"
            onClick={() => onTambah?.()}
          >
            <i className="ti ti-plus" /> Tambah
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <span className="search-icon">
              <i className="ti ti-search" />
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Cari nama penanggung jawab..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary-custom">
            <i className="ti ti-search" /> Cari
          </button>

          <button
            type="button"
            className="btn-outline-custom"
            onClick={() => setSearch("")}
          >
            Reset
          </button>
        </form>

        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th className="text-center">No.</th>
                <th>Nama Penanggung Jawab</th>
                <th className="text-center">Jumlah Inventaris</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center">
                    Data penanggung jawab tidak ditemukan.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </td>
                    <td>{item.nama_penanggung_jawab}</td>
                    <td className="text-center">
                      <span className="count-badge">
                        {item.jumlah_inventaris ?? 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="row-actions justify-center">
                        <button
                          type="button"
                          className="btn-icon-action"
                          onClick={() => onDetail?.(item.id)}
                          title="Detail"
                          aria-label={`Detail ${item.nama_penanggung_jawab}`}
                        >
                          <i className="ti ti-eye" />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-action edit"
                          onClick={() => onEdit?.(item.id)}
                          title="Edit"
                          aria-label={`Edit ${item.nama_penanggung_jawab}`}
                        >
                          <i className="ti ti-edit" />
                        </button>

                        <button
                          type="button"
                          className="btn-icon-action delete"
                          onClick={() => handleDelete(item)}
                          title="Hapus"
                          aria-label={`Hapus ${item.nama_penanggung_jawab}`}
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

        {!loading && (
          <Pagination pagination={pagination} onPageChange={setPage} />
        )}
      </section>
    </>
  );
}
