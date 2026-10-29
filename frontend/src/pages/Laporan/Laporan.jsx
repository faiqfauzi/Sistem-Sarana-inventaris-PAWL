import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "./Laporan.css";

const defaultColumns = [
  "nomor_inventaris",
  "tanggal_perolehan",
  "sarana_inventaris",
  "spesifikasi",
  "lokasi",
  "user",
  "penanggung_jawab",
];

const columnLabels = {
  nomor_inventaris: "Nomor Inventaris",
  tanggal_perolehan: "Tanggal Perolehan",
  sarana_inventaris: "Sarana Inventaris",
  foto: "Foto",
  spesifikasi: "Spesifikasi",
  lokasi: "Lokasi",
  user: "User",
  penanggung_jawab: "Penanggung Jawab",
  tanggal_perawatan: "Tanggal Perawatan",
  jenis_perawatan: "Jenis Perawatan",
  tanggal_perbaikan: "Tanggal Perbaikan",
  jenis_perbaikan: "Jenis Perbaikan",
  foto_so: "Foto Stock Opname",
  tanggal_so: "Tanggal Stock Opname",
  status_kondisi: "Status / Kondisi",
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function Laporan() {
  const [options, setOptions] = useState({
    locations: [],
    responsibles: [],
    masterSaranaInventaris: [],
  });

  const [filters, setFilters] = useState({
    tanggal_awal: "",
    tanggal_akhir: "",
    master_sarana_inventaris_id: "",
    location_id: "",
    responsible_id: "",
  });

  const [inventories, setInventories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState(defaultColumns);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get("/reports/options");
        setOptions({
          locations: response.data.locations || [],
          responsibles: response.data.responsibles || [],
          masterSaranaInventaris: response.data.masterSaranaInventaris || [],
        });
      } catch (err) {
        console.error("Gagal mengambil opsi laporan:", err);
        setError("Gagal mengambil pilihan filter laporan.");
      }
    };

    fetchOptions();
  }, []);

  const fetchReports = async (params = filters) => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/reports", { params });
      const data = response.data.inventories || [];

      setInventories(data);
      setSelectedIds([]);
    } catch (err) {
      console.error("Gagal mengambil laporan:", err);
      setError(err.response?.data?.message || "Gagal mengambil data laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports({});
  }, []);

  const visibleColumns = useMemo(
    () => selectedColumns.filter((column) => columnLabels[column]),
    [selectedColumns],
  );

  const updateFilter = (name, value) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleColumn = (column) => {
    setSelectedColumns((previous) =>
      previous.includes(column)
        ? previous.filter((item) => item !== column)
        : [...previous, column],
    );
  };

  const toggleInventory = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id],
    );
  };

  const toggleAllInventories = () => {
    if (selectedIds.length === inventories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(inventories.map((item) => item.id));
    }
  };

  const resetFilters = () => {
    const emptyFilters = {
      tanggal_awal: "",
      tanggal_akhir: "",
      master_sarana_inventaris_id: "",
      location_id: "",
      responsible_id: "",
    };

    setFilters(emptyFilters);
    fetchReports(emptyFilters);
  };

  const getCellValue = (item, column) => {
    switch (column) {
      case "nomor_inventaris":
        return item.nomor_inventaris || "-";
      case "tanggal_perolehan":
        return formatDate(item.tanggal_perolehan);
      case "sarana_inventaris":
        return item.nama_sarana_inventaris || "-";
      case "spesifikasi":
        return item.spesifikasi || "-";
      case "lokasi":
        return item.nama_lokasi || "-";
      case "user":
        return item.user || "-";
      case "penanggung_jawab":
        return item.nama_penanggung_jawab || "-";
      case "tanggal_perawatan":
        return formatDate(item.tanggal_perawatan);
      case "jenis_perawatan":
        return item.jenis_perawatan || "-";
      case "tanggal_perbaikan":
        return formatDate(item.tanggal_perbaikan);
      case "jenis_perbaikan":
        return item.jenis_perbaikan || "-";
      case "tanggal_so":
        return formatDate(item.tanggal_so);
      case "status_kondisi":
        return item.kondisi_so || item.status || "-";
      case "foto":
      case "foto_so":
        return item[column] ? (
          <a href={item[column]} target="_blank" rel="noreferrer">
            Lihat foto
          </a>
        ) : (
          "-"
        );
      default:
        return "-";
    }
  };

  const handleExport = async (format) => {
    if (selectedIds.length === 0) {
      setError("Pilih minimal satu inventaris untuk diekspor.");
      return;
    }

    if (selectedColumns.length === 0) {
      setError("Pilih minimal satu kolom laporan.");
      return;
    }

    setError("");

    try {
      const response = await api.post(
        `/reports/export/${format}`,
        {
          inventory_ids: selectedIds,
          columns: selectedColumns,
          filters,
        },
        { responseType: "blob" },
      );

      const mimeType =
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf";

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `laporan-inventaris.${format === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal mengekspor laporan:", err);
    }
  };

  return (
    <div className="laporan-page">
      <div className="laporan-header">
        <div>
          <h1>Laporan Sarana Inventaris</h1>
          <p>Filter, pilih inventaris, dan tentukan kolom laporan.</p>
        </div>
      </div>

      <section className="laporan-card">
        <h3>Filter Laporan</h3>

        <form
          className="laporan-filter-grid"
          onSubmit={(event) => {
            event.preventDefault();
            fetchReports();
          }}
        >
          <div className="laporan-field">
            <label>Tanggal Perolehan Awal</label>
            <input
              type="date"
              value={filters.tanggal_awal}
              onChange={(event) =>
                updateFilter("tanggal_awal", event.target.value)
              }
            />
          </div>

          <div className="laporan-field">
            <label>Tanggal Perolehan Akhir</label>
            <input
              type="date"
              value={filters.tanggal_akhir}
              onChange={(event) =>
                updateFilter("tanggal_akhir", event.target.value)
              }
            />
          </div>

          <div className="laporan-field">
            <label>Sarana Inventaris</label>
            <select
              value={filters.master_sarana_inventaris_id}
              onChange={(event) =>
                updateFilter("master_sarana_inventaris_id", event.target.value)
              }
            >
              <option value="">Semua Sarana Inventaris</option>
              {options.masterSaranaInventaris.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_sarana_inventaris}
                </option>
              ))}
            </select>
          </div>

          <div className="laporan-field">
            <label>Lokasi</label>
            <select
              value={filters.location_id}
              onChange={(event) =>
                updateFilter("location_id", event.target.value)
              }
            >
              <option value="">Semua Lokasi</option>
              {options.locations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_lokasi}
                </option>
              ))}
            </select>
          </div>

          <div className="laporan-field">
            <label>Penanggung Jawab</label>
            <select
              value={filters.responsible_id}
              onChange={(event) =>
                updateFilter("responsible_id", event.target.value)
              }
            >
              <option value="">Semua Penanggung Jawab</option>
              {options.responsibles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama_penanggung_jawab}
                </option>
              ))}
            </select>
          </div>

          <div className="laporan-filter-actions">
            <button
              type="submit"
              className="laporan-btn laporan-btn-primary"
              disabled={loading}
            >
              <i className="ti ti-filter" /> Tampilkan
            </button>

            <button
              type="button"
              className="laporan-btn laporan-btn-secondary"
              onClick={resetFilters}
            >
              <i className="ti ti-refresh" /> Reset
            </button>
          </div>
        </form>
      </section>

      <section className="laporan-card">
        <div className="laporan-section-heading">
          <div>
            <h3>Kolom Laporan</h3>
            <p>Pilih kolom yang ingin dimasukkan ke hasil export.</p>
          </div>
          <button
            type="button"
            className="laporan-text-button"
            onClick={() => setSelectedColumns(Object.keys(columnLabels))}
          >
            Pilih Semua Kolom
          </button>
        </div>

        <div className="laporan-column-grid">
          {Object.entries(columnLabels).map(([key, label]) => (
            <label className="laporan-checkbox" key={key}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(key)}
                onChange={() => toggleColumn(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="laporan-card">
        <div className="laporan-section-heading laporan-table-heading">
          <div>
            <h3>Daftar Inventaris</h3>
            <p>
              {selectedIds.length} dipilih dari {inventories.length} inventaris.
            </p>
          </div>

          <div className="laporan-export-actions">
            <button
              type="button"
              className="laporan-btn laporan-btn-excel"
              onClick={() => handleExport("excel")}
            >
              <i className="ti ti-file-spreadsheet" /> Export Excel
            </button>
            <button
              type="button"
              className="laporan-btn laporan-btn-pdf"
              onClick={() => handleExport("pdf")}
            >
              <i className="ti ti-file-type-pdf" /> Export PDF
            </button>
          </div>
        </div>

        {error && <div className="laporan-error">{error}</div>}

        <div className="laporan-table-wrapper">
          <table className="laporan-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      inventories.length > 0 &&
                      selectedIds.length === inventories.length
                    }
                    onChange={toggleAllInventories}
                    aria-label="Pilih semua inventaris"
                  />
                </th>
                <th>No.</th>
                {visibleColumns.map((column) => (
                  <th key={column}>{columnLabels[column]}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2}>
                    Memuat data laporan...
                  </td>
                </tr>
              ) : inventories.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2}>
                    Tidak ada data inventaris.
                  </td>
                </tr>
              ) : (
                inventories.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleInventory(item.id)}
                        aria-label={`Pilih inventaris ${item.nomor_inventaris}`}
                      />
                    </td>
                    <td>{index + 1}</td>
                    {visibleColumns.map((column) => (
                      <td key={column}>{getCellValue(item, column)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
