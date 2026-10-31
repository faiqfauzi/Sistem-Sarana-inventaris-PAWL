import { useRef, useState } from "react";
import api from "../../services/api";
import "./BackupRestore.css";

export default function BackupRestore() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleDownload = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/backup-restore/download", {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/sql" }),
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `backup-inventaris-${new Date()
        .toISOString()
        .replace(/[:.]/g, "-")}.sql`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      showMessage("Backup database berhasil diunduh.", "success");
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Gagal mengunduh backup database.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (event) => {
    event.preventDefault();

    if (!file) {
      showMessage("Pilih file backup SQL terlebih dahulu.", "error");
      return;
    }

    if (!confirmed) {
      showMessage("Centang konfirmasi sebelum menjalankan restore.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("backup_file", file);
    formData.append("confirmation", "1");

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/backup-restore/restore", formData, {
        headers: {
          "Content-Type": false,
        },
      });

      showMessage(
        response.data?.message || "Restore database berhasil.",
        "success",
      );

      setFile(null);
      setConfirmed(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Restore error:", error.response?.data || error);

      showMessage(
        error.response?.data?.message || "Restore database gagal.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backup-page">
      <div className="backup-header">
        <div>
          <h1>Backup &amp; Restore</h1>
          <p>Kelola salinan cadangan dan pemulihan database inventaris.</p>
        </div>
      </div>

      {message && (
        <div
          className={`backup-alert ${
            messageType === "success"
              ? "backup-alert-success"
              : "backup-alert-error"
          }`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="backup-grid">
        <section className="backup-card">
          <div className="backup-icon backup-icon-download">
            <span aria-hidden="true">↓</span>
          </div>

          <h2>Backup Database</h2>
          <p>
            Unduh salinan database dalam format SQL untuk disimpan sebagai
            cadangan.
          </p>

          <ul className="backup-info-list">
            <li>Format file: .sql</li>
            <li>Berisi data database saat backup dibuat</li>
            <li>Disarankan menyimpan salinan di lokasi aman</li>
          </ul>

          <button
            type="button"
            className="backup-button backup-button-primary"
            onClick={handleDownload}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Unduh Backup"}
          </button>
        </section>

        <section className="backup-card">
          <div className="backup-icon backup-icon-upload">
            <span aria-hidden="true">↑</span>
          </div>

          <h2>Restore Database</h2>
          <p>Pulihkan database menggunakan file backup SQL yang tersedia.</p>

          <form onSubmit={handleRestore}>
            <label className="backup-field-label" htmlFor="backup-file">
              Pilih File Backup
            </label>

            <input
              ref={fileInputRef}
              id="backup-file"
              className="backup-file-input"
              type="file"
              accept=".sql"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null);
                setMessage("");
              }}
              disabled={loading}
            />

            {file && (
              <p className="backup-selected-file">File dipilih: {file.name}</p>
            )}

            <label className="backup-confirmation">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(event) => setConfirmed(event.target.checked)}
                disabled={loading}
              />
              <span>
                Saya memahami bahwa proses restore dapat mengubah atau menimpa
                data database saat ini.
              </span>
            </label>

            <button
              type="submit"
              className="backup-button backup-button-danger"
              disabled={loading || !file || !confirmed}
            >
              {loading ? "Memproses..." : "Restore Database"}
            </button>
          </form>
        </section>
      </div>

      <div className="backup-warning">
        <strong>Perhatian:</strong> Restore database dapat mengganti data yang
        ada. Pastikan file SQL benar dan simpan backup terbaru sebelum melakukan
        pemulihan.
      </div>
    </div>
  );
}
