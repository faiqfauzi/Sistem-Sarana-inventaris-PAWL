import { useEffect, useState } from "react";

export default function FormPenanggungJawab({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = "",
  title = "Tambah Penanggung Jawab",
}) {
  const [nama, setNama] = useState(initialData?.nama_penanggung_jawab || "");

  useEffect(() => {
    setNama(initialData?.nama_penanggung_jawab || "");
  }, [initialData]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const namaBersih = nama.trim();
    if (!namaBersih) return;

    onSubmit?.({
      nama_penanggung_jawab: namaBersih,
    });
  };

  return (
    <section className="content-card">
      <div className="content-card-header">
        <div>
          <h3>{title}</h3>
          <p>Lengkapi nama penanggung jawab di bawah ini.</p>
        </div>
      </div>

      {error && (
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid" style={{ padding: "20px" }}>
          <label className="full-width">
            Nama Penanggung Jawab <span className="required">*</span>
            <input
              type="text"
              name="nama_penanggung_jawab"
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              placeholder="Masukkan nama penanggung jawab"
              maxLength={255}
              required
              autoFocus
            />
          </label>
        </div>

        <div className="form-footer" style={{ padding: "0 20px 20px" }}>
          <button
            type="button"
            className="btn-outline-custom"
            onClick={onCancel}
            disabled={loading}
          >
            Batal
          </button>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading || !nama.trim()}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </section>
  );
}
