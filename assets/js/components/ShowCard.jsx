// ============================================================
// SerieVault — Component: ShowCard
// ============================================================

function ShowCard({ show, onOpenDetail, onOpenStatus }) {
  const { getShowStatus, saveShow, updateShow, user, setShowAuth, STATUS_CONFIG } = useApp();
  const saved = getShowStatus(show.id);
  const [imgError, setImgError] = React.useState(false);

  const posterUrl = show.image?.medium || show.image?.original || null;
  const genres    = (show.genres || []).slice(0, 3).join(', ') || 'Sem gênero';
  const year      = show.premiered ? show.premiered.slice(0, 4) : '—';

  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    if (saved) {
      updateShow(show.id, { is_favorite: saved.is_favorite ? 0 : 1 });
    } else {
      saveShow(show, 'favorite');
    }
  };

  const handleStatusBtn = (e) => {
    e.stopPropagation();
    if (!user) { setShowAuth(true); return; }
    onOpenStatus(show);
  };

  return (
    <div className="show-card" onClick={() => onOpenDetail(show.id)}>
      {/* Status badge */}
      {saved && (
        <span className={`status-badge-corner status-${saved.status}`}>
          {STATUS_CONFIG[saved.status]?.emoji} {STATUS_CONFIG[saved.status]?.label}
        </span>
      )}

      {/* Poster */}
      {posterUrl && !imgError ? (
        <img
          className="show-card-poster"
          src={posterUrl}
          alt={show.name}
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="show-card-poster-placeholder">
          🎬
          <span>{show.name}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="show-card-overlay">
        <div className="show-card-actions">
          <button
            className={`card-action-btn${saved?.is_favorite ? ' active' : ''}`}
            onClick={handleFavorite}
            title={saved?.is_favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            {saved?.is_favorite ? '❤️' : '🤍'}
          </button>
          <button className="card-btn-status" onClick={handleStatusBtn}>
            {saved ? `✏️ ${STATUS_CONFIG[saved.status]?.label}` : '+ Adicionar'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="show-card-info">
        <div className="show-card-title" title={show.name}>{show.name}</div>
        <div className="show-card-year">{year}</div>
        <div className="show-card-genres">{genres}</div>
      </div>
    </div>
  );
}

// ── Skeleton Card ───────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="show-card" style={{ cursor: 'default' }}>
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text-sm" />
    </div>
  );
}
