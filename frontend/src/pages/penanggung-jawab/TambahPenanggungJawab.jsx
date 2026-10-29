import { useState } from "react";
import api from "../../services/api";
import FormPenanggungJawab from "./FormPenanggungJawab";

export default function TambahPenanggungJawab({ onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError("");

    try {
      await api.post("/responsibles", formData);
      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal menambahkan penanggung jawab.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: "16px" }}>
        <button type="button" className="btn-outline-custom" onClick={onBack}>
          <i className="ti ti-arrow-left" /> Kembali
        </button>
      </div>

      <FormPenanggungJawab
        title="Tambah Penanggung Jawab"
        onSubmit={handleSubmit}
        onCancel={onBack}
        loading={loading}
        error={error}
      />
    </>
  );
}
