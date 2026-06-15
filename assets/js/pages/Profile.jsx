// ============================================================
// SerieVault — Page: Profile
// ============================================================

function ProfilePage() {
  const { user, setUser, api, toast, myShows } = useApp();
  const [profile, setProfile]     = React.useState(null);
  const [stats, setStats]         = React.useState(null);
  const [editing, setEditing]     = React.useState(false);
  const [loading, setLoading]     = React.useState(true);
  const [saving, setSaving]       = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [form, setForm]           = React.useState({ display_name: '', bio: '' });
  const fileInputRef = React.useRef(null);

  // ── Load profile + stats ────────────────────────────────
  React.useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      api('/user/profile').catch(() => null),
      api('/user/stats').catch(() => null),
    ]).then(([prof, st]) => {
      const p = prof?.user || user;
      setProfile(p);
      setForm({ display_name: p.display_name || '', bio: p.bio || '' });
      setStats(st?.stats || null);
      setLoading(false);
    });
  }, [user]);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <div className="empty-state-title">Acesso Restrito</div>
        <div className="empty-state-desc">Você precisa estar logado para ver o perfil.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="profile-loading-spinner" />
        <p>Carregando perfil...</p>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.username || user.username;
  const memberSince = profile?.data_criacao
    ? new Date(profile.data_criacao).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
    : '—';

  // ── Save profile ──────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await api('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(form),
      });
      const updated = data.user;
      setProfile(updated);
      setUser(prev => ({ ...prev, ...updated }));
      setEditing(false);
      toast(data.message || 'Perfil salvo!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar upload ─────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const res = await fetch(`/serievault/api/user/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erro no upload');
      const updated = data.user;
      setProfile(updated);
      setUser(prev => ({ ...prev, ...updated }));
      toast(data.message || 'Avatar atualizado!', 'success');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  // ── Stats cards ───────────────────────────────────────────
  const statCards = [
    { label: 'Salvos',     value: stats?.total_shows   ?? myShows.length, icon: '🎬', color: '#7c3aed' },
    { label: 'Assistidos', value: stats?.watched        ?? 0,              icon: '✅', color: '#16a34a' },
    { label: 'Assistindo', value: stats?.watching       ?? 0,              icon: '⏳', color: '#2563eb' },
    { label: 'Favoritos',  value: stats?.favorite       ?? 0,              icon: '⭐', color: '#db2777' },
    { label: 'Pretendo',   value: stats?.plan_to_watch  ?? 0,              icon: '📌', color: '#d97706' },
    { label: 'Abandonados',value: stats?.dropped        ?? 0,              icon: '❌', color: '#dc2626' },
    { label: 'Comentários',value: stats?.total_comments ?? 0,              icon: '💬', color: '#0891b2' },
  ];

  // Compute percentage for progress ring (watched / total_shows)
  const total = stats?.total_shows || 1;
  const watched = stats?.watched || 0;
  const progress = Math.min(100, Math.round((watched / total) * 100));
  const circumference = 2 * Math.PI * 40; // r=40
  const strokeDash = (progress / 100) * circumference;

  return (
    <div className="profile-page">

      {/* ── Hero Banner ────────────────────────────────────── */}
      <div className="profile-hero">
        <div className="profile-hero-bg" />

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-ring">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="profile-avatar-img"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="profile-avatar-initials"
              style={{ display: profile?.avatar_url ? 'none' : 'flex' }}
            >
              {(profile?.display_name || profile?.username || user.username).charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            className="profile-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            title="Trocar foto de perfil"
          >
            {uploading ? '⏳' : '📷'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Identity */}
        <div className="profile-identity">
          <h1 className="profile-display-name">{displayName}</h1>
          <div className="profile-username">@{profile?.username || user.username}</div>
          <div className="profile-email">✉️ {profile?.email || user.email}</div>
          <div className="profile-since">📅 Membro desde {memberSince}</div>
          {profile?.bio && !editing && (
            <p className="profile-bio">{profile.bio}</p>
          )}
        </div>

        {/* Edit button */}
        <div className="profile-hero-actions">
          {!editing ? (
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              ✏️ Editar Perfil
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '⏳ Salvando...' : '💾 Salvar'}
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setForm({ display_name: profile?.display_name || '', bio: profile?.bio || '' });
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Form ─────────────────────────────────────── */}
      {editing && (
        <div className="profile-edit-card">
          <h3 className="profile-edit-title">✏️ Editar Perfil</h3>
          <div className="profile-edit-fields">
            <div className="profile-edit-field">
              <label htmlFor="prof-display-name">Nome de exibição</label>
              <input
                id="prof-display-name"
                type="text"
                className="search-input"
                maxLength={80}
                placeholder="Como deseja ser chamado?"
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              />
              <span className="profile-char-count">{form.display_name.length}/80</span>
            </div>
            <div className="profile-edit-field">
              <label htmlFor="prof-bio">Bio</label>
              <textarea
                id="prof-bio"
                className="profile-bio-textarea"
                maxLength={500}
                rows={4}
                placeholder="Conte um pouco sobre você..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              />
              <span className="profile-char-count">{form.bio.length}/500</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Progress Ring + Stats ────────────────────────── */}
      <div className="profile-stats-section">
        <div className="profile-progress-card">
          <h3>Progresso Geral</h3>
          <div className="profile-progress-ring-wrap">
            <svg viewBox="0 0 100 100" className="profile-ring-svg">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke="url(#profileGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${strokeDash} ${circumference}`}
                strokeDashoffset={circumference / 4}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
              <defs>
                <linearGradient id="profileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="profile-ring-center">
              <span className="profile-ring-pct">{progress}%</span>
              <span className="profile-ring-label">assistidos</span>
            </div>
          </div>
          <p className="profile-progress-desc">
            {watched} de {stats?.total_shows ?? myShows.length} obras assistidas
          </p>
        </div>

        <div className="profile-stat-cards">
          {statCards.map(sc => (
            <div key={sc.label} className="profile-stat-card" style={{ '--stat-color': sc.color }}>
              <div className="profile-stat-icon">{sc.icon}</div>
              <div className="profile-stat-value">{sc.value}</div>
              <div className="profile-stat-label">{sc.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Saves (last 6) ────────────────────────── */}
      {myShows.length > 0 && (
        <div className="profile-recent-section">
          <h3 className="profile-section-title">📚 Adicionados Recentemente</h3>
          <div className="profile-recent-grid">
            {myShows.slice(0, 6).map(s => (
              <div key={s.tvmaze_id} className="profile-recent-item">
                {s.poster_url ? (
                  <img src={s.poster_url} alt={s.show_title} className="profile-recent-poster" />
                ) : (
                  <div className="profile-recent-poster-placeholder">🎬</div>
                )}
                <div className="profile-recent-info">
                  <div className="profile-recent-title">{s.show_title || 'Título Desconhecido'}</div>
                  <div
                    className="profile-recent-status"
                    style={{ color: `var(--status-${s.status}, #9b9ab0)` }}
                  >
                    {s.status === 'watching'      ? '⏳ Assistindo'
                     : s.status === 'watched'     ? '✅ Assistido'
                     : s.status === 'plan_to_watch'? '📌 Pretendo'
                     : s.status === 'dropped'     ? '❌ Abandonado'
                     : s.status === 'favorite'    ? '⭐ Favorito'
                     : s.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
