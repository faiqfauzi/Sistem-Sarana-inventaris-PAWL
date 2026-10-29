export default function FormInventaris({
  title,
  form,
  options,
  error,
  saving,
  onChange,
  onSubmit,
  onBack,
}) {
  return (
    <div className="master-page">
      <section className="content-card">
        <div className="content-card-header">
          <h2>{title}</h2>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Nomor Inventaris <span className="required">*</span>
              <input
                name="nomor_inventaris"
                value={form.nomor_inventaris}
                onChange={onChange}
                placeholder="Contoh: INV-001"
                required
              />
            </label>

            <label>
              Nama Sarana
              <select
                name="master_sarana_inventaris_id"
                value={form.master_sarana_inventaris_id}
                onChange={onChange}
              >
                <option value="">Pilih sarana</option>
                {options.sarana.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_sarana_inventaris}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Lokasi
              <select
                name="location_id"
                value={form.location_id}
                onChange={onChange}
              >
                <option value="">Pilih lokasi</option>
                {options.lokasi.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_lokasi}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Penanggung Jawab
              <select
                name="responsible_id"
                value={form.responsible_id}
                onChange={onChange}
              >
                <option value="">Pilih penanggung jawab</option>
                {options.penanggungJawab.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama_penanggung_jawab}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Pengguna
              <input
                name="user"
                value={form.user}
                onChange={onChange}
                placeholder="Nama pengguna inventaris"
              />
            </label>

            <label>
              Status
              <select name="status" value={form.status} onChange={onChange}>
                {![
                  "Baik",
                  "Rusak Ringan",
                  "Rusak Berat",
                  "Dalam Perbaikan",
                ].includes(form.status) && (
                  <option value={form.status}>{form.status}</option>
                )}
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
                <option value="Dalam Perbaikan">Dalam Perbaikan</option>
              </select>
            </label>

            <label>
              Tanggal Perolehan
              <input
                type="date"
                name="tanggal_perolehan"
                value={form.tanggal_perolehan}
                onChange={onChange}
              />
            </label>

            <label className="full-width">
              Spesifikasi
              <textarea
                name="spesifikasi"
                value={form.spesifikasi}
                onChange={onChange}
                placeholder="Masukkan spesifikasi atau keterangan inventaris"
                rows={3}
              />
            </label>

            {error && (
              <div className="full-width master-form-error" role="alert">
                {error}
              </div>
            )}
          </div>

          <div className="form-footer">
            <button
              type="button"
              className="btn-outline-custom"
              onClick={onBack}
              disabled={saving}
            >
              Kembali
            </button>

            <button
              type="submit"
              className="btn-primary-custom"
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
