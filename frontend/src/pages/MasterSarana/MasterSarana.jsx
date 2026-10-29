import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const ITEMS_PER_PAGE = 10;

export default function MasterSarana({
  onChanged,
  onDetail,
  onCreate,
  onEdit,
}) {
  const [items, setItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showImageForm, setShowImageForm] = useState(false);
  const [headerImage, setHeaderImage] = useState(
    "/images/daftar-sarana-inventaris.png",
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [savingImage, setSavingImage] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/master-sarana", {
        params: { search },
      });

      setItems(response.data.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal mengambil data master sarana inventaris.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

  const visibleItems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  }, [items, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleReset() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Yakin ingin menghapus sarana "${item.nama_sarana_inventaris}"?`,
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await api.delete(`/master-sarana/${item.id}`);
      setNotice("Master Sarana Inventaris berhasil dihapus.");

      await fetchItems();
      await onChanged?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menghapus master sarana inventaris.",
      );
    }
  }

  const firstItem = items.length === 0 ? 0 : (page - 1) * ITEMS_PER_PAGE + 1;
  const lastItem = Math.min(page * ITEMS_PER_PAGE, items.length);

  const fetchHeaderImage = useCallback(async () => {
    try {
      const response = await api.get("/master-sarana/header");
      const url = response.data.data?.url;

      if (url) {
        setHeaderImage(`${url}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Gagal mengambil gambar header:", err);
    }
  }, []);

  useEffect(() => {
    fetchHeaderImage();
  }, [fetchHeaderImage]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    setSelectedImage(null);
    setImagePreview("");

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Pilih gambar JPG, JPEG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleImageSubmit(event) {
    event.preventDefault();

    const fileInput = event.currentTarget.querySelector('input[type="file"]');
    const file = selectedImage || fileInput?.files?.[0];

    if (!file) {
      setError("Pilih gambar header terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("header", file);

    setSavingImage(true);
    setError("");
    setNotice("");

    try {
      const response = await api.post("/master-sarana/header", formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      const url = response.data.data?.url;

      if (url) {
        setHeaderImage(`${url}?t=${Date.now()}`);
      } else {
        await fetchHeaderImage();
      }

      setNotice(response.data.message || "Gambar header berhasil diperbarui.");

      setShowImageForm(false);
      setSelectedImage(null);
      setImagePreview("");
    } catch (err) {
      console.error(
        "Gagal mengunggah gambar header:",
        err.response?.data || err,
      );

      setError(
        err.response?.data?.message || "Gagal memperbarui gambar header.",
      );
    } finally {
      setSavingImage(false);
    }
  }

  return (
    <>
      <div className="master-page">
        <div className="page-heading-master">
          <h2>Master Sarana Inventaris</h2>
          <p>Daftar Master Sarana Inventaris</p>
        </div>
        <div className="master-page-heading master-page-heading-actions-only">
          <div className="master-heading-actions">
            <button
              type="button"
              className="btn-warning-custom"
              onClick={() => {
                setError("");
                setSelectedImage(null);
                setImagePreview("");
                setShowImageForm(true);
              }}
            >
              <i className="ti ti-photo-edit" />
              Edit Gambar
            </button>

            <button
              type="button"
              className="btn-primary-custom"
              onClick={() => onCreate?.()}
            >
              <i className="ti ti-plus" />
              Tambah
            </button>
          </div>
        </div>

        <div className="master-kop-wrapper">
          <img
            src={headerImage}
            alt="Kop daftar sarana inventaris PT Mahkota Tri Angjaya"
            className="master-kop"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>

        {notice && (
          <div className="alert-custom alert-success" role="status">
            <i className="ti ti-circle-check" />
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}

        {error && !showImageForm && (
          <div className="alert-custom alert-danger" role="alert">
            <i className="ti ti-alert-circle" />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

        <section className="content-card master-laravel-card">
          <div className="content-card-header master-laravel-header">
            <form className="master-search" onSubmit={handleSearch}>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari Sarana..."
                aria-label="Cari sarana inventaris"
              />

              <button type="submit" className="btn-primary-custom">
                Cari
              </button>

              <button
                type="button"
                className="btn-outline-custom"
                onClick={handleReset}
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <div className="empty-state">Memuat data master sarana...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-category" />
              <strong>Tidak ada data sarana inventaris.</strong>
              <span>
                {search
                  ? "Coba kata kunci pencarian yang lain."
                  : "Tambahkan data sarana inventaris untuk memulai."}
              </span>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="inventory-table master-laravel-table">
                  <thead>
                    <tr>
                      <th className="master-number-column">No</th>
                      <th>Nama Sarana Inventaris</th>
                      <th className="text-center master-count-column">
                        Jumlah Sarana
                      </th>
                      <th className="text-center master-action-column">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleItems.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>

                        <td>{item.nama_sarana_inventaris}</td>

                        <td className="text-center">
                          {Number(item.jumlah_inventaris || 0)} Sarana
                        </td>

                        <td className="text-center">
                          <div className="row-actions justify-center">
                            <button
                              type="button"
                              className="btn-icon-action"
                              onClick={() => onDetail?.(item.id)}
                              title="Lihat detail"
                              aria-label={`Lihat detail ${item.nama_sarana_inventaris}`}
                            >
                              <i className="ti ti-eye" />
                            </button>

                            <button
                              type="button"
                              className="btn-icon-action edit"
                              onClick={() => onEdit?.(item.id)}
                              title="Edit"
                              aria-label={`Edit ${item.nama_sarana_inventaris}`}
                            >
                              <i className="ti ti-edit" />
                            </button>

                            <button
                              type="button"
                              className="btn-icon-action delete"
                              onClick={() => handleDelete(item)}
                              title="Hapus"
                              aria-label={`Hapus ${item.nama_sarana_inventaris}`}
                            >
                              <i className="ti ti-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="master-pagination">
                <div className="master-pagination-info">
                  Showing <strong>{firstItem}</strong> to{" "}
                  <strong>{lastItem}</strong> of <strong>{items.length}</strong>{" "}
                  results
                </div>

                {totalPages > 1 && (
                  <div className="master-pagination-nav">
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={page === 1}
                      onClick={() => setPage((current) => current - 1)}
                      aria-label="Halaman sebelumnya"
                    >
                      ‹
                    </button>

                    {Array.from(
                      { length: totalPages },
                      (_, index) => index + 1,
                    ).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`pagination-btn ${
                          pageNumber === page ? "active" : ""
                        }`}
                        onClick={() => setPage(pageNumber)}
                        aria-current={pageNumber === page ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      aria-label="Halaman berikutnya"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {showImageForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !savingImage) {
              setShowImageForm(false);
              setSelectedImage(null);
              setImagePreview("");
              setError("");
            }
          }}
        >
          <section
            className="form-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-form-title"
          >
            <div className="form-heading">
              <div>
                <span className="form-eyebrow">PENGATURAN HEADER</span>
                <h2 id="image-form-title">Edit Gambar Header</h2>
              </div>

              <button
                type="button"
                className="close-button"
                disabled={savingImage}
                onClick={() => {
                  setShowImageForm(false);
                  setSelectedImage(null);
                  setImagePreview("");
                  setError("");
                }}
                aria-label="Tutup form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleImageSubmit}>
              <div className="form-grid">
                <label className="full-width">
                  Pilih Gambar Header
                  <span className="required">*</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    required
                  />
                  <small>
                    Format JPG, JPEG, PNG, atau WEBP. Maksimal 2 MB.
                  </small>
                </label>

                {imagePreview && (
                  <div className="full-width">
                    <p>Pratinjau gambar baru:</p>
                    <img
                      src={imagePreview}
                      alt="Pratinjau gambar header"
                      style={{
                        display: "block",
                        width: "100%",
                        maxHeight: 180,
                        objectFit: "contain",
                        border: "1px solid #e5e7eb",
                        borderRadius: 6,
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div className="full-width master-form-error" role="alert">
                    {error}
                  </div>
                )}
              </div>

              <div className="form-footer">
                <button
                  type="button"
                  className="btn-outline-custom"
                  disabled={savingImage}
                  onClick={() => {
                    setShowImageForm(false);
                    setSelectedImage(null);
                    setImagePreview("");
                    setError("");
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn-primary-custom"
                  disabled={savingImage || !selectedImage}
                >
                  {savingImage ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
