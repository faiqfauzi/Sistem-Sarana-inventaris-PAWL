
export default function Navbar({
  onToggleSidebar,
  pageTitle = "Dashboard",
}) {
  return (
    <header className="navbar-custom">
      <div className="navbar-inner">
        <button
          type="button"
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Buka atau tutup menu"
        >
          <i className="ti ti-menu-2" aria-hidden="true" />
        </button>

        <div className="navbar-title-main">
          Sistem Sarana Inventaris
        </div>

        <div className="navbar-account">
          <div
            className="navbar-user-avatar"
            title="Pengguna"
            aria-label="Pengguna"
          >
            <i className="ti ti-user" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
}
