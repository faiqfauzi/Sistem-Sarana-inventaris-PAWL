import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getTanggalRiwayat(row, type) {
  switch (type) {
    case "maintenance":
      return row.tanggal_perawatan;
    case "repair":
      return row.tanggal_pengajuan;
    default:
      return row.tanggal;
  }
}

function getLatestRows(rows = [], type) {
  return [...rows]
    .sort((a, b) => {
      const dateA = new Date(getTanggalRiwayat(a, type) || 0).getTime();
      const dateB = new Date(getTanggalRiwayat(b, type) || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 3);
}

function HistoryTable({
  title,
  type,
  columns,
  rows = [],
  emptyMessage,
  onAdd,
  onViewAll,
  onEditRow,
  onDeleteRow,
  canManageHistory = false,
  isAdmin = false,
}) {
  const latestRows = getLatestRows(rows, type);

  return (
    <section className="content-card detail-history-card">
      <div className="content-card-header">
        <h3>{title}</h3>

        <div className="row-actions">
          {canManageHistory && onAdd && (
            <button
              type="button"
              className="btn-primary-custom"
              onClick={onAdd}
            >
              <i className="ti ti-plus" /> Tambah
            </button>
          )}

          {onViewAll && (
            <button
              type="button"
              className="btn-outline-custom"
              onClick={onViewAll}
            >
              Detail
            </button>
          )}
        </div>
      </div>

      {latestRows.length === 0 ? (
        <div className="empty-state">{emptyMessage}</div>
      ) : (
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {(canManageHistory || isAdmin) && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {latestRows.map((row, index) => (
                <tr key={row.id ?? `${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row)
                        : (row[column.key] ?? "-")}
                    </td>
                  ))}

                  {(canManageHistory || isAdmin) && (
                    <td>
                      <div className="row-actions">
                        {canManageHistory && onEditRow && (
                          <button
                            type="button"
                            className="btn-icon-action edit"
                            title="Edit"
                            aria-label={`Edit ${title}`}
                            onClick={() => onEditRow(row)}
                          >
                            <i className="ti ti-edit" />
                          </button>
                        )}

                        {isAdmin && onDeleteRow && (
                          <button
                            type="button"
                            className="btn-icon-action delete"
                            title="Hapus"
                            aria-label={`Hapus ${title}`}
                            onClick={() => onDeleteRow(row)}
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
      )}
    </section>
  );
}

export default function DetailInventaris({
  id,
  onBack,
  onEdit,
  onAddMaintenance,
  onViewMaintenances,
  onEditMaintenance,
  onDeleteMaintenance,
  onAddRepair,
  onViewRepairs,
  onEditRepair,
  onDeleteRepair,
  onAddStockOpname,
  onViewStockOpnames,
  onEditStockOpname,
  onDeleteStockOpname,
  onAddMutation,
  onViewMutations,
  onEditMutation,
  onDeleteMutation,
  currentUser,
}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "admin";

  const canManageHistory =
    isAdmin ||
    (currentUser?.responsible_id != null &&
      item?.responsible_id != null &&
      String(currentUser.responsible_id) === String(item.responsible_id));

  const canEditInventory = canManageHistory;

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/inventories/${id}`);
      const data = response.data?.data ?? response.data;
      setItem(data || null);
    } catch (err) {
      console.error("Gagal mengambil detail inventaris:", err);
      setError(
        err.response?.data?.message || "Gagal mengambil detail inventaris.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const openQr = () => {
    window.open(
      `http://localhost:3000/api/inventories/${id}/qr`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const imageUrl = (file) => {
    if (!file) return "";

    if (/^https?:\/\//i.test(file)) return file;

    const cleanPath = String(file).replace(/^\/+/, "");

    if (cleanPath.startsWith("storage/")) {
      return `http://localhost:3000/${cleanPath}`;
    }

    return `http://localhost:3000/storage/${cleanPath}`;
  };

  const renderImage = (file, alt, width = 70) => {
    if (!file) return "-";

    return (
      <a
        href={imageUrl(file)}
        target="_blank"
        rel="noreferrer"
        title="Buka gambar"
      >
        <img
          src={imageUrl(file)}
          alt={alt || "Lampiran"}
          style={{
            width,
            maxHeight: 100,
            objectFit: "contain",
            borderRadius: 4,
          }}
        />
      </a>
    );
  };

  const renderDocument = (file) => {
    if (!file) return "-";

    return (
      <a
        href={imageUrl(file)}
        target="_blank"
        rel="noreferrer"
        className="btn-outline-custom"
      >
        <i className="ti ti-file" /> Lihat Dokumen
      </a>
    );
  };

  const handleDeleteHistory = async (row, deleteCallback, label) => {
    if (!deleteCallback) return;

    const confirmed = window.confirm(`Yakin ingin menghapus ${label} ini?`);
    if (!confirmed) return;

    try {
      await deleteCallback(row);
      await fetchDetail();
    } catch (err) {
      console.error(`Gagal menghapus ${label}:`, err);
      setError(err.response?.data?.message || `Gagal menghapus ${label}.`);
    }
  };

  if (loading) {
    return (
      <div className="content-card">
        <div className="empty-state">Memuat detail inventaris...</div>
      </div>
    );
  }

  return (
    <div className="master-page">
      <div className="master-page-heading">
        <div>
          <h2>Detail Sarana Inventaris</h2>
          <p>
            {item?.nomor_inventaris ||
              "Informasi lengkap sarana inventaris dan riwayatnya."}
          </p>
        </div>

        <div className="row-actions">
          {item && (
            <button
              type="button"
              className="btn-primary-custom"
              onClick={openQr}
            >
              <i className="ti ti-qrcode" /> QR Code
            </button>
          )}

          {item && onEdit && canEditInventory && (
            <button
              type="button"
              className="btn-outline-custom"
              onClick={() => onEdit(item.id)}
            >
              <i className="ti ti-edit" /> Edit
            </button>
          )}

          <button type="button" className="btn-outline-custom" onClick={onBack}>
            <i className="ti ti-arrow-left" /> Kembali
          </button>
        </div>
      </div>

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          <span>{error}</span>
          <button type="button" onClick={fetchDetail}>
            Coba lagi
          </button>
        </div>
      )}

      {!item ? (
        !error && (
          <div className="content-card">
            <div className="empty-state">Data inventaris tidak ditemukan.</div>
          </div>
        )
      ) : (
        <>
          <section className="content-card">
            <div className="content-card-header">
              <h3>Informasi Sarana Inventaris</h3>
            </div>

            <div className="table-responsive">
              <table className="inventory-table">
                <tbody>
                  <tr>
                    <th>Nomor Inventaris</th>
                    <td>{item.nomor_inventaris || "-"}</td>
                  </tr>
                  <tr>
                    <th>Sarana Inventaris</th>
                    <td>{item.nama_sarana_inventaris || "-"}</td>
                  </tr>
                  <tr>
                    <th>User</th>
                    <td>{item.user || "-"}</td>
                  </tr>
                  <tr>
                    <th>Lokasi</th>
                    <td>{item.nama_lokasi || "-"}</td>
                  </tr>
                  <tr>
                    <th>Penanggung Jawab</th>
                    <td>{item.nama_penanggung_jawab || "-"}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>
                      <span className="status-badge">{item.status || "-"}</span>
                    </td>
                  </tr>
                  <tr>
                    <th>Tanggal Perolehan</th>
                    <td>{formatTanggal(item.tanggal_perolehan)}</td>
                  </tr>
                  <tr>
                    <th>Foto</th>
                    <td>
                      {renderImage(item.foto, item.nomor_inventaris, 100)}
                    </td>
                  </tr>
                  <tr>
                    <th>Spesifikasi</th>
                    <td>{item.spesifikasi || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="detail-history-list">
            <HistoryTable
              title="Riwayat Perawatan"
              type="maintenance"
              rows={item.maintenances || []}
              emptyMessage="Belum ada riwayat perawatan."
              canManageHistory={canManageHistory}
              isAdmin={isAdmin}
              onAdd={onAddMaintenance}
              onViewAll={onViewMaintenances}
              onEditRow={onEditMaintenance}
              onDeleteRow={(row) =>
                handleDeleteHistory(
                  row,
                  onDeleteMaintenance,
                  "riwayat perawatan",
                )
              }
              columns={[
                {
                  key: "tanggal_perawatan",
                  label: "Tanggal",
                  render: (row) => formatTanggal(row.tanggal_perawatan),
                },
                {
                  key: "tanggal_perawatan_selanjutnya",
                  label: "Perawatan Selanjutnya",
                  render: (row) =>
                    formatTanggal(row.tanggal_perawatan_selanjutnya),
                },
                { key: "jenis_perawatan", label: "Jenis Perawatan" },
                { key: "pelaksana", label: "Pelaksana" },
              ]}
            />

            <HistoryTable
              title="Riwayat Perbaikan"
              type="repair"
              rows={item.repairs || []}
              emptyMessage="Belum ada riwayat perbaikan."
              canManageHistory={canManageHistory}
              isAdmin={isAdmin}
              onAdd={onAddRepair}
              onViewAll={onViewRepairs}
              onEditRow={onEditRepair}
              onDeleteRow={(row) =>
                handleDeleteHistory(row, onDeleteRepair, "riwayat perbaikan")
              }
              columns={[
                {
                  key: "tanggal_pengajuan",
                  label: "Tanggal Pengajuan",
                  render: (row) => formatTanggal(row.tanggal_pengajuan),
                },
                {
                  key: "tanggal_tindak_lanjut",
                  label: "Tanggal Tindak Lanjut",
                  render: (row) => formatTanggal(row.tanggal_tindak_lanjut),
                },
                { key: "jenis_perbaikan", label: "Jenis Perbaikan" },
                { key: "pelaksana", label: "Pelaksana" },
                {
                  key: "dokumen",
                  label: "Dokumen",
                  render: (row) => renderDocument(row.dokumen),
                },
              ]}
            />

            <HistoryTable
              title="Riwayat Stok Opname"
              type="stock-opname"
              rows={item.stockOpnames || []}
              emptyMessage="Belum ada riwayat stok opname."
              canManageHistory={canManageHistory}
              isAdmin={isAdmin}
              onAdd={onAddStockOpname}
              onViewAll={onViewStockOpnames}
              onEditRow={onEditStockOpname}
              onDeleteRow={(row) =>
                handleDeleteHistory(row, onDeleteStockOpname, "stok opname")
              }
              columns={[
                {
                  key: "tanggal",
                  label: "Tanggal",
                  render: (row) => formatTanggal(row.tanggal),
                },
                { key: "kondisi", label: "Kondisi" },
                { key: "auditor", label: "Auditor" },
                {
                  key: "foto",
                  label: "Foto",
                  render: (row) => renderImage(row.foto, "Foto stok opname"),
                },
              ]}
            />

            <HistoryTable
              title="Riwayat Pemindahan & Pemusnahan"
              type="mutation"
              rows={item.mutations || []}
              emptyMessage="Belum ada riwayat pemindahan atau pemusnahan."
              canManageHistory={canManageHistory}
              isAdmin={isAdmin}
              onAdd={onAddMutation}
              onViewAll={onViewMutations}
              onEditRow={onEditMutation}
              onDeleteRow={(row) =>
                handleDeleteHistory(row, onDeleteMutation, "mutasi inventaris")
              }
              columns={[
                {
                  key: "tanggal",
                  label: "Tanggal",
                  render: (row) => formatTanggal(row.tanggal),
                },
                { key: "jenis", label: "Jenis" },
                { key: "alasan", label: "Alasan" },
                {
                  key: "dokumen",
                  label: "Dokumen",
                  render: (row) => renderDocument(row.dokumen),
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}
