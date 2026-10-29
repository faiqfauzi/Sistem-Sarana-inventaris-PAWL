import { useState } from "react";
import api from "../../services/api";
import FormMasterSarana from "./FormMasterSarana";

export default function TambahMasterSarana({ onBack, onSaved }) {
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const namaBersih = nama.trim();

    if (!namaBersih) {
      setError("Nama sarana wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("/master-sarana", {
        nama_sarana_inventaris: namaBersih,
      });

      await onSaved?.();
      onBack();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menambahkan master sarana inventaris.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormMasterSarana
      title="Tambah Master Sarana Inventaris"
      nama={nama}
      setNama={setNama}
      error={error}
      saving={saving}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}
