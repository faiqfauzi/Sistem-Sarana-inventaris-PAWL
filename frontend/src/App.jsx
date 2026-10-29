import { useCallback, useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

import MainLayout from "./layouts/MainLayout";
import Sidebar from "./layouts/Sidebar";
import Navbar from "./layouts/Navbar";

import Dashboard from "./pages/Dashboard";

import MasterSarana from "./pages/MasterSarana/MasterSarana";
import DetailMasterSarana from "./pages/MasterSarana/DetailMasterSarana";
import TambahMasterSarana from "./pages/MasterSarana/TambahMasterSarana";
import EditMasterSarana from "./pages/MasterSarana/EditMasterSarana";

import Lokasi from "./pages/Lokasi/Lokasi";
import DetailLokasi from "./pages/Lokasi/DetailLokasi";
import TambahLokasi from "./pages/Lokasi/TambahLokasi";
import EditLokasi from "./pages/Lokasi/EditLokasi";

import PenanggungJawab from "./pages/penanggung-jawab/PenanggungJawab";
import DetailPenanggungJawab from "./pages/penanggung-jawab/DetailPenanggungJawab";
import TambahPenanggungJawab from "./pages/penanggung-jawab/TambahPenanggungJawab";
import EditPenanggungJawab from "./pages/penanggung-jawab/EditPenanggungJawab";

import Inventaris from "./pages/SaranaInventaris/Inventaris";
import TambahInventaris from "./pages/SaranaInventaris/TambahInventaris";
import EditInventaris from "./pages/SaranaInventaris/EditInventaris";
import DetailInventaris from "./pages/DetailInventaris";

import Laporan from "./pages/Laporan/Laporan";

const initialStats = {
  masterSaranaInventaris: 0,
  totalInventaris: 0,
  lokasi: 0,
  penanggungJawab: 0,
};

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "ti ti-layout-dashboard",
  },
  {
    id: "master",
    label: "Master Sarana Inventaris",
    icon: "ti ti-category",
  },
  {
    id: "inventaris",
    label: "Data Sarana Inventaris",
    icon: "ti ti-package",
  },
  {
    id: "lokasi",
    label: "Lokasi",
    icon: "ti ti-map-pin",
  },
  {
    id: "penanggung-jawab",
    label: "Penanggung Jawab",
    icon: "ti ti-users",
  },
  {
    id: "laporan",
    label: "Laporan",
    icon: "ti ti-report-analytics",
  },
  {
    id: "akun",
    label: "Manajemen Akun",
    icon: "ti ti-user-cog",
  },
  {
    id: "backup",
    label: "Backup & Restore",
    icon: "ti ti-database",
  },
];

const pageInfo = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Ringkasan data sarana dan inventaris perusahaan.",
  },
  master: {
    title: "Master Sarana Inventaris",
    subtitle: "Daftar Master Sarana Inventaris.",
  },
  inventaris: {
    title: "Data Sarana Inventaris",
    subtitle: "Kelola data inventaris yang tercatat di perusahaan.",
  },
  lokasi: {
    title: "Lokasi",
    subtitle: "Kelola lokasi penyimpanan inventaris perusahaan.",
  },
  "penanggung-jawab": {
    title: "Penanggung Jawab",
    subtitle: "Kelola data penanggung jawab inventaris.",
  },
  laporan: {
    title: "Laporan",
    subtitle: "Lihat dan kelola laporan sarana inventaris.",
  },
  akun: {
    title: "Manajemen Akun",
    subtitle: "Kelola akun pengguna aplikasi.",
  },
  backup: {
    title: "Backup & Restore",
    subtitle: "Kelola pencadangan dan pemulihan data.",
  },
};

const pagePaths = {
  dashboard: "/",
  master: "/master-sarana-inventaris",
  inventaris: "/sarana-inventaris",
  lokasi: "/lokasi",
  "penanggung-jawab": "/penanggung-jawab",
  laporan: "/laporan",
  akun: "/akun",
  backup: "/backup-restore",
};

