// ============================================================
// SerieVault — Component: Header
// ============================================================

function Header() {
  const { searchQuery, setSearchQuery, navigate, setShowAuth, user } = useApp();
  const [local, setLocal] = React.useState(searchQuery);
  const debounceRef = React.useRef(null);

  const handleSearch = (val) => {
    setLocal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(val);
      if (val.trim()) navigate('explore');
    }, 400);
  };

  // Keyboard shortcut Ctrl+K
  React.useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-search')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="header" style={{ justifyContent: 'space-between', padding: '0 32px' }}>
      <div className="search-wrapper" style={{ maxWidth: '600px' }}>
        <span className="search-icon">🔍</span>
        <input 
          id="main-search"
          type="text" 
          className="search-input" 
          placeholder="Buscar filmes..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: 'var(--bg-card)', border: 'none', padding: '12px 14px 12px 42px', borderRadius: '8px' }}
        />
        <div className="header-shortcut" style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)' }}>Ctrl + K</div>
      </div>

      <div className="header-actions">
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 20, cursor: 'pointer', marginRight: '16px' }}>
          🔔
        </button>
        {!user && (
          <button className="btn-login" onClick={() => setShowAuth(true)}>
            Entrar
          </button>
        )}
        {user && (
          <div
            className="user-avatar"
            style={{
              background: user.avatar_url ? 'transparent' : (user.avatar_color || '#7c3aed'),
              width: 36, height: 36,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => navigate('profile')}
            title="Meu Perfil"
          >
            {user.avatar_url
              ? <img src={user.avatar_url} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : user.username.charAt(0).toUpperCase()
            }
          </div>
        )}
      </div>
    </header>
  );
}
