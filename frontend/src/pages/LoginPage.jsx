import { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { bootstrapAdmin, signInWithName } from '../lib/auth';
import { profileApi } from '../lib/api';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [bootstrapAllowed, setBootstrapAllowed] = useState(false);
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    profileApi.bootstrapStatus().then((res) => setBootstrapAllowed(Boolean(res.data)));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'bootstrap') {
        await bootstrapAdmin(form.name, form.password);
        setMessage('Administrador criado. Faça o login com o mesmo nome e senha.');
        setMode('login');
      } else {
        await signInWithName(form.name, form.password);
      }
    } catch (err) {
      setError(err.message || 'Não foi possível continuar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card auth-branding">
        <div className="brand-icon"><ShieldCheck size={34} /></div>
        <span className="eyebrow">Vital Tec</span>
        <h1>Controle premium de estoque e responsabilidade</h1>
        <p>Gerencie equipamentos, produtos, reparos, entregas e assinaturas em um único sistema.</p>
        <div className="auth-pills">
          <span>Login seguro</span>
          <span>Usuários por perfil</span>
          <span>Rastreabilidade completa</span>
        </div>
      </div>

      <div className="auth-card">
        <div className="panel-header compact">
          <div>
            <span className="eyebrow">Acesso ao sistema</span>
            <h3>{mode === 'bootstrap' ? 'Criar administrador inicial' : 'Entrar no sistema'}</h3>
            <p>{mode === 'bootstrap' ? 'Use essa opção apenas no primeiro acesso.' : 'Entre com nome de acesso e senha.'}</p>
          </div>
          <div className="auth-lock"><LockKeyhole size={20} /></div>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <input
            placeholder="Nome de acesso"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error ? <div className="feedback error">{error}</div> : null}
          {message ? <div className="feedback success">{message}</div> : null}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Processando...' : mode === 'bootstrap' ? 'Criar administrador' : 'Entrar'}
          </button>
        </form>

        {bootstrapAllowed ? (
          <button type="button" className="text-btn" onClick={() => setMode(mode === 'login' ? 'bootstrap' : 'login')}>
            {mode === 'login' ? 'Primeiro acesso? Criar administrador inicial' : 'Voltar para o login'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