function getRouteFromPath(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";

  // Dashboard
  if (path === "/") {
    return { page: "dashboard" };
  }

  // =========================
  // SARANA INVENTARIS
  // =========================

  if (path === "/sarana-inventaris") {
    return { page: "inventaris" };
  }

  if (path === "/sarana-inventaris/create") {
    return {
      page: "inventaris",
      inventoryForm: "create",
    };
  }

  const inventoryEdit = path.match(/^\/sarana-inventaris\/(\d+)\/edit$/);

  if (inventoryEdit) {
    return {
      page: "inventaris",
      inventoryForm: "edit",
      editInventoryId: Number(inventoryEdit[1]),
    };
  }

  const inventoryDetail = path.match(/^\/sarana-inventaris\/(\d+)$/);

  if (inventoryDetail) {
    return {
      page: "inventaris",
      detailInventoryId: Number(inventoryDetail[1]),
    };
  }

  // =========================
  // MASTER SARANA
  // =========================

  if (path === "/master-sarana-inventaris") {
    return { page: "master" };
  }

  if (path === "/master-sarana-inventaris/create") {
    return {
      page: "master",
      masterForm: "create",
    };
  }

  const masterEdit = path.match(/^\/master-sarana-inventaris\/(\d+)\/edit$/);

  if (masterEdit) {
    return {
      page: "master",
      masterForm: "edit",
      editMasterId: Number(masterEdit[1]),
    };
  }

  const masterDetail = path.match(/^\/master-sarana-inventaris\/(\d+)$/);

  if (masterDetail) {
    return {
      page: "master",
      detailMasterId: Number(masterDetail[1]),
    };
  }

  // =========================
  // LOKASI
  // =========================

  // Daftar lokasi
  if (path === "/lokasi") {
    return {
      page: "lokasi",
      locationForm: null,
      locationId: null,
    };
  }

  // Tambah lokasi
  if (path === "/lokasi/create") {
    return {
      page: "lokasi",
      locationForm: "create",
      locationId: null,
    };
  }

  // Edit lokasi
  const locationEdit = path.match(/^\/lokasi\/(\d+)\/edit$/);

  if (locationEdit) {
    return {
      page: "lokasi",
      locationForm: "edit",
      locationId: Number(locationEdit[1]),
    };
  }

  // Detail lokasi
  const locationDetail = path.match(/^\/lokasi\/(\d+)$/);

  if (locationDetail) {
    return {
      page: "lokasi",
      locationForm: null,
      locationId: Number(locationDetail[1]),
    };
  }

  // =========================
  // PENANGGUNG JAWAB
  // =========================

  if (path === "/penanggung-jawab") {
    return { page: "penanggung-jawab" };
  }

  if (path === "/penanggung-jawab/create") {
    return {
      page: "penanggung-jawab",
      responsibleForm: "create",
    };
  }

  const responsibleEdit = path.match(/^\/penanggung-jawab\/(\d+)\/edit$/);

  if (responsibleEdit) {
    return {
      page: "penanggung-jawab",
      responsibleForm: "edit",
      editResponsibleId: Number(responsibleEdit[1]),
    };
  }

  const responsibleDetail = path.match(/^\/penanggung-jawab\/(\d+)$/);

  if (responsibleDetail) {
    return {
      page: "penanggung-jawab",
      detailResponsibleId: Number(responsibleDetail[1]),
    };
  }

  if (path === "/laporan") {
    return { page: "laporan" };
  }

  // =========================
  // HALAMAN LAIN
  // =========================

  const routes = {
    "/laporan": "laporan",
    "/akun": "akun",
    "/backup-restore": "backup",
  };

  return {
    page: routes[path] || "dashboard",
  };
}

