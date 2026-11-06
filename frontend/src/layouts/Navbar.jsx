import { useState } from "react";

export default function Navbar({
  onToggleSidebar,
  pageTitle = "Sistem Sarana Inventaris",
  username = "admin",
  onLogout,
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  const initial = username?.charAt(0)?.toUpperCase() || "A";

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

        <div className="navbar-title-main">{pageTitle}</div>

        <div className="navbar-profile">
          <button
            type="button"
            className="navbar-profile-trigger"
            onClick={() => setProfileOpen((open) => !open)}
            aria-expanded={profileOpen}
            aria-label="Buka menu profil"
          >
            <span className="navbar-profile-avatar">{initial}</span>

            <span className="navbar-profile-info">
              <span className="navbar-profile-name">{username}</span>
              <span className="navbar-profile-role">Administrator</span>
            </span>

            <i
              className={`ti ${
                profileOpen ? "ti-chevron-up" : "ti-chevron-down"
              } navbar-profile-chevron`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <>
              <button
                type="button"
                className="navbar-dropdown-backdrop"
                aria-label="Tutup menu profil"
                onClick={() => setProfileOpen(false)}
              />

              <div className="navbar-profile-dropdown">
                <div className="navbar-dropdown-user">
                  <span className="navbar-profile-avatar">{initial}</span>

                  <span className="navbar-profile-info">
                    <span className="navbar-profile-name">{username}</span>
                    <span className="navbar-profile-role">Administrator</span>
                  </span>
                </div>

                <div className="navbar-dropdown-divider" />

                <button
                  type="button"
                  className="navbar-dropdown-logout"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                >
                  <i className="ti ti-logout" aria-hidden="true" />
                  <span>Keluar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
