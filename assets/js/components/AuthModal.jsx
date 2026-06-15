// ============================================================
// SerieVault — Component: AuthModal (Login + Register)
// ============================================================

function AuthModal({ onClose, onSuccess, isGlobal }) {
  const { api, toast, navigate } = useApp();
  const [tab, setTab]         = React.useState('login');
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState('');

  // Login fields
  const [loginEmail, setLoginEmail]       = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');

  // Register fields
  const [regUsername, setRegUsername]   = React.useState('');
  const [regEmail, setRegEmail]         = React.useState('');
  const [regPassword, setRegPassword]   = React.useState('');
  const [regConfirm, setRegConfirm]     = React.useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      toast(`Bem-vindo(a) de volta, ${data.user.username}!`, 'success');
      navigate('home');
      onSuccess(data.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) { setError('As senhas não coincidem.'); return; }
    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword }),
      });
      toast('Conta criada com sucesso! Você já está logado(a).', 'success');
      navigate('home');
      onSuccess(data.user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // Close on Escape
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const content = (
    <div className={`modal auth-modal ${isGlobal ? 'global' : ''}`} style={isGlobal ? { margin: '0 auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' } : {}}>
      {/* Tabs */}
      <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`}    onClick={() => { setTab('login');    setError(''); }}>Entrar</button>
          <button className={`auth-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Cadastrar</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                className="form-input" type="email" required
                placeholder="seu@email.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input" type="password" required
                placeholder="••••••••"
                value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
              />
            </div>
            {error && <p className="form-error">⚠️ {error}</p>}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '⏳ Entrando...' : '🔐 Entrar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nome de usuário</label>
              <input
                className="form-input" type="text" required
                placeholder="seunome"
                minLength={3} maxLength={50}
                value={regUsername} onChange={e => setRegUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                className="form-input" type="email" required
                placeholder="seu@email.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input" type="password" required
                placeholder="••••••••" minLength={6}
                value={regPassword} onChange={e => setRegPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirmar Senha</label>
              <input
                className="form-input" type="password" required
                placeholder="••••••••"
                value={regConfirm} onChange={e => setRegConfirm(e.target.value)}
              />
            </div>
            {error && <p className="form-error">⚠️ {error}</p>}
            <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? '⏳ Criando conta...' : '✨ Criar Conta'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
          {tab === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button
            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ color: 'var(--accent-light)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
          >
            {tab === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
  );

  if (isGlobal) return content;
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      {content}
    </div>
  );
}
