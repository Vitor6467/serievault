// ============================================================
// SerieVault — Component: FilterBar
// ============================================================

const GENRES = [
  'Action','Adventure','Anime','Comedy','Crime','Documentary',
  'Drama','Family','Fantasy','Horror','Mystery','Romance',
  'Science-Fiction','Thriller','Western',
];

function FilterBar({ statusFilter, onStatusChange, genreFilter, onGenreChange, searchLocal, onSearch }) {
  const statusOptions = [
    { value: '',              label: 'Todos os Status' },
    { value: 'watching',      label: '⏳ Assistindo' },
    { value: 'watched',       label: '✔️ Assistido' },
    { value: 'plan_to_watch', label: '📌 Pretendo Assistir' },
    { value: 'dropped',       label: '❌ Abandonado' },
    { value: 'favorite',      label: '⭐ Favorito' },
  ];

  return (
    <div className="filter-bar">
      {onSearch && (
        <input
          type="text"
          className="form-input"
          style={{ maxWidth: 240, padding: '8px 14px' }}
          placeholder="Filtrar por nome..."
          value={searchLocal}
          onChange={e => onSearch(e.target.value)}
        />
      )}

      {onStatusChange && (
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => onStatusChange(e.target.value)}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="filter-select-arrow">▾</span>
        </div>
      )}

      {onGenreChange && (
        <div className="filter-select-wrapper">
          <select
            className="filter-select"
            value={genreFilter}
            onChange={e => onGenreChange(e.target.value)}
          >
            <option value="">Todos os Gêneros</option>
            {GENRES.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span className="filter-select-arrow">▾</span>
        </div>
      )}
    </div>
  );
}
