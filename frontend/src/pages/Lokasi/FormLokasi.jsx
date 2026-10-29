import { useState } from "react";
import api from "../../services/api";

export default function FormLokasi({
  mode = "create",
  initialData = {},
  onBack,
  onSaved,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    nama_lokasi: initialData.nama_lokasi || "",
    keterangan: initialData.keterangan || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nama_lokasi = form.nama_lokasi.trim();

    if (!nama_lokasi) {
      setError("Nama lokasi wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        nama_lokasi,
        keterangan: form.keterangan.trim(),
      };

      if (isEdit) {
        await api.put(`/locations/${initialData.id}`, payload);
      } else {
        await api.post("/locations", payload);
      }

      await onSaved?.();
    } catch (err) {
      console.error("Gagal menyimpan lokasi:", err);
      setError(err.response?.data?.message || "Gagal menyimpan data lokasi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="content-card">
      <div className="content-card-header">
        <div>
          <h2>{isEdit ? "Edit Lokasi" : "Tambah Lokasi"}</h2>
          <p>
            {isEdit
              ? "Perbarui informasi lokasi."
              : "Masukkan informasi lokasi baru."}
          </p>
        </div>

        <button
          type="button"
          className="btn-outline-custom"
          onClick={onBack}
          disabled={saving}
        >
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="full-width">
            Nama Lokasi <span className="required">*</span>
            <input
              name="nama_lokasi"
              value={form.nama_lokasi}
              onChange={handleChange}
              placeholder="Contoh: Ruang Produksi"
              maxLength={255}
              required
            />
          </label>

          <label className="full-width">
            Keterangan
            <textarea
              name="keterangan"
              value={form.keterangan}
              onChange={handleChange}
              placeholder="Keterangan lokasi (opsional)"
              rows={4}
            />
          </label>
        </div>

        {error && (
          <div className="alert-custom alert-danger" role="alert">
            <i className="ti ti-alert-circle" />
            <span>{error}</span>
          </div>
        )}

        <div className="form-footer">
          <button
            type="button"
            className="btn-outline-custom"
            onClick={onBack}
            disabled={saving}
          >
            Batal
          </button>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={saving}
          >
            {saving
              ? "Menyimpan…"
              : isEdit
                ? "Simpan Perubahan"
                : "Simpan Lokasi"}
          </button>
        </div>
      </form>
    </section>
  );
}
