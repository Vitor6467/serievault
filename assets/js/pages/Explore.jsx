// ============================================================
// SerieVault — Page: Explore
// ============================================================

const GENRES_MAP = [
  { value: 'Action',          label: 'Ação' },
  { value: 'Adventure',       label: 'Aventura' },
  { value: 'Anime',           label: 'Anime' },
  { value: 'Comedy',          label: 'Comédia' },
  { value: 'Crime',           label: 'Policial' },
  { value: 'Documentary',     label: 'Documentário' },
  { value: 'Drama',           label: 'Drama' },
  { value: 'Family',          label: 'Família' },
  { value: 'Fantasy',         label: 'Fantasia' },
  { value: 'Horror',          label: 'Terror' },
  { value: 'Mystery',         label: 'Mistério' },
  { value: 'Romance',         label: 'Romance' },
  { value: 'Science-Fiction', label: 'Ficção Científica' },
  { value: 'Thriller',        label: 'Suspense' },
  { value: 'Western',         label: 'Faroeste' }
];

function ExplorePage({ type = 'explore' }) {
  const { api, searchQuery, navigate, myShows, saveShow, updateShow } = useApp();
  const [shows, setShows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [statusModalShow, setStatusModalShow] = React.useState(null);

  // Tabs
  const [activeTab, setActiveTab] = React.useState('todos'); // todos | favorites | completed

  // Custom Filters
  const [genre, setGenre] = React.useState('');
  const [decade, setDecade] = React.useState('');
  const [year, setYear] = React.useState('');
  const [rating, setRating] = React.useState('');
  const [sortBy, setSortBy] = React.useState('recent');
  
  // View mode
  const [viewMode, setViewMode] = React.useState('grid'); // grid | list

  React.useEffect(() => {
    let active = true;
    const fetchExplore = async () => {
      setLoading(true);
      try {
        let url = `/shows/search`;
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        
        const qs = params.toString();
        if (qs) url += `?${qs}`;

        const data = await api(url);
        if (active) setShows(data || []);
      } catch (err) { console.error(err); }
      finally { if (active) setLoading(false); }
    };
    fetchExplore();
    return () => { active = false; };
  }, [api, searchQuery]);

  const handleSaveStatus = async (show, status, isFav) => {
    const saved = myShows.find(s => s.tvmaze_id == show.id);
    if (saved) {
      await updateShow(show.id, { status, is_favorite: isFav ? 1 : 0 });
    } else {
      await saveShow(show, status);
      if (isFav) await updateShow(show.id, { is_favorite: 1 });
    }
  };

  const getCustomType = (show) => {
    const genres = show.genres || [];
    if (genres.includes('Documentary') || show.type === 'Documentary') {
      return 'documentario';
    }
    return show.id % 2 === 0 ? 'filme' : 'serie';
  };

  const clearFilters = () => {
    setGenre('');
    setDecade('');
    setYear('');
    setRating('');
    setSortBy('recent');
  };

  // Local filtering logic
  const filteredShows = React.useMemo(() => {
    let res = [...shows];

    // 1. Page Type filter
    if (type === 'movies') {
      res = res.filter(s => getCustomType(s) === 'filme');
    } else if (type === 'series') {
      res = res.filter(s => getCustomType(s) === 'serie');
    } else if (type === 'docs') {
      res = res.filter(s => getCustomType(s) === 'documentario');
    }

    // 2. Sub-tab filter (Todos, Meus Favoritos, Concluídos)
    if (activeTab === 'favorites') {
      res = res.filter(s => {
        const saved = myShows.find(ms => ms.tvmaze_id == s.id);
        return saved && saved.is_favorite == 1;
      });
    } else if (activeTab === 'completed') {
      res = res.filter(s => {
        const saved = myShows.find(ms => ms.tvmaze_id == s.id);
        return saved && saved.status === 'watched';
      });
    }

    // 3. Genre filter
    if (genre) {
      res = res.filter(s => (s.genres || []).includes(genre));
    }

    // 4. Decade filter
    if (decade) {
      res = res.filter(s => {
        if (!s.premiered) return false;
        const yr = parseInt(s.premiered.slice(0, 4));
        if (decade === '2020') return yr >= 2020;
        if (decade === '2010') return yr >= 2010 && yr < 2020;
        if (decade === '2000') return yr >= 2000 && yr < 2010;
        if (decade === '1990') return yr >= 1990 && yr < 2000;
        if (decade === '1980') return yr >= 1980 && yr < 1990;
        return true;
      });
    }

    // 5. Year filter
    if (year) {
      res = res.filter(s => s.premiered && s.premiered.startsWith(year));
    }

    // 6. Rating filter
    if (rating) {
      const minR = parseFloat(rating);
      res = res.filter(s => s.rating && s.rating.average >= minR);
    }

    // 7. Sort
    res.sort((a, b) => {
      if (sortBy === 'recent') {
        return (b.premiered || '').localeCompare(a.premiered || '');
      }
      if (sortBy === 'oldest') {
        return (a.premiered || '').localeCompare(b.premiered || '');
      }
      if (sortBy === 'rating') {
        return (b.rating?.average || 0) - (a.rating?.average || 0);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return res;
  }, [shows, type, activeTab, genre, decade, year, rating, sortBy, myShows]);

  // Page title
  const pageTitle = type === 'movies' ? 'Filmes' : type === 'series' ? 'Séries' : type === 'docs' ? 'Documentários' : 'Explorar Obras';

  // Generate years list (from 2026 down to 1980)
  const years = [];
  for (let y = 2026; y >= 1980; y--) {
    years.push(String(y));
  }

  return (
    <div>
      {/* Title */}
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">{pageTitle}</h1>
      </div>

      {/* Tabs (Todos, Meus Favoritos, Concluídos) */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px', paddingBottom: '0' }}>
        <button onClick={() => setActiveTab('todos')} style={{ background: 'none', color: activeTab === 'todos' ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', fontSize: '15px', fontWeight: '600', position: 'relative', paddingBottom: '10px', cursor: 'pointer' }}>
          Todos
          {activeTab === 'todos' && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--accent)' }} />}
        </button>
        <button onClick={() => setActiveTab('favorites')} style={{ background: 'none', color: activeTab === 'favorites' ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', fontSize: '15px', fontWeight: '600', position: 'relative', paddingBottom: '10px', cursor: 'pointer' }}>
          Meus Favoritos
          {activeTab === 'favorites' && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--accent)' }} />}
        </button>
        <button onClick={() => setActiveTab('completed')} style={{ background: 'none', color: activeTab === 'completed' ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', fontSize: '15px', fontWeight: '600', position: 'relative', paddingBottom: '10px', cursor: 'pointer' }}>
          Concluídos
          {activeTab === 'completed' && <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--accent)' }} />}
        </button>
      </div>

      {/* Filter panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Genre */}
          <div className="custom-filter-dropdown">
            <span className="custom-filter-label">Gênero</span>
            <select className="custom-filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
              <option value="">Todos</option>
              {GENRES_MAP.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <span className="custom-filter-arrow">▼</span>
          </div>

          {/* Decade */}
          <div className="custom-filter-dropdown">
            <span className="custom-filter-label">Década</span>
            <select className="custom-filter-select" value={decade} onChange={e => setDecade(e.target.value)}>
              <option value="">Todas</option>
              <option value="2020">Anos 2020</option>
              <option value="2010">Anos 2010</option>
              <option value="2000">Anos 2000</option>
              <option value="1990">Anos 90</option>
              <option value="1980">Anos 80</option>
            </select>
            <span className="custom-filter-arrow">▼</span>
          </div>

          {/* Year */}
          <div className="custom-filter-dropdown">
            <span className="custom-filter-label">Ano</span>
            <select className="custom-filter-select" value={year} onChange={e => setYear(e.target.value)}>
              <option value="">Todos</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="custom-filter-arrow">▼</span>
          </div>

          {/* Rating */}
          <div className="custom-filter-dropdown">
            <span className="custom-filter-label">Classificação</span>
            <select className="custom-filter-select" value={rating} onChange={e => setRating(e.target.value)}>
              <option value="">Todas</option>
              <option value="9">⭐ 9.0+</option>
              <option value="8">⭐ 8.0+</option>
              <option value="7">⭐ 7.0+</option>
              <option value="6">⭐ 6.0+</option>
            </select>
            <span className="custom-filter-arrow">▼</span>
          </div>

          {/* Order by */}
          <div className="custom-filter-dropdown">
            <span className="custom-filter-label">Ordenar por</span>
            <select className="custom-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigas</option>
              <option value="rating">Maior Nota</option>
              <option value="name">Nome (A-Z)</option>
            </select>
            <span className="custom-filter-arrow">▼</span>
          </div>
        </div>

        {/* Clear filters */}
        {(genre || decade || year || rating || sortBy !== 'recent') && (
          <button onClick={clearFilters} className="btn-clear-filters" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '8px 12px'
          }}>
            <span>🔄</span> Limpar filtros
          </button>
        )}
      </div>

      {/* Results and View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{loading ? '...' : filteredShows.length}</span> {type === 'movies' ? 'filmes encontrados' : type === 'series' ? 'séries encontradas' : type === 'docs' ? 'documentários encontrados' : 'obras encontradas'}
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <button onClick={() => setViewMode('grid')} style={{
            background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Grid
          </button>
          <button onClick={() => setViewMode('list')} style={{
            background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
            color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Lista
          </button>
        </div>
      </div>

      {/* Main Grid/List Container */}
      {loading ? (
        <div className="loading-grid">
          {Array(18).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredShows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">Nenhum resultado encontrado</div>
          <div className="empty-state-desc">Tente buscar por termos diferentes ou remover os filtros.</div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="shows-grid">
          {filteredShows.map(show => (
            <ShowCard 
              key={show.id} 
              show={show} 
              onOpenDetail={(id) => navigate('detail', id)}
              onOpenStatus={(s) => setStatusModalShow(s)}
            />
          ))}
        </div>
      ) : (
        <div className="shows-list">
          {filteredShows.map((show, idx) => {
            const posterUrl = show.image?.medium || show.image?.original || null;
            const genres = (show.genres || []).slice(0, 3).join(', ') || 'Sem gênero';
            const year = show.premiered ? show.premiered.slice(0, 4) : '—';
            
            return (
              <div key={show.id} className="show-list-row" onClick={() => navigate('detail', show.id)}>
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
                    <span style={{
                      fontSize: '11px',
                      background: 'rgba(124, 58, 237, 0.15)',
                      color: 'var(--accent-light)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {getCustomType(show) === 'filme' ? 'Filme' : getCustomType(show) === 'documentario' ? 'Doc' : 'Série'}
                    </span>
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