function PlaceholderPage({ title }) {
  return (
    <div className="page-content">
      <div className="card">
        <h3>{title}</h3>
        <p>Halaman ini belum tersedia.</p>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(() =>
    getRouteFromPath(window.location.pathname),
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const page = route.page;
  const detailMasterId = route.detailMasterId ?? null;
  const detailInventoryId = route.detailInventoryId ?? null;

  const currentPage = pageInfo[page] || pageInfo.dashboard;

  const fetchDashboard = useCallback(async () => {
    try {
      setLoadingStats(true);
      setDashboardError("");

      const response = await api.get("/dashboard");
      const data = response.data?.data ?? response.data;

      setStats({
        masterSaranaInventaris:
          data?.masterSaranaInventaris ?? data?.totalMasterSarana ?? 0,
        totalInventaris: data?.totalInventaris ?? data?.total_inventaris ?? 0,
        lokasi: data?.lokasi ?? data?.totalLokasi ?? 0,
        penanggungJawab:
          data?.penanggungJawab ?? data?.totalPenanggungJawab ?? 0,
      });
    } catch (error) {
      console.error("Gagal mengambil statistik dashboard:", error);
      setDashboardError("Statistik dashboard gagal dimuat.");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromPath(window.location.pathname));
      setSidebarOpen(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback((pageId) => {
    const path = pagePaths[pageId] || "/";

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  // Navigasi master sarana
  const openMasterCreate = useCallback(() => {
    const path = "/master-sarana-inventaris/create";

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openMasterEdit = useCallback((id) => {
    const path = `/master-sarana-inventaris/${id}/edit`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openMasterDetail = useCallback((id) => {
    const path = `/master-sarana-inventaris/${id}`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const goBackToMaster = useCallback(() => {
    navigate("master");
  }, [navigate]);

  // Navigasi inventaris
  const openInventoryCreate = useCallback(() => {
    const path = "/sarana-inventaris/create";

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openInventoryEdit = useCallback((id) => {
    const path = `/sarana-inventaris/${id}/edit`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openInventoryDetail = useCallback((id) => {
    if (id == null) {
      console.error("ID inventaris tidak ditemukan.");
      return;
    }

    const path = `/sarana-inventaris/${id}`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const goBackToInventory = useCallback(() => {
    navigate("inventaris");
  }, [navigate]);

  // Navigasi lokasi
  const openLocationCreate = () => {
    const path = "/lokasi/create";
    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  };

  const openLocationEdit = (id) => {
    const path = `/lokasi/${id}/edit`;
    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  };

  const openLocationDetail = (id) => {
    const path = `/lokasi/${id}`;
    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  };

  const goBackToLocation = () => {
    const path = "/lokasi";
    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  };

  // Navigasi penanggung jawab
  const openResponsibleCreate = useCallback(() => {
    const path = "/penanggung-jawab/create";

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openResponsibleEdit = useCallback((id) => {
    const path = `/penanggung-jawab/${id}/edit`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const openResponsibleDetail = useCallback((id) => {
    const path = `/penanggung-jawab/${id}`;

    window.history.pushState({}, "", path);
    setRoute(getRouteFromPath(path));
    setSidebarOpen(false);
  }, []);

  const goBackToResponsible = useCallback(() => {
    navigate("penanggung-jawab");
  }, [navigate]);

  return (
    <MainLayout>
      <div className="app-container">
        <Sidebar
          menuItems={menuItems}
          activePage={page}
          onNavigate={navigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="main-content">
          <Navbar
            title={currentPage.title}
            subtitle={currentPage.subtitle}
            onMenuClick={() => setSidebarOpen((previous) => !previous)}
          />

          <main className="page-container">
            {page === "dashboard" && (
              <Dashboard
                stats={stats}
                loading={loadingStats}
                error={dashboardError}
                onRefresh={fetchDashboard}
              />
            )}

            {page === "master" &&
              (route.masterForm === "create" ? (
                <TambahMasterSarana
                  onBack={goBackToMaster}
                  onSaved={fetchDashboard}
                />
              ) : route.masterForm === "edit" && route.editMasterId != null ? (
                <EditMasterSarana
                  id={route.editMasterId}
                  onBack={goBackToMaster}
                  onSaved={fetchDashboard}
                />
              ) : detailMasterId !== null ? (
                <DetailMasterSarana
                  id={detailMasterId}
                  onBack={goBackToMaster}
                  onDetailInventaris={openInventoryDetail}
                />
              ) : (
                <MasterSarana
                  onChanged={fetchDashboard}
                  onDetail={openMasterDetail}
                  onCreate={openMasterCreate}
                  onEdit={openMasterEdit}
                />
              ))}

            {page === "inventaris" &&
              (route.inventoryForm === "create" ? (
                <TambahInventaris
                  onBack={goBackToInventory}
                  onSaved={fetchDashboard}
                />
              ) : route.inventoryForm === "edit" &&
                route.editInventoryId != null ? (
                <EditInventaris
                  id={route.editInventoryId}
                  onBack={() => {
                    const path = `/sarana-inventaris/${route.editInventoryId}`;

                    window.history.pushState({}, "", path);
                    setRoute(getRouteFromPath(path));
                    setSidebarOpen(false);
                  }}
                  onSaved={fetchDashboard}
                />
              ) : detailInventoryId !== null ? (
                <DetailInventaris
                  id={detailInventoryId}
                  onBack={goBackToInventory}
                  onEdit={openInventoryEdit}
                />
              ) : (
                <Inventaris
                  onChanged={fetchDashboard}
                  onDetail={openInventoryDetail}
                  onCreate={openInventoryCreate}
                  onEdit={openInventoryEdit}
                />
              ))}

            {page === "lokasi" &&
              (route.locationForm === "create" ? (
                <TambahLokasi
                  onBack={goBackToLocation}
                  onSaved={async () => {
                    await fetchDashboard();
                    const path = "/lokasi";
                    window.history.pushState({}, "", path);
                    setRoute(getRouteFromPath(path));
                    setSidebarOpen(false);
                  }}
                />
              ) : route.locationForm === "edit" && route.locationId != null ? (
                <EditLokasi
                  id={route.locationId}
                  onBack={goBackToLocation}
                  onSaved={async () => {
                    await fetchDashboard();
                    const path = "/lokasi";
                    window.history.pushState({}, "", path);
                    setRoute(getRouteFromPath(path));
                    setSidebarOpen(false);
                  }}
                />
              ) : route.locationId != null ? (
                <DetailLokasi id={route.locationId} onBack={goBackToLocation} />
              ) : (
                <Lokasi
                  onChanged={fetchDashboard}
                  onTambah={openLocationCreate}
                  onDetail={openLocationDetail}
                  onEdit={openLocationEdit}
                />
              ))}

            {page === "penanggung-jawab" &&
              (route.responsibleForm === "create" ? (
                <TambahPenanggungJawab
                  onBack={goBackToResponsible}
                  onSuccess={() => {
                    fetchDashboard();
                    navigate("penanggung-jawab");
                  }}
                />
              ) : route.responsibleForm === "edit" &&
                route.editResponsibleId != null ? (
                <EditPenanggungJawab
                  id={route.editResponsibleId}
                  onBack={goBackToResponsible}
                  onSuccess={() => {
                    fetchDashboard();
                    navigate("penanggung-jawab");
                  }}
                />
              ) : route.detailResponsibleId != null ? (
                <DetailPenanggungJawab
                  id={route.detailResponsibleId}
                  onBack={goBackToResponsible}
                  onDetailInventaris={openInventoryDetail}
                />
              ) : (
                <PenanggungJawab
                  onTambah={openResponsibleCreate}
                  onDetail={openResponsibleDetail}
                  onEdit={openResponsibleEdit}
                />
              ))}

            {page === "laporan" && <Laporan />}

            {page === "akun" && <PlaceholderPage title="Manajemen Akun" />}

            {page === "backup" && <PlaceholderPage title="Backup & Restore" />}
          </main>
        </div>
      </div>
    </MainLayout>
  );
}
