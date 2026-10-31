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

export default function EditInventaris({ id, onBack, onSaved, currentUser }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [options, setOptions] = useState(emptyOptions);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = currentUser?.role === "admin";
  const currentResponsibleId = currentUser?.responsible_id;

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      setError("");

      try {
        const [itemResponse, optionsResponse] = await Promise.all([
          api.get(`/inventories/${id}`),
          api.get("/inventories/options"),
        ]);

        const item = itemResponse.data?.data;

        if (active) {
          setOptions(optionsResponse.data?.data || emptyOptions);

          setForm({
            nomor_inventaris: item?.nomor_inventaris || "",
            user: item?.user || "",
            status: item?.status || "Baik",
            tanggal_perolehan: item?.tanggal_perolehan
              ? String(item.tanggal_perolehan).slice(0, 10)
              : "",
            spesifikasi: item?.spesifikasi || "",
            master_sarana_inventaris_id:
              item?.master_sarana_inventaris_id ?? "",
            location_id: item?.location_id ?? "",
            responsible_id: item?.responsible_id ?? "",
          });
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError(
            err.response?.data?.message || "Gagal mengambil data inventaris.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
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
      responsible_id: form.responsible_id || null,
      tanggal_perolehan: form.tanggal_perolehan || null,
    };

    try {
      await api.put(`/inventories/${id}`, payload);
      await onSaved?.();
      onBack();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal memperbarui data inventaris.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="master-page">
        <div className="empty-state">Memuat data inventaris...</div>
      </div>
    );
  }

  return (
    <FormInventaris
      title="Edit Sarana Inventaris"
      form={form}
      options={options}
      error={error}
      saving={saving}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onBack={onBack}
      isAdmin={isAdmin}
      isEdit={true}
      currentResponsibleId={currentResponsibleId}
    />
  );
}
