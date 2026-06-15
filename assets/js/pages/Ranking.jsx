// ============================================================
// SerieVault — Page: Ranking
// ============================================================

function RankingPage() {
  const { api, navigate, myShows, saveShow, updateShow } = useApp();
  const [shows, setShows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusModalShow, setStatusModalShow] = React.useState(null);

  React.useEffect(() => {
    let active = true;
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const data = await api('/shows/search');
        if (active) {
          const sorted = [...data]
            .filter(s => s.rating && s.rating.average)
            .sort((a, b) => b.rating.average - a.rating.average)
            .slice(0, 10);
          setShows(sorted);
        }
      } catch (err) { console.error(err); }
      finally { if (active) setLoading(false); }
    };
    fetchRanking();
    return () => { active = false; };
  }, [api]);

  const handleSaveStatus = async (show, status, isFav) => {
    const saved = myShows.find(s => s.tvmaze_id == show.id);
    if (saved) {
      await updateShow(show.id, { status, is_favorite: isFav ? 1 : 0 });
    } else {
      await saveShow(show, status);
      if (isFav) await updateShow(show.id, { is_favorite: 1 });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👑 Ranking Global</h1>
      </div>

      <div className="results-count" style={{ marginBottom: 24 }}>
        As <span>10 obras</span> mais bem avaliadas da plataforma.
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {shows.map((show, idx) => {
            const posterUrl = show.image?.medium || show.image?.original || null;
            const genres = (show.genres || []).slice(0, 3).join(', ') || 'Sem gênero';
            const year = show.premiered ? show.premiered.slice(0, 4) : '—';
            
            return (
              <div 
                key={show.id} 
                className="show-list-row" 
                onClick={() => navigate('detail', show.id)}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: '900',
                  color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : 'var(--text-muted)',
                  opacity: 0.8,
                  width: '60px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  #{idx + 1}
                </div>

                {posterUrl ? (
                  <img src={posterUrl} className="show-list-poster" alt={show.name} />
                ) : (
                  <div className="show-list-poster" style={{ background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎬</div>
                )}

                <div className="show-list-info">
                  <div className="show-list-title">{show.name}</div>
                  <div className="show-list-meta">
                    <span>📅 {year}</span>
                    <span>⭐ {show.rating?.average || '—'}</span>
                  </div>
                  <div className="show-list-genres">{genres}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setStatusModalShow(show)}
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {statusModalShow && (
        <StatusModal 
          show={statusModalShow} 
          onClose={() => setStatusModalShow(null)} 
          onSave={handleSaveStatus}
        />
      )}
    </div>
  );
}
