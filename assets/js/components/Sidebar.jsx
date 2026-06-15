// ============================================================
// SerieVault — Component: Sidebar
// ============================================================

function Sidebar() {
  const { page, navigate, user, logout, setShowAuth } = useApp();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { id: 'home',      icon: '🏠', label: 'Início' },
    { id: 'explore',   icon: '🔍', label: 'Explorar' },
    { id: 'movies',    icon: '🎬', label: 'Filmes' },
    { id: 'series',    icon: '📺', label: 'Séries' },
    { id: 'docs',      icon: '🎥', label: 'Documentários' },
  ];

  const listItems = [
    { id: 'mylist',    icon: '🔖', label: 'Minha Lista' },
    { id: 'watched',   icon: '✅', label: 'Assistidos' },
    { id: 'ranking',   icon: '📊', label: 'Ranking' },
    { id: 'profile',   icon: '👤', label: 'Meu Perfil' },
  ];

  const handleNav = (id) => { navigate(id); setOpen(false); };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'none',
          position: 'fixed', top: 14, left: 14,
          zIndex: 150,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '8px 10px',
          color: 'var(--text-primary)',
          fontSize: '18px',
        }}
        id="sidebar-toggle"
      >☰</button>

      <aside className={`sidebar${open ? ' open' : ''}`}>
        {/* Logo - CINE VAULT */}
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '24px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => handleNav('home')}>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '1px' }}>CINE</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(124, 58, 237, 0.5)'
          }}>
            <span style={{ color: '#ffffff', fontSize: '11px', marginLeft: '2px' }}>▶</span>
          </div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#a855f7', letterSpacing: '1px' }}>VAULT</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}${['movies', 'series', 'docs'].includes(item.id) ? ' nav-item-secondary' : ''}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div style={{ height: 16 }} />
          {listItems.map(item => (
            <div
              key={item.id}
              className={`nav-item${page === item.id ? ' active' : ''}`}
              onClick={() => {
                if (!user && item.id !== 'ranking') { setShowAuth(true); return; }
                handleNav(item.id);
              }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* User Profile Card */}
        <div className="sidebar-user">
          {user ? (
            <div className="sidebar-user-card">
              <div
                className="sidebar-user-avatar-wrap"
                onClick={() => handleNav('profile')}
                title="Ver perfil"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="avatar-img-circle"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="avatar-fallback-circle"
                  style={{ display: user.avatar_url ? 'none' : 'flex' }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="sidebar-user-info" onClick={() => handleNav('profile')} style={{ cursor: 'pointer' }}>
                <div className="level-username">{user.display_name || user.username}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>@{user.username}</div>
              </div>
              <button
                className="sidebar-logout-btn"
                onClick={logout}
                title="Sair"
              >⏻</button>
            </div>
          ) : (
            <button className="btn btn-primary btn-full" onClick={() => setShowAuth(true)}>
              Entrar / Cadastrar
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
