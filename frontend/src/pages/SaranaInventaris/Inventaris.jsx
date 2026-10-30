import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const ITEMS_PER_PAGE = 10;

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function Inventaris({
  onChanged,
  onDetail,
  onCreate,
  onEdit,
  isAdmin = false,
  currentResponsibleId,
}) {
  const [inventories, setInventories] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchInventories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/inventories");
      const data = response.data?.data ?? response.data;

      setInventories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil data inventaris:", err);

      setError(
        err.response?.data?.message || "Tidak dapat mengambil data inventaris.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = async () => {
    await fetchInventories();
    await onChanged?.();
  };

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  const filteredInventories = useMemo(() => {
    const keyword = search.toLowerCase();

    return inventories.filter((item) => {
      const searchableValues = [
        item.nomor_inventaris,
        item.nama_sarana_inventaris,
        item.user,
        item.nama_penanggung_jawab,
        item.nama_lokasi,
        item.spesifikasi,
        item.status,
      ];

      return searchableValues.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(keyword),
      );
    });
  }, [inventories, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInventories.length / ITEMS_PER_PAGE),
  );

  const visibleInventories = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;

    return filteredInventories.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInventories, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const firstItem =
    filteredInventories.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;

  const lastItem = Math.min(page * ITEMS_PER_PAGE, filteredInventories.length);

  console.log("DEBUG INVENTARIS:", {
    isAdmin,
    currentResponsibleId,
    contohInventaris: inventories[0],
  });

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleResetSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus inventaris "${item.nomor_inventaris}"?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/inventories/${item.id}`);

      setNotice("Inventaris berhasil dihapus.");
      setSelectedIds((previous) => previous.filter((id) => id !== item.id));

      await refreshData();
    } catch (err) {
      console.error("Gagal menghapus inventaris:", err);

      setError(err.response?.data?.message || "Gagal menghapus inventaris.");
    }
  };

  const toggleSelectMode = () => {
    setSelectedIds([]);
    setSelectMode((previous) => !previous);
    setError("");
  };

  const toggleSelectItem = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  };

  const allVisibleSelected =
    visibleInventories.length > 0 &&
    visibleInventories.every((item) => selectedIds.includes(item.id));

  const toggleSelectAllVisible = () => {
    const visibleIds = visibleInventories.map((item) => item.id);

    if (allVisibleSelected) {
      setSelectedIds((previous) =>
        previous.filter((id) => !visibleIds.includes(id)),
      );
    } else {
      setSelectedIds((previous) => [...new Set([...previous, ...visibleIds])]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setError("Pilih minimal satu inventaris terlebih dahulu.");
      return;
    }

    const confirmed = window.confirm(
      `Yakin ingin menghapus ${selectedIds.length} data inventaris yang dipilih?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setLoading(true);

    try {
      await api.delete("/inventories/bulk", {
        data: { ids: selectedIds },
      });

      const deletedCount = selectedIds.length;

      setSelectedIds([]);
      setSelectMode(false);
      setNotice(`${deletedCount} data inventaris berhasil dihapus.`);

      await refreshData();
    } catch (err) {
      console.error("Gagal menghapus inventaris:", err);

      setError(
        err.response?.data?.message ||
          "Gagal menghapus data inventaris yang dipilih.",
      );
    } finally {
      setLoading(false);
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

      <div className="master-page">
        <div className="master-page-heading">
          <div>
            <h2>Sarana Inventaris</h2>
            <p>Daftar Sarana Inventaris</p>
          </div>

          <div className="inventory-header-actions">
            <button
              type="button"
              className="btn-outline-custom"
              onClick={() =>
                window.open(
                  "http://localhost:3000/api/inventories/print/qr",
                  "_blank",
                )
              }
            >
              <i className="ti ti-qrcode" />
              <span>Print Semua QR</span>
            </button>

            {isAdmin && (
              <>
                {!selectMode ? (
                  <button
                    type="button"
                    className="btn-outline-custom"
                    onClick={toggleSelectMode}
                  >
                    <i className="ti ti-checkbox" />
                    <span>Select</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn-outline-custom"
                      onClick={toggleSelectMode}
                    >
                      <i className="ti ti-check" />
                      <span>Selesai</span>
                    </button>

                    <button
                      type="button"
                      className="btn-danger-custom"
                      onClick={handleBulkDelete}
                      disabled={selectedIds.length === 0 || loading}
                    >
                      <i className="ti ti-trash" />
                      <span>Hapus Terpilih ({selectedIds.length})</span>
                    </button>
                  </>
                )}
              </>
            )}

            <button
              type="button"
              className="btn-primary-custom"
              onClick={onCreate}
            >
              <i className="ti ti-plus" />
              <span>Tambah</span>
            </button>
          </div>
        </div>

        <section className="content-card">
          <div className="content-card-header">
            <form className="master-search" onSubmit={handleSearch}>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari Sarana Inventaris..."
                aria-label="Cari sarana inventaris"
              />

              <button type="submit" className="btn-primary-custom">
                Cari
              </button>

              <button
                type="button"
                className="btn-outline-custom"
                onClick={handleResetSearch}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <div className="empty-state">Memuat data inventaris...</div>
          ) : filteredInventories.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-package" />
              <strong>
                {search
                  ? "Data inventaris tidak ditemukan."
                  : "Belum ada data inventaris."}
              </strong>
              <span>
                {search
                  ? "Coba kata kunci pencarian yang lain."
                  : "Klik Tambah untuk memasukkan data inventaris."}
              </span>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      {selectMode && (
                        <th className="text-center">
                          <input
                            type="checkbox"
                            checked={allVisibleSelected}
                            onChange={toggleSelectAllVisible}
                            aria-label="Pilih semua inventaris pada halaman ini"
                            title="Pilih semua pada halaman ini"
                          />
                        </th>
                      )}

                      <th>No</th>
                      <th>No. Inventaris</th>
                      <th>Sarana Inventaris</th>
                      <th>User</th>
                      <th>Penanggung Jawab</th>
                      <th>Lokasi</th>
                      <th>Spesifikasi</th>
                      <th>Tanggal Perolehan</th>
                      <th>Update Stok Opname</th>
                      {!selectMode && <th className="text-center">Aksi</th>}
                    </tr>
                  </thead>

                  <tbody>
                    {visibleInventories.map((item, index) => (
                      <tr key={item.id}>
                        {selectMode && (
                          <td className="text-center">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              aria-label={`Pilih ${item.nomor_inventaris}`}
                            />
                          </td>
                        )}

                        <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                        <td className="inventory-number">
                          {item.nomor_inventaris || "-"}
                        </td>
                        <td>{item.nama_sarana_inventaris || "-"}</td>
                        <td>{item.user || "-"}</td>
                        <td>{item.nama_penanggung_jawab || "-"}</td>
                        <td>{item.nama_lokasi || "-"}</td>
                        <td>{item.spesifikasi || "-"}</td>
                        <td>{formatTanggal(item.tanggal_perolehan)}</td>
                        <td>
                          {item.update_stok_opname
                            ? new Date(
                                item.update_stok_opname,
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                timeZone: "UTC",
                              })
                            : "Belum Pernah"}
                        </td>

                        {!selectMode && (
                          <td className="text-center">
                            <div className="row-actions justify-center">
                              <button
                                type="button"
                                className="btn-icon-action"
                                onClick={() => onDetail?.(item.id)}
                                title="Detail"
                                aria-label="Detail inventaris"
                              >
                                <i className="ti ti-eye" />
                              </button>

                              {(isAdmin ||
                                (currentResponsibleId != null &&
                                  item.responsible_id != null &&
                                  String(item.responsible_id) ===
                                    String(currentResponsibleId))) && (
                                <button
                                  type="button"
                                  className="btn-icon-action edit"
                                  onClick={() => onEdit?.(item.id)}
                                  title="Edit"
                                  aria-label={`Edit ${item.nomor_inventaris}`}
                                >
                                  <i className="ti ti-edit" />
                                </button>
                              )}

                              {isAdmin && (
                                <button
                                  type="button"
                                  className="btn-icon-action delete"
                                  onClick={() => handleDelete(item)}
                                  title="Hapus"
                                  aria-label={`Hapus ${item.nomor_inventaris}`}
                                >
                                  <i className="ti ti-trash" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="master-pagination">
                <div className="master-pagination-info">
                  Menampilkan <strong>{firstItem}</strong> sampai{" "}
                  <strong>{lastItem}</strong> dari{" "}
                  <strong>{filteredInventories.length}</strong> data
                </div>

                {totalPages > 1 && (
                  <div className="master-pagination-nav">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      aria-label="Halaman sebelumnya"
                    >
                      ‹
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`pagination-btn ${
                          pageNumber === page ? "active" : ""
                        }`}
                        onClick={() => setPage(pageNumber)}
                        aria-current={pageNumber === page ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage((current) => current + 1)}
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
      </div>
    </>
  );
}
