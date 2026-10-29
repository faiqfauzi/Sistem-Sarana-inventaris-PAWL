import { useEffect, useState } from "react";
import api from "../../services/api";
import FormPenanggungJawab from "./FormPenanggungJawab";

export default function EditPenanggungJawab({ id, onBack, onSuccess }) {
  const [responsible, setResponsible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchResponsible = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/responsibles/${id}`);

        if (active) {
          setResponsible(response.data.data?.responsible || response.data.data);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(
            err.response?.data?.message ||
              "Gagal mengambil data penanggung jawab.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchResponsible();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError("");

    try {
      await api.put(`/responsibles/${id}`, formData);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal memperbarui penanggung jawab.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Memuat data penanggung jawab...</div>;
  }

  if (!responsible) {
    return (
      <section className="content-card">
        <div style={{ padding: "20px" }}>
          <div className="alert-custom alert-danger" role="alert">
            {error || "Data penanggung jawab tidak ditemukan."}
          </div>
          <button type="button" className="btn-outline-custom" onClick={onBack}>
            <i className="ti ti-arrow-left" /> Kembali
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      <FormPenanggungJawab
        title="Edit Penanggung Jawab"
        initialData={responsible}
        onSubmit={handleSubmit}
        onCancel={onBack}
        loading={saving}
        error={error}
      />
    </>
  );
}
