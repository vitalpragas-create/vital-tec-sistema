import { useEffect, useState } from 'react';
import { employeeApi, inventoryApi, repairApi } from '../lib/api';
import { DataTable, PageSection, StatusBadge } from '../components/UI';

const emptyForm = {
  inventory_item_id: '',
  employee_id: '',
  sent_for_repair_date: '',
  repair_reason: '',
  return_from_repair_date: '',
  final_return_date: '',
  status: 'em_reparo',
  notes: '',
};

export default function RepairsPage() {
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const [employeeRes, itemRes, repairRes] = await Promise.all([
      employeeApi.list(),
      inventoryApi.list(),
      repairApi.list(),
    ]);
    setEmployees(employeeRes.data || []);
    setItems((itemRes.data || []).filter((item) => item.category === 'equipamento'));
    setRepairs(repairRes.data || []);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await repairApi.create(form);
    setForm(emptyForm);
    loadData();
  }

  async function markReturned(repair) {
    await repairApi.update(repair.id, {
      status: 'devolvido',
      return_from_repair_date: new Date().toISOString().slice(0, 10),
      final_return_date: new Date().toISOString().slice(0, 10),
    });
    loadData();
  }

  return (
    <div className="page-grid two-columns">
      <PageSection title="Controle de reparos" description="Histórico do equipamento fixo, envio, retorno e devolução final.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={form.inventory_item_id} onChange={(e) => setForm({ ...form, inventory_item_id: e.target.value })} required>
            <option value="">Selecione o equipamento</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Funcionário responsável</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
          <input type="date" value={form.sent_for_repair_date} onChange={(e) => setForm({ ...form, sent_for_repair_date: e.target.value })} required />
          <input placeholder="Motivo do reparo" value={form.repair_reason} onChange={(e) => setForm({ ...form, repair_reason: e.target.value })} required />
          <textarea rows="3" placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="primary-btn" type="submit">Registrar reparo</button>
        </form>
      </PageSection>

      <PageSection title="Histórico de reparos" description="Rastreabilidade de cada equipamento fixo.">
        <DataTable
          columns={[
            { key: 'inventory_items', label: 'Equipamento', render: (row) => row.inventory_items?.name || '-' },
            { key: 'employees', label: 'Funcionário', render: (row) => row.employees?.name || '-' },
            { key: 'sent_for_repair_date', label: 'Envio' },
            { key: 'return_from_repair_date', label: 'Retorno do reparo' },
            { key: 'final_return_date', label: 'Devolução final' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_reparo' ? 'warning' : 'success'}>{row.status}</StatusBadge> },
            { key: 'actions', label: 'Ações', render: (row) => row.status === 'em_reparo' ? <button className="secondary-btn" onClick={() => markReturned(row)}>Marcar retorno</button> : 'Concluído' },
          ]}
          rows={repairs}
        />
      </PageSection>
    </div>
  );
}
