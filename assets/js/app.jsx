// ============================================================
// SerieVault — App Root (Roteamento + Estado Global)
// ============================================================

const { useState, useEffect, useCallback, createContext, useContext, useRef } = React;

// ── API Helper ─────────────────────────────────────────────
const API_BASE = '/serievault/api';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Erro desconhecido');
  return data;
}

// ── Context ────────────────────────────────────────────────
const AppContext = createContext(null);
function useApp() { return useContext(AppContext); }

// ── Toast System ───────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Status Labels ──────────────────────────────────────────
const STATUS_CONFIG = {
  watching:      { label: 'Assistindo',        emoji: '⏳', color: '#2563eb' },
  watched:       { label: 'Assistido',         emoji: '✔️', color: '#16a34a' },
  plan_to_watch: { label: 'Pretendo Assistir', emoji: '📌', color: '#d97706' },
  dropped:       { label: 'Abandonado',        emoji: '❌', color: '#dc2626' },
  favorite:      { label: 'Favorito',          emoji: '⭐', color: '#db2777' },
};

// ── Main App ───────────────────────────────────────────────
function App() {
  const [page, setPage]         = useState('home');      // home | explore | mylist | favorites | detail
  const [detailId, setDetailId] = useState(null);
  const [user, setUser]         = useState(null);
  const [toasts, setToasts]     = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [myShows, setMyShows]   = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Toast ───────────────────────────────────────────────
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  // ── Auth ────────────────────────────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      const data = await api('/auth/me');
      setUser(data.user || null);
    } catch { setUser(null); }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
      setUser(null);
      setMyShows([]);
      toast('Logout realizado.', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }, [toast]);

  // ── My Shows ────────────────────────────────────────────
  const fetchMyShows = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api('/user/shows');
      setMyShows(Array.isArray(data) ? data : []);
    } catch { setMyShows([]); }
  }, [user]);

  const saveShow = useCallback(async (show, status) => {
    if (!user) { setShowAuth(true); return; }
    try {
      const payload = {
        tvmaze_id:   show.id,
        show_title:  show.name,
        show_type:   show.type || 'Scripted',
        poster_url:  show.image?.medium || show.image?.original || null,
        genres:      (show.genres || []).join(', '),
        premiere:    show.premiered ? show.premiered.slice(0, 4) : null,
        status,
        is_favorite: status === 'favorite' ? 1 : 0,
      };
      await api('/user/shows', { method: 'POST', body: JSON.stringify(payload) });
      await fetchMyShows();
      toast(`"${show.name}" adicionado como "${STATUS_CONFIG[status].label}"!`, 'success');
    } catch (e) { toast(e.message, 'error'); }
  }, [user, fetchMyShows, toast]);

  const updateShow = useCallback(async (tvmazeId, updates) => {
    if (!user) { setShowAuth(true); return; }
    try {
      await api(`/user/shows/${tvmazeId}`, { method: 'PUT', body: JSON.stringify(updates) });
      await fetchMyShows();
      if (updates.status) toast(`Status atualizado para "${STATUS_CONFIG[updates.status]?.label}"!`, 'success');
      if ('is_favorite' in updates) toast(updates.is_favorite ? '⭐ Adicionado aos favoritos!' : 'Removido dos favoritos.', 'info');
    } catch (e) { toast(e.message, 'error'); }
  }, [user, fetchMyShows, toast]);

  const removeShow = useCallback(async (tvmazeId, title) => {
    if (!user) return;
    try {
      await api(`/user/shows/${tvmazeId}`, { method: 'DELETE' });
      await fetchMyShows();
      toast(`"${title}" removido da lista.`, 'info');
    } catch (e) { toast(e.message, 'error'); }
  }, [user, fetchMyShows, toast]);

  const getShowStatus = useCallback((tvmazeId) => {
    return myShows.find(s => s.tvmaze_id === tvmazeId || s.tvmaze_id === String(tvmazeId)) || null;
  }, [myShows]);

  // ── Navigate ─────────────────────────────────────────────
  const navigate = useCallback((p, id = null) => {
    setPage(p);
    if (id) setDetailId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ── Initial Load ──────────────────────────────────────────
  useEffect(() => {
    fetchMe();
    // Remove loading screen
    setTimeout(() => window.__removeLoader && window.__removeLoader(), 800);
  }, []);

  useEffect(() => {
    if (user) fetchMyShows();
  }, [user]);

  // ── Context Value ─────────────────────────────────────────
  const ctx = {
    user, setUser, logout,
    page, navigate,
    detailId,
    myShows, fetchMyShows, getShowStatus, saveShow, updateShow, removeShow,
    searchQuery, setSearchQuery,
    toast,
    showAuth, setShowAuth,
    STATUS_CONFIG,
    api,
  };

  return (
    <AppContext.Provider value={ctx}>
      {/* id="root-layout" — layout (flex/block) controlled entirely by CSS */}
      <div id="root-layout">
        {!user ? (
          <div className="auth-fullscreen">
            <div className="auth-fullscreen-inner">
              <div className="auth-brand">
                <span className="auth-brand-cine">CINE</span>
                <div className="auth-brand-icon">
                  <span>▶</span>
                </div>
                <span className="auth-brand-vault">VAULT</span>
              </div>
              <p className="auth-brand-subtitle">
                Entre ou cadastre-se para acessar a plataforma
              </p>
              <AuthModal 
                isGlobal={true}
                onSuccess={(u) => { setUser(u); fetchMyShows(); }}
              />
            </div>
          </div>
        ) : (
          <>
            <Sidebar />
            <div className="main-content">
              <Header />
              <div className="page-content">
                {page === 'home'      && <HomePage />}
                {['explore', 'movies', 'series', 'docs'].includes(page) && <ExplorePage key={page} type={page} />}
                {page === 'mylist'    && <MyListPage />}
                {page === 'watched'   && <MyListPage key="watched" initialStatus="watched" />}
                {page === 'favorites' && <FavoritesPage />}
                {page === 'detail'    && <ShowDetail showId={detailId} />}
                {page === 'ranking'   && <RankingPage />}
                {page === 'profile'   && <ProfilePage />}
              </div>
            </div>
          </>
        )}

        <ToastContainer toasts={toasts} />
      </div>
    </AppContext.Provider>
  );
}

// ── Mount ──────────────────────────────────────────────────
const rootEl = document.getElementById('root');
const reactRoot = ReactDOM.createRoot(rootEl);
reactRoot.render(<App />);
