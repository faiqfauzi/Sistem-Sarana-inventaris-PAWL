import { useEffect, useState } from "react";
import api from "../../services/api";
import FormMasterSarana from "./FormMasterSarana";

export default function EditMasterSarana({ id, onBack, onSaved }) {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchItem() {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(`/master-sarana/${id}`);
        console.log("RESPONS EDIT MASTER SARANA:", response.data);

        const data = response.data?.data?.masterSaranaInventaris;

        if (active) {
          setNama(data?.nama_sarana_inventaris || "");
        }
      } catch (err) {
        console.error("GAGAL MEMUAT MASTER SARANA:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Gagal mengambil data master sarana inventaris.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchItem();

    return () => {
      active = false;
    };
  }, [id]);

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
      await api.put(`/master-sarana/${id}`, {
        nama_sarana_inventaris: namaBersih,
      });

      await onSaved?.();
      onBack();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal memperbarui master sarana inventaris.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="master-page">
        <div className="empty-state">Memuat data master sarana...</div>
      </div>
    );
  }

  return (
    <FormMasterSarana
      title="Edit Master Sarana Inventaris"
      nama={nama}
      setNama={setNama}
      error={error}
      saving={saving}
      onSubmit={handleSubmit}
      onBack={onBack}
    />
  );
}
