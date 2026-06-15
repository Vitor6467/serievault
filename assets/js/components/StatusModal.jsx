// ============================================================
// SerieVault — Component: StatusModal
// ============================================================

function StatusModal({ show, onClose, onSave }) {
  const { getShowStatus, removeShow, STATUS_CONFIG } = useApp();
  const saved = getShowStatus(show.id);
  const [selected, setSelected] = React.useState(saved?.status || 'plan_to_watch');
  const [isFav, setIsFav]       = React.useState(!!saved?.is_favorite);
  const [loading, setLoading]   = React.useState(false);

  const statuses = [
    { key: 'watching',      ...STATUS_CONFIG.watching      },
    { key: 'watched',       ...STATUS_CONFIG.watched       },
    { key: 'plan_to_watch', ...STATUS_CONFIG.plan_to_watch },
    { key: 'dropped',       ...STATUS_CONFIG.dropped       },
    { key: 'favorite',      ...STATUS_CONFIG.favorite      },
  ];

  const handleSave = async () => {
    setLoading(true);
    await onSave(show, selected, isFav);
    setLoading(false);
    onClose();
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeShow(show.id, show.name);
    setLoading(false);
    onClose();
  };

  // Close on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">
          🎬 {show.name}
        </div>

        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          Selecione o status desta obra:
        </p>

        <div className="status-options">
          {statuses.map(s => (
            <button
              key={s.key}
              className={`status-option${selected === s.key ? ' selected' : ''}`}
              onClick={() => setSelected(s.key)}
            >
              <span className="status-option-emoji">{s.emoji}</span>
              <span>{s.label}</span>
              {selected === s.key && <span style={{ marginLeft: 'auto', color: 'var(--accent-light)' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Favorite toggle */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', padding: '10px 0',
          borderTop: '1px solid var(--border)',
          marginTop: 4,
        }}>
          <input
            type="checkbox"
            checked={isFav}
            onChange={e => setIsFav(e.target.checked)}
            style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>⭐ Marcar como Favorito</span>
        </label>

        <div className="modal-actions">
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>Cancelar</button>
          {saved && (
            <button className="btn btn-danger btn-sm" onClick={handleRemove} disabled={loading}>
              🗑️ Remover
            </button>
          )}
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleSave} disabled={loading}>
            {loading ? '⏳ Salvando...' : '💾 Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
