import { useEffect, useState } from "react";
import api from "../../services/api";
import FormLokasi from "./FormLokasi";

export default function EditLokasi({ id, onBack, onSaved }) {
  const [lokasi, setLokasi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let aktif = true;

    async function fetchLokasi() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/locations/${id}`);
        const data = response.data.data?.location;

        if (!data) {
          throw new Error("Data lokasi tidak ditemukan.");
        }

        if (aktif) {
          setLokasi(data);
        }
      } catch (err) {
        console.error("Gagal mengambil data lokasi:", err);

        if (aktif) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Gagal mengambil data lokasi.",
          );
        }
      } finally {
        if (aktif) setLoading(false);
      }
    }

    if (id == null || id === "") {
      setError("ID lokasi tidak valid.");
      setLoading(false);
    } else {
      fetchLokasi();
    }

    return () => {
      aktif = false;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="content-card">
        <div className="empty-state">Memuat data lokasi…</div>
      </section>
    );
  }

  if (error || !lokasi) {
    return (
      <section className="content-card">
        <div className="alert-custom alert-danger" role="alert">
          <i className="ti ti-alert-circle" />
          <span>{error || "Data lokasi tidak ditemukan."}</span>
        </div>

        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali ke Lokasi
        </button>
      </section>
    );
  }

  return (
    <FormLokasi
      key={lokasi.id}
      mode="edit"
      initialData={lokasi}
      onBack={onBack}
      onSaved={onSaved}
    />
  );
}
