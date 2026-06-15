// ============================================================
// SerieVault — Page: MyList
// ============================================================

function MyListPage({ initialStatus = '' }) {
  const { navigate, user, myShows, updateShow } = useApp();
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [searchLocal, setSearchLocal]   = React.useState('');
  const [statusModalShow, setStatusModalShow] = React.useState(null);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔒</div>
        <div className="empty-state-title">Acesso Restrito</div>
        <div className="empty-state-desc">Você precisa estar logado para acessar sua lista.</div>
      </div>
    );
  }

  // Filter shows locally
  const filteredShows = myShows.filter(saved => {
    if (statusFilter && saved.status !== statusFilter) return false;
    if (searchLocal && !saved.show_title.toLowerCase().includes(searchLocal.toLowerCase())) return false;
    return true;
  });

  const handleSaveStatus = async (show, status, isFav) => {
    await updateShow(show.id, { status, is_favorite: isFav ? 1 : 0 });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Minha Lista</h1>
      </div>

      <FilterBar 
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchLocal={searchLocal}
        onSearch={setSearchLocal}
      />

      <div className="results-count">
        Você tem <span>{filteredShows.length}</span> obras salvas nesta seleção.
      </div>

      {myShows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-title">Sua lista está vazia</div>
          <div className="empty-state-desc">Navegue pelas obras e comece a adicionar à sua lista.</div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('explore')}>
            Explorar Obras
          </button>
        </div>
      ) : filteredShows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Nenhuma obra encontrada</div>
          <div className="empty-state-desc">Tente limpar os filtros para ver toda a sua lista.</div>
        </div>
      ) : (
        <div className="shows-grid">
          {filteredShows.map(saved => {
            // Reconstruct show object for ShowCard
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
