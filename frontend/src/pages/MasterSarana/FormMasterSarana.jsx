export default function FormMasterSarana({
  title,
  nama,
  setNama,
  error,
  saving,
  onSubmit,
  onBack,
}) {
  return (
    <div className="master-page">
      <div className="content-card">
        <div className="content-card-header">
          <h2>{title}</h2>
        </div>

        <form onSubmit={onSubmit} className="form-grid">
          <label className="full-width">
            Nama Sarana Inventaris <span className="required">*</span>
            <input
              type="text"
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              placeholder="Masukkan nama sarana inventaris"
              maxLength={255}
              required
              autoFocus
            />
          </label>

          {error && (
            <div className="full-width master-form-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-footer full-width">
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
      </div>
    </div>
  );
}
