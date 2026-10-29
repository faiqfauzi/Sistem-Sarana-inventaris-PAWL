import { useEffect, useState } from "react";
import api from "../../services/api";

export default function DetailLokasi({ id, onBack }) {
  const [lokasi, setLokasi] = useState(null);
  const [ringkasan, setRingkasan] = useState([]);
  const [inventaris, setInventaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;

    async function fetchDetail() {
      if (id == null || id === "") {
        setError("ID lokasi tidak ditemukan.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/locations/${id}`);
        const data = response.data.data;

        if (!aktif) return;

        setLokasi(data?.location || null);
        setRingkasan(data?.summary || []);
        setInventaris(data?.inventories || []);
      } catch (err) {
        console.error("Gagal mengambil detail lokasi:", err);

        if (aktif) {
          setError(
            err.response?.data?.message || "Gagal mengambil detail lokasi.",
          );
        }
      } finally {
        if (aktif) setLoading(false);
      }
    }

    fetchDetail();

    return () => {
      aktif = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="content-card">
        <div className="empty-state">Memuat detail lokasi…</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="content-card">
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error}</span>
        </div>

        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali ke Lokasi
        </button>
      </section>
    );
  }

  if (!lokasi) {
    return (
      <section className="content-card">
        <div className="empty-state">Data lokasi tidak ditemukan.</div>

        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali ke Lokasi
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="content-card">
        <div className="content-card-header">
          <div>
            <p>Detail Lokasi</p>
            <h2>{lokasi.nama_lokasi}</h2>
            <p>{lokasi.keterangan || "Tidak ada keterangan lokasi."}</p>
          </div>

          <button type="button" className="btn-outline-custom" onClick={onBack}>
            <i className="ti ti-arrow-left" /> Kembali
          </button>
        </div>
      </section>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Ringkasan Inventaris</h2>
            <p>Jumlah inventaris berdasarkan jenis sarana.</p>
          </div>
        </div>

        {ringkasan.length === 0 ? (
          <div className="empty-state">Belum ada inventaris di lokasi ini.</div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="text-center">No.</th>
                  <th>Nama Sarana Inventaris</th>
                  <th className="text-center">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {ringkasan.map((item, index) => (
                  <tr
                    key={item.master_sarana_inventaris_id ?? item.id ?? index}
                  >
                    <td className="text-center">{index + 1}</td>
                    <td>{item.nama_sarana_inventaris || item.nama || "—"}</td>
                    <td className="text-center">
                      <span className="count-badge">
                        {item.jumlah ?? item.jumlah_inventaris ?? 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="content-card">
        <div className="content-card-header">
          <div>
            <h2>Daftar Inventaris</h2>
            <p>Inventaris yang tercatat pada lokasi ini.</p>
          </div>
        </div>

        {inventaris.length === 0 ? (
          <div className="empty-state">
            Belum ada data inventaris di lokasi ini.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th className="text-center">No.</th>
                  <th>Nomor Inventaris</th>
                  <th>Sarana Inventaris</th>
                  <th>User</th>
                  <th>Penanggung Jawab</th>
                  <th>Spesifikasi</th>
                  <th>Tanggal Perolehan</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {inventaris.map((item, index) => (
                  <tr key={item.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="inventory-number">
                      {item.nomor_inventaris || "—"}
                    </td>
                    <td>
                      {item.nama_sarana_inventaris ||
                        item.masterSaranaInventaris?.nama_sarana_inventaris ||
                        "—"}
                    </td>
                    <td>{item.user?.name || item.nama_user || "—"}</td>
                    <td>
                      {item.nama_penanggung_jawab ||
                        item.responsible?.name ||
                        item.penanggung_jawab ||
                        "—"}
                    </td>
                    <td>{item.spesifikasi || "—"}</td>
                    <td>{item.tanggal_perolehan || "—"}</td>
                    <td>{item.status || "—"}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-icon-action edit"
                        title="Lihat detail inventaris"
                        aria-label="Lihat detail inventaris"
                        onClick={() => {
                          const path = `/sarana-inventaris/${item.id}`;
                          window.history.pushState({}, "", path);
                          window.dispatchEvent(new PopStateEvent("popstate"));
                        }}
                      >
                        <i className="ti ti-eye" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
