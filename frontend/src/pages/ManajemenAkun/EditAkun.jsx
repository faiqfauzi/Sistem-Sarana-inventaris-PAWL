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

export default function EditAkun({ id, onBack, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [responsibles, setResponsibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [accountsResponse, responsiblesResponse] = await Promise.all([
          api.get("/users"),
          api.get("/users/responsibles"),
        ]);

        if (!active) return;

        const accounts = accountsResponse.data?.data ?? [];
        const account = accounts.find((item) => String(item.id) === String(id));

        if (!account) {
          setError("Akun tidak ditemukan.");
          return;
        }

        setResponsibles(responsiblesResponse.data?.data ?? []);
        setForm({
          username: account.username ?? "",
          role: account.role ?? "responsible",
          responsible_id: account.responsible_id
            ? String(account.responsible_id)
            : "",
          password: "",
          password_confirmation: "",
        });
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || "Gagal mengambil data akun.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [id]);

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

    if (form.password && form.password.length < 8) {
      setError("Password baru minimal 8 karakter.");
      return;
    }

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      setSaving(true);

      await api.put(`/users/${id}`, {
        ...form,
        responsible_id:
          form.role === "admin" ? null : Number(form.responsible_id),
      });

      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui akun.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content account-page">
        <div className="card account-form-card">
          <div className="account-state">
            <span className="account-spinner" />
            <p>Memuat data akun...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content account-page">
      <div className="card account-form-card">
        <div className="account-form-header">
          <div className="account-form-heading">
            <div className="account-icon">
              <i className="ti ti-user-edit" />
            </div>
            <div>
              <h2>Edit Akun</h2>
              <p>Perbarui informasi dan akses akun pengguna.</p>
            </div>
          </div>

          <span className="account-form-badge">
            <i className="ti ti-pencil" />
            Edit Pengguna
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
            <p>Periksa username dan role sebelum menyimpan perubahan.</p>

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
                  >
                    <option value="">-- Pilih Penanggung Jawab --</option>
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
            <h3>Ubah Password</h3>
            <p>
              Password bersifat opsional. Kosongkan kedua kolom jika tidak ingin
              mengganti password.
            </p>

            <div className="account-form-grid">
              <div className="account-field">
                <label htmlFor="password">Password Baru</label>
                <input
                  id="password"
                  className="account-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div className="account-field">
                <label htmlFor="password_confirmation">
                  Konfirmasi Password Baru
                </label>
                <input
                  id="password_confirmation"
                  className="account-input"
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>
          </div>

          <div className="account-form-actions">
            <button
              type="button"
              className="account-btn account-btn-cancel"
              onClick={onBack}
              disabled={saving}
            >
              <i className="ti ti-arrow-left" />
              Kembali
            </button>

            <button
              type="submit"
              className="account-btn account-btn-primary"
              disabled={saving}
            >
              <i
                className={`ti ${saving ? "ti-loader-2" : "ti-device-floppy"}`}
              />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
