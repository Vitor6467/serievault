// ============================================================
// SerieVault — Page: Favorites
// ============================================================

function FavoritesPage() {
  const { navigate, user, myShows, updateShow } = useApp();
  const [statusModalShow, setStatusModalShow] = React.useState(null);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <div className="empty-state-title">Acesso Restrito</div>
        <div className="empty-state-desc">Você precisa estar logado para acessar seus favoritos.</div>
      </div>
    );
  }

  const favoriteShows = myShows.filter(s => s.is_favorite);

  const handleSaveStatus = async (show, status, isFav) => {
    await updateShow(show.id, { status, is_favorite: isFav ? 1 : 0 });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⭐ Favoritos</h1>
      </div>

      <div className="results-count" style={{ marginBottom: 24 }}>
        Você marcou <span>{favoriteShows.length}</span> obras como favoritas.
      </div>

      {favoriteShows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">⭐</div>
          <div className="empty-state-title">Nenhum favorito ainda</div>
          <div className="empty-state-desc">Clique no botão de coração nas obras para adicioná-las aqui.</div>
        </div>
      ) : (
        <div className="shows-grid">
          {favoriteShows.map(saved => {
            const showData = {
              id: saved.tvmaze_id,
              name: saved.show_title,
              image: saved.poster_url ? { medium: saved.poster_url } : null,
              genres: saved.genres ? saved.genres.split(', ') : [],
              premiered: saved.premiere ? saved.premiere + '-01-01' : null,
            };

            return (
              <ShowCard 
                key={saved.id} 
                show={showData} 
                onOpenDetail={(id) => navigate('detail', id)}
                onOpenStatus={(s) => setStatusModalShow(s)}
              />
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
