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

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function DetailPenanggungJawab({
  id,
  onBack,
  onDetailInventaris,
}) {
  const [detail, setDetail] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/responsibles/${id}`, {
        params: { page },
      });

      const data = response.data.data;
      setDetail(data);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil detail penanggung jawab.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error}</span>
        </div>
      )}

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h3>Detail Penanggung Jawab</h3>
            <p>Informasi penanggung jawab dan inventaris terkait.</p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Memuat detail...</div>
        ) : detail ? (
          <>
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "20px" }}>
                <div className="text-muted">Nama Penanggung Jawab</div>
                <h2 style={{ margin: "6px 0 12px" }}>
                  {detail.responsible?.nama_penanggung_jawab || "-"}
                </h2>

                <span className="count-badge">
                  {pagination?.total ?? 0} Inventaris
                </span>
              </div>

              <h4 style={{ marginBottom: "12px" }}>
                Ringkasan Sarana Inventaris
              </h4>

              {detail.summary?.length ? (
                <div className="table-responsive">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Sarana Inventaris</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>

                    <tbody>
                      {detail.summary.map((item, index) => (
                        <tr
                          key={`${item.master_sarana_inventaris_id ?? "none"}-${index}`}
                        >
                          <td>{index + 1}</td>
                          <td>{item.nama || "-"}</td>
                          <td>{item.jumlah}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  Belum ada inventaris untuk penanggung jawab ini.
                </div>
              )}
            </div>

            <div style={{ padding: "0 20px 20px" }}>
              <h4 style={{ marginBottom: "12px" }}>Daftar Inventaris</h4>
              <button
                type="button"
                className="btn-primary-custom"
                onClick={() =>
                  window.open(
                    `http://localhost:3000/api/responsibles/${id}/document-stock-opname`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                <i className="ti ti-file-text" />
                Document
              </button>

              {detail.inventories?.length ? (
                <div className="table-responsive">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>No. Inventaris</th>
                        <th>Sarana Inventaris</th>
                        <th>User</th>
                        <th>Lokasi</th>
                        <th>Spesifikasi</th>
                        <th>Tanggal Perolehan</th>
                        <th>Status</th>
                        <th className="text-center">Aksi</th>
                      </tr>
                    </thead>

                    <tbody>
                      {detail.inventories.map((item, index) => (
                        <tr key={item.id}>
                          <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                          <td className="inventory-number">
                            {item.nomor_inventaris || "-"}
                          </td>
                          <td>{item.nama_sarana_inventaris || "-"}</td>
                          <td>{item.user || "-"}</td>
                          <td>{item.nama_lokasi || "-"}</td>
                          <td>{item.spesifikasi || "-"}</td>
                          <td>{formatTanggal(item.tanggal_perolehan)}</td>
                          <td>{item.status || "-"}</td>
                          <td className="text-center">
                            <div className="row-actions justify-center">
                              <button
                                type="button"
                                className="btn-icon-action"
                                onClick={() => onDetailInventaris?.(item.id)}
                                title="Detail Inventaris"
                                aria-label={`Lihat detail ${item.nomor_inventaris || "inventaris"}`}
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
              ) : (
                <div className="empty-state">Belum ada data inventaris.</div>
              )}

              <Pagination pagination={pagination} onPageChange={setPage} />
            </div>
          </>
        ) : (
          <div className="empty-state">
            Data penanggung jawab tidak ditemukan.
          </div>
        )}
      </section>
    </>
  );
}
