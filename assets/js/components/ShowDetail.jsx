// ============================================================
// SerieVault — Component: ShowDetail
// ============================================================

function ShowDetail({ showId }) {
  const { api, navigate, getShowStatus, STATUS_CONFIG, setShowAuth, user } = useApp();
  const [show, setShow]         = React.useState(null);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState(null);
  const [activeSeason, setActiveSeason] = React.useState(1);
  const [statusModalOpen, setStatusModalOpen] = React.useState(false);

  const saved = getShowStatus(showId);

  React.useEffect(() => {
    let active = true;
    const fetchShow = async () => {
      setLoading(true); setError(null);
      try {
        const data = await api(`/shows/${showId}`);
        if (active) {
          setShow(data);
          const hasSeasons = data._embedded?.seasons?.length > 0;
          if (hasSeasons) {
            // Find the first season number, they aren't always 1, 2, 3...
            setActiveSeason(data._embedded.seasons[0].number || 1);
          }
        }
      } catch (err) { if (active) setError(err.message); }
      finally { if (active) setLoading(false); }
    };
    if (showId) fetchShow();
    return () => { active = false; };
  }, [showId, api]);

  if (loading) {
    return (
      <div className="detail-page" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>Carregando detalhes...</div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="detail-page" style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 18, color: 'var(--text-secondary)' }}>{error || 'Obra não encontrada.'}</div>
        <button className="btn btn-ghost" style={{ marginTop: 24 }} onClick={() => navigate('home')}>
          Voltar ao Início
        </button>
      </div>
    );
  }

  const posterUrl = show.image?.original || show.image?.medium || null;
  const seasons   = show._embedded?.seasons || [];
  const episodes  = show._embedded?.episodes || [];
  
  // Strip HTML tags from synopsis
  const cleanSynopsis = show.summary ? show.summary.replace(/<[^>]+>/g, '') : 'Nenhuma sinopse disponível.';
  const year = show.premiered ? show.premiered.slice(0, 4) : '—';
  const runtime = show.averageRuntime || show.runtime;

  const { saveShow, updateShow } = useApp();

  const handleSaveStatus = async (showData, status, isFav) => {
    if (saved) {
      await updateShow(showData.id, { status, is_favorite: isFav ? 1 : 0 });
    } else {
      await saveShow(showData, status);
      if (isFav) await updateShow(showData.id, { is_favorite: 1 });
    }
  };

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => window.history.back() || navigate('explore')}>
        ← Voltar
      </button>

      {/* Hero Section */}
      <div className="detail-hero">
        {posterUrl ? (
          <img className="detail-poster" src={posterUrl} alt={show.name} />
        ) : (
          <div className="detail-poster-placeholder">🎬</div>
        )}

        <div className="detail-info">
          <h1 className="detail-title">{show.name}</h1>
          
          <div className="detail-meta">
            {saved && (
              <span className={`detail-meta-item`} style={{ background: STATUS_CONFIG[saved.status]?.color, color: '#fff', border: 'none' }}>
                {STATUS_CONFIG[saved.status]?.emoji} {STATUS_CONFIG[saved.status]?.label}
              </span>
            )}
            <span className="detail-meta-item">📅 <strong>{year}</strong></span>
            {runtime && <span className="detail-meta-item">⏱️ <strong>{runtime} min</strong></span>}
            {show.network?.country?.name && <span className="detail-meta-item">🌍 <strong>{show.network.country.name}</strong></span>}
            <span className="detail-meta-item">⭐ <strong>{show.rating?.average || '-'}</strong> / 10</span>
          </div>

          <div className="detail-genres">
            {(show.genres || []).map(g => <span key={g} className="genre-tag">{g}</span>)}
          </div>

          <p className="detail-synopsis">{cleanSynopsis}</p>

          <div className="detail-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => user ? setStatusModalOpen(true) : setShowAuth(true)}
            >
              {saved ? '✏️ Alterar Status' : '+ Adicionar à Lista'}
            </button>
            {saved && (
              <button 
                className="btn btn-ghost"
                onClick={() => updateShow(show.id, { is_favorite: saved.is_favorite ? 0 : 1 })}
              >
                {saved.is_favorite ? '❤️ Remover Favorito' : '🤍 Favoritar'}
              </button>
            )}
            <a 
              href={show.officialSite || `https://www.tvmaze.com/shows/${show.id}`} 
              target="_blank" 
              rel="noreferrer"
              className="btn btn-ghost"
            >
              🌐 Site Oficial
            </a>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes Totals */}
      {seasons.length > 0 && (
        <div className="seasons-section" style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '36px' }}>
          <div className="section-title" style={{ marginBottom: 12 }}>📺 Informações da Série</div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Temporadas:</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)' }}>{seasons.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total de episódios:</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent-light)' }}>{episodes.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <Comments tvmazeId={showId} />

      {/* Status Modal */}
      {statusModalOpen && (
        <StatusModal 
          show={show} 
          onClose={() => setStatusModalOpen(false)} 
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
