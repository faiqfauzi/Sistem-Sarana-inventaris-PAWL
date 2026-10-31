import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./ManajemenAkun.css";

export default function ManajemenAkun({ onTambah, onEdit }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users");
      setAccounts(response.data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil daftar akun.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleDelete = async (account) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus akun "${account.username}"?`,
    );

    if (!confirmed) return;

    try {
      setError("");
      setNotice("");

      await api.delete(`/users/${account.id}`);

      setNotice(`Akun "${account.username}" berhasil dihapus.`);
      await fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus akun.");
    }
  };

  return (
    <div className="page-content account-page">
      <div className="card account-card">
        <div className="account-header">
          <div className="account-heading">
            <div className="account-icon">
              <i className="ti ti-users" />
            </div>

            <div>
              <h2>Manajemen Akun</h2>
              <p>Kelola akun pengguna aplikasi dan hak aksesnya.</p>
            </div>
          </div>

          <button
            type="button"
            className="account-btn account-btn-primary"
            onClick={onTambah}
          >
            <i className="ti ti-plus" />
            <span>Tambah Akun</span>
          </button>
        </div>

        <div className="account-summary">
          <div className="account-summary-icon">
            <i className="ti ti-user" />
          </div>
          <div>
            <span className="account-summary-label">Total akun</span>
            <strong>{accounts.length}</strong>
          </div>
        </div>

        {error && (
          <div className="account-alert account-alert-error" role="alert">
            <i className="ti ti-alert-circle" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="account-alert account-alert-success" role="status">
            <i className="ti ti-circle-check" />
            <span>{notice}</span>
          </div>
        )}

        <div className="account-table-heading">
          <h3>Daftar Pengguna</h3>
          <span>{accounts.length} akun terdaftar</span>
        </div>

        {loading ? (
          <div className="account-state">
            <span className="account-spinner" />
            <p>Memuat daftar akun...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="account-state">
            <div className="account-empty-icon">
              <i className="ti ti-users" />
            </div>
            <h3>Belum ada akun</h3>
            <p>Tambahkan akun pengguna untuk mulai mengelola akses.</p>
            <button
              type="button"
              className="account-btn account-btn-primary"
              onClick={onTambah}
            >
              <i className="ti ti-plus" />
              Tambah Akun
            </button>
          </div>
        ) : (
          <div className="account-table-wrapper">
            <table className="account-table">
              <thead>
                <tr>
                  <th className="account-number-column">No.</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Penanggung Jawab</th>
                  <th className="account-action-column">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account, index) => (
                  <tr key={account.id}>
                    <td className="account-number-cell">{index + 1}</td>

                    <td>
                      <div className="account-username">
                        <div className="account-avatar">
                          <i className="ti ti-user" />
                        </div>
                        <span>{account.username}</span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`account-role ${
                          account.role === "admin"
                            ? "account-role-admin"
                            : "account-role-responsible"
                        }`}
                      >
                        <i
                          className={`ti ${
                            account.role === "admin"
                              ? "ti-shield-check"
                              : "ti-user-check"
                          }`}
                        />
                        {account.role === "admin"
                          ? "Admin"
                          : "Penanggung Jawab"}
                      </span>
                    </td>

                    <td className="account-responsible-cell">
                      {account.role === "admin"
                        ? "—"
                        : account.nama_penanggung_jawab || "—"}
                    </td>

                    <td>
                      <div className="account-actions">
                        <button
                          type="button"
                          className="account-btn account-btn-edit"
                          onClick={() => onEdit(account.id)}
                          title={`Edit akun ${account.username}`}
                        >
                          <i className="ti ti-edit" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="account-btn account-btn-delete"
                          onClick={() => handleDelete(account)}
                          title={`Hapus akun ${account.username}`}
                        >
                          <i className="ti ti-trash" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && accounts.length > 0 && (
          <div className="account-table-footer">
            <span>
              Menampilkan <strong>{accounts.length}</strong> akun pengguna
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
