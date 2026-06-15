// ============================================================
// SerieVault — Component: Comments
// ============================================================

function Comments({ tvmazeId }) {
  const { user, setShowAuth, api, toast } = useApp();
  const [comments, setComments] = React.useState([]);
  const [content, setContent]   = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const [sending, setSending]   = React.useState(false);

  const fetchComments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api(`/comments/${tvmazeId}`);
      setComments(Array.isArray(data) ? data : []);
    } catch { setComments([]); }
    finally { setLoading(false); }
  }, [tvmazeId]);

  React.useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setShowAuth(true); return; }
    if (!content.trim()) return;
    setSending(true);
    try {
      const comment = await api(`/comments/${tvmazeId}`, {
        method: 'POST',
        body: JSON.stringify({ content: content.trim() }),
      });
      setComments(prev => [comment, ...prev]);
      setContent('');
      toast('Comentário adicionado!', 'success');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSending(false); }
  };

  const handleDelete = async (commentId) => {
    try {
      await api(`/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast('Comentário removido.', 'info');
    } catch (err) { toast(err.message, 'error'); }
  };

  const formatDate = (str) => {
    const d = new Date(str);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="comments-section">
      <div className="section-title">💬 Comentários <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>({comments.length})</span></div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        {user && (
          <div className="comment-avatar" style={{ background: user.avatar_color || '#7c3aed', width: 36, height: 36 }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <textarea
            className="comment-textarea"
            placeholder={user ? 'Compartilhe sua opinião...' : 'Faça login para comentar'}
            value={content}
            onChange={e => setContent(e.target.value)}
            onClick={() => !user && setShowAuth(true)}
            readOnly={!user}
            maxLength={2000}
          />
          {user && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                {content.length}/2000
              </span>
              <button className="btn btn-primary btn-sm" type="submit" disabled={sending || !content.trim()}>
                {sending ? '⏳' : '📤 Enviar'}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments list */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 20 }}>Carregando comentários...</div>
      ) : comments.length === 0 ? (
        <div className="empty-state" style={{ padding: 30 }}>
          <div className="empty-state-icon">💭</div>
          <div className="empty-state-title">Seja o primeiro a comentar!</div>
          <div className="empty-state-desc">Compartilhe sua opinião sobre esta obra.</div>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar" style={{ background: c.avatar_color || '#7c3aed' }}>
                {c.username.charAt(0).toUpperCase()}
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-username">{c.username}</span>
                  <span className="comment-date">{formatDate(c.created_at)}</span>
                  {user && user.id === c.user_id && (
                    <button
                      className="comment-delete"
                      onClick={() => handleDelete(c.id)}
                      title="Excluir comentário"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div className="comment-content">{c.content}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
