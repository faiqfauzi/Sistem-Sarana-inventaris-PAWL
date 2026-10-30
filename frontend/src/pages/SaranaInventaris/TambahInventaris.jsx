import { useEffect, useState } from "react";
import api from "../../services/api";
import FormInventaris from "./FormInventaris";

const emptyForm = {
  nomor_inventaris: "",
  user: "",
  status: "Baik",
  tanggal_perolehan: "",
  spesifikasi: "",
  master_sarana_inventaris_id: "",
  location_id: "",
  responsible_id: "",
};

const emptyOptions = {
  sarana: [],
  lokasi: [],
  penanggungJawab: [],
};

export default function TambahInventaris({ onBack, onSaved, currentUser }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [options, setOptions] = useState(emptyOptions);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const isAdmin = currentUser?.role === "admin";
  const currentResponsibleId = currentUser?.responsible_id;

  useEffect(() => {
    let active = true;

    async function fetchOptions() {
      try {
        const response = await api.get("/inventories/options");

        if (!active) return;

        const fetchedOptions = response.data.data || emptyOptions;
        setOptions(fetchedOptions);

        if (!isAdmin && currentResponsibleId != null) {
          setForm((previous) => ({
            ...previous,
            responsible_id: String(currentResponsibleId),
          }));
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Gagal mengambil pilihan formulir inventaris.",
          );
        }
      }
    }

    fetchOptions();

    return () => {
      active = false;
    };
  }, [isAdmin, currentResponsibleId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Penanggung jawab non-admin tidak boleh diganti.
    if (name === "responsible_id" && !isAdmin) {
      return;
    }

    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      master_sarana_inventaris_id: form.master_sarana_inventaris_id || null,
      location_id: form.location_id || null,
      responsible_id: isAdmin
        ? form.responsible_id || null
        : currentResponsibleId || null,
      tanggal_perolehan: form.tanggal_perolehan || null,
    };

    try {
      await api.post("/inventories", payload);
      await onSaved?.();
      onBack();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Gagal menambahkan data inventaris.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormInventaris
      title="Tambah Sarana Inventaris"
      form={form}
      options={options}
      error={error}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      isAdmin={isAdmin}
      currentResponsibleId={currentResponsibleId}
    />
  );
}
