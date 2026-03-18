import { useEffect, useState } from 'react';
import { createUserByAdmin } from '../lib/auth';
import { profileApi } from '../lib/api';
import { DataTable, PageSection, StatusBadge } from '../components/UI';

const emptyForm = { name: '', password: '' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    const res = await profileApi.list();
    setUsers(res.data || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback('');
    setError('');
    try {
      const response = await createUserByAdmin(form.name, form.password);
      setFeedback(`Usuário criado com sucesso. Login de acesso: ${response.generated_login}`);
      setForm(emptyForm);
      loadData();
    } catch (err) {
      setError(err.message || 'Não foi possível criar o usuário.');
    }
  }

  async function toggleAccess(user) {
    await profileApi.update(user.id, { status: user.status === 'ativo' ? 'inativo' : 'ativo' });
    loadData();
  }

  async function toggleRole(user) {
    await profileApi.update(user.id, { role: user.role === 'admin' ? 'operador' : 'admin' });
    loadData();
  }

  return (
    <div className="page-grid two-columns">
      <PageSection title="Cadastrar usuários do sistema" description="Crie novos acessos com apenas nome e senha, sem sair do app.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Nome do usuário" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {feedback ? <div className="feedback success">{feedback}</div> : null}
          {error ? <div className="feedback error">{error}</div> : null}
          <button className="primary-btn" type="submit">Criar usuário</button>
        </form>
      </PageSection>

      <PageSection title="Acessos cadastrados" description="Controle de administradores e operadores sem apagar histórico.">
        <DataTable
          columns={[
            { key: 'display_name', label: 'Nome' },
            { key: 'username', label: 'Login' },
            { key: 'role', label: 'Perfil', render: (row) => <StatusBadge tone={row.role === 'admin' ? 'warning' : 'success'}>{row.role}</StatusBadge> },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'ativo' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
            {
              key: 'actions',
              label: 'Ações',
              render: (row) => (
                <div className="table-actions">
                  <button className="secondary-btn" onClick={() => toggleRole(row)}>{row.role === 'admin' ? 'Tornar operador' : 'Tornar admin'}</button>
                  <button className="danger-btn" onClick={() => toggleAccess(row)}>{row.status === 'ativo' ? 'Desativar' : 'Ativar'}</button>
                </div>
              ),
            },
          ]}
          rows={users}
        />
      </PageSection>
    </div>
  );
}
