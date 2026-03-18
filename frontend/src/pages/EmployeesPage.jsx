import { useEffect, useState } from 'react';
import { employeeApi } from '../lib/api';
import { DataTable, PageSection, StatusBadge } from '../components/UI';

const emptyForm = { name: '', role: '', phone: '', start_date: '', status: 'ativo' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    const response = await employeeApi.list();
    setEmployees(response.data || []);
  };

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await employeeApi.create(form);
    setForm(emptyForm);
    loadData();
  }

  async function toggleStatus(employee) {
    await employeeApi.update(employee.id, { status: employee.status === 'ativo' ? 'inativo' : 'ativo' });
    loadData();
  }

  return (
    <div className="page-grid two-columns">
      <PageSection title="Cadastrar funcionário" description="Desative sem apagar o histórico operacional.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Cargo/Função" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          <input placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
          <button className="primary-btn" type="submit">Salvar funcionário</button>
        </form>
      </PageSection>

      <PageSection title="Equipe cadastrada" description="Histórico preservado mesmo em caso de desligamento.">
        <DataTable
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'role', label: 'Cargo' },
            { key: 'phone', label: 'Telefone' },
            { key: 'start_date', label: 'Admissão' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'ativo' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
            { key: 'actions', label: 'Ações', render: (row) => <button className="secondary-btn" onClick={() => toggleStatus(row)}>{row.status === 'ativo' ? 'Desativar' : 'Reativar'}</button> },
          ]}
          rows={employees}
        />
      </PageSection>
    </div>
  );
}
