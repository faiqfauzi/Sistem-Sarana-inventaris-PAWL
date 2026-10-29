import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

const ITEMS_PER_PAGE = 10;

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function DetailMasterSarana({ id, onBack, onDetailInventaris }) {
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/master-sarana/${id}`, {
        params: { page },
      });

      setDetail(response.data.data);
    } catch (err) {
      console.error("Gagal mengambil detail master sarana:", err);

      setError(
        err.response?.data?.message ||
          "Gagal mengambil detail master sarana inventaris.",
      );
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const pagination = detail?.pagination;
  const total = Number(pagination?.total || 0);
  const currentPage = Number(pagination?.currentPage || page);
  const lastPage = Math.max(1, Number(pagination?.lastPage || 1));
  const inventories = detail?.inventories || [];
  const summary = detail?.summary || [];

  const firstItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="master-page">
      <div className="master-page-heading">
        <div>
          <h2>Detail Master Sarana Inventaris</h2>
          <p>
            {detail?.masterSaranaInventaris?.nama_sarana_inventaris ||
              "Informasi master sarana dan daftar inventaris"}
          </p>
        </div>

        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error}</span>
          <button type="button" onClick={fetchDetail}>
            Coba lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="content-card">
          <div className="empty-state">
            Memuat detail master sarana inventaris...
          </div>
        </div>
      ) : detail ? (
        <>
          <section className="content-card">
            <div className="content-card-header">
              <h3>Ringkasan Penanggung Jawab</h3>
            </div>

            {summary.length === 0 ? (
              <div className="empty-state">
                Belum ada inventaris untuk master sarana ini.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Penanggung Jawab</th>
                      <th className="text-center">Jumlah Sarana</th>
                    </tr>
                  </thead>

                  <tbody>
                    {summary.map((item, index) => (
                      <tr key={`${item.nama}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{item.nama}</td>
                        <td className="text-center">
                          {Number(item.jumlah || 0)} Sarana
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="content-card" style={{ marginTop: 20 }}>
            <div className="content-card-header">
              <h3>Daftar Sarana Inventaris</h3>
            </div>

            {inventories.length === 0 ? (
              <div className="empty-state">
                Belum ada data inventaris untuk master sarana ini.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nomor Inventaris</th>
                        <th>User</th>
                        <th>Penanggung Jawab</th>
                        <th>Lokasi</th>
                        <th>Spesifikasi</th>
                        <th>Tanggal Perolehan</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {inventories.map((item, index) => (
                        <tr key={item.id}>
                          <td>
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </td>
                          <td>{item.nomor_inventaris || "-"}</td>
                          <td>{item.user || "-"}</td>
                          <td>{item.nama_penanggung_jawab || "-"}</td>
                          <td>{item.nama_lokasi || "-"}</td>
                          <td>{item.spesifikasi || "-"}</td>
                          <td>{formatTanggal(item.tanggal_perolehan)}</td>
                          <td>
                            <div className="row-actions justify-center">
                              <button
                                type="button"
                                className="btn-icon-action"
                                onClick={() => onDetailInventaris(item.id)}
                                title="Detail"
                                aria-label={`Detail`}
                              >
                                <i className="ti ti-eye" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="master-pagination">
                  <div className="master-pagination-info">
                    Menampilkan <strong>{firstItem}</strong> sampai{" "}
                    <strong>{lastItem}</strong> dari <strong>{total}</strong>{" "}
                    data
                  </div>

                  {lastPage > 1 && (
                    <div className="master-pagination-nav">
                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        aria-label="Halaman sebelumnya"
                      >
                        ‹
                      </button>

                      {Array.from(
                        { length: lastPage },
                        (_, index) => index + 1,
                      ).map((pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          className={`pagination-btn ${
                            pageNumber === currentPage ? "active" : ""
                          }`}
                          onClick={() => setPage(pageNumber)}
                          aria-current={
                            pageNumber === currentPage ? "page" : undefined
                          }
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        type="button"
                        className="pagination-btn"
                        disabled={currentPage >= lastPage}
                        onClick={() =>
                          setPage((current) => Math.min(lastPage, current + 1))
                        }
                        aria-label="Halaman berikutnya"
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
