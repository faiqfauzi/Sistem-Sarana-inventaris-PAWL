import { useEffect, useState } from "react";
import api from "../../services/api";
import "./ManajemenAkun.css";

const initialForm = {
  username: "",
  role: "responsible",
  responsible_id: "",
  password: "",
  password_confirmation: "",
};

export default function TambahAkun({ onBack, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingResponsibles, setLoadingResponsibles] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchResponsibles = async () => {
      try {
        const response = await api.get("/users/responsibles");
        if (active) setResponsibles(response.data?.data ?? []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Gagal mengambil daftar penanggung jawab.",
          );
        }
      } finally {
        if (active) setLoadingResponsibles(false);
      }
    };

    fetchResponsibles();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "role" && value === "admin" ? { responsible_id: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.role === "responsible" && !form.responsible_id) {
      setError("Pilih penanggung jawab terlebih dahulu.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/users", {
        ...form,
        responsible_id:
          form.role === "admin" ? null : Number(form.responsible_id),
      });

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menambahkan akun.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content account-page">
      <div className="card account-form-card">
        <div className="account-form-header">
          <div className="account-form-heading">
            <div className="account-icon">
              <i className="ti ti-user-plus" />
            </div>
            <div>
              <h2>Tambah Akun</h2>
              <p>Buat akun pengguna baru untuk sistem inventaris.</p>
            </div>
          </div>

          <span className="account-form-badge">
            <i className="ti ti-shield-check" />
            Admin
          </span>
        </div>

        <div className="account-form-divider" />

        {error && (
          <div className="account-alert account-alert-error" role="alert">
            <i className="ti ti-alert-circle" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="account-form-section">
            <h3>Informasi Akun</h3>
            <p>Isi username dan tentukan jenis akses pengguna.</p>

            <div className="account-form-grid">
              <div className="account-field">
                <label htmlFor="username">
                  Username <span className="account-required">*</span>
                </label>
                <input
                  id="username"
                  className="account-input"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  maxLength={255}
                  required
                  autoComplete="username"
                  placeholder="Masukkan username"
                />
              </div>

              <div className="account-field">
                <label htmlFor="role">
                  Role <span className="account-required">*</span>
                </label>
                <select
                  id="role"
                  className="account-input"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="responsible">Penanggung Jawab</option>
                </select>
                <small>Role menentukan hak akses pengguna di aplikasi.</small>
              </div>

              {form.role === "responsible" && (
                <div className="account-field account-field-full">
                  <label htmlFor="responsible_id">
                    Penanggung Jawab <span className="account-required">*</span>
                  </label>
                  <select
                    id="responsible_id"
                    className="account-input"
                    name="responsible_id"
                    value={form.responsible_id}
                    onChange={handleChange}
                    required
                    disabled={loadingResponsibles}
                  >
                    <option value="">
                      {loadingResponsibles
                        ? "Memuat daftar penanggung jawab..."
                        : "-- Pilih Penanggung Jawab --"}
                    </option>
                    {responsibles.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama_penanggung_jawab}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="account-form-section">
            <h3>Keamanan Akun</h3>
            <p>Buat password minimal 8 karakter untuk akun baru.</p>

            <div className="account-form-grid">
              <div className="account-field">
                <label htmlFor="password">
                  Password <span className="account-required">*</span>
                </label>
                <input
                  id="password"
                  className="account-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div className="account-field">
                <label htmlFor="password_confirmation">
                  Konfirmasi Password{" "}
                  <span className="account-required">*</span>
                </label>
                <input
                  id="password_confirmation"
                  className="account-input"
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                />
              </div>
            </div>
          </div>

          <div className="account-form-actions">
            <button
              type="button"
              className="account-btn account-btn-cancel"
              onClick={onBack}
              disabled={loading}
            >
              <i className="ti ti-arrow-left" />
              Kembali
            </button>

            <button
              type="submit"
              className="account-btn account-btn-primary"
              disabled={loading || loadingResponsibles}
            >
              <i
                className={`ti ${loading ? "ti-loader-2" : "ti-device-floppy"}`}
              />
              {loading ? "Menyimpan..." : "Simpan Akun"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
