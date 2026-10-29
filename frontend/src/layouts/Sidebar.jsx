
export default function Sidebar({
  menuItems = [],
  activePage,
  onNavigate,
  isOpen = false,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="sidebar-overlay"
          onClick={onClose}
          aria-label="Tutup menu navigasi"
        />
      )}

      <aside
        className={`sidebar-custom ${isOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-logo">
          <a
            href="#dashboard"
            className="sidebar-logo-link"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("dashboard");
            }}
          >
            <img
              src="/images/logo.png"
              alt="Logo perusahaan"
              className="sidebar-company-logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
                const fallback =
                  event.currentTarget.nextElementSibling;

                if (fallback) {
                  fallback.style.display = "block";
                }
              }}
            />

            <span className="logo-fallback">
              PT Mahkota Tri Angjaya
            </span>
          </a>
        </div>

        <nav className="sidebar-nav" aria-label="Navigasi utama">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-link ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => onNavigate(item.id)}
              aria-current={
                activePage === item.id ? "page" : undefined
              }
            >
              <span className="sidebar-icon">
                <i className={item.icon} aria-hidden="true" />
              </span>

              <span className="nav-link-title">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <span className="sidebar-bottom-dot" />
          <span>Sistem Sarana Inventaris</span>
        </div>
      </aside>
    </>
  );
}
