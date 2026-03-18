import { useEffect, useMemo, useState } from 'react';
import { assignmentApi, employeeApi, inventoryApi } from '../lib/api';
import { DataTable, PageSection, SignaturePad, StatusBadge } from '../components/UI';

const emptyForm = {
  inventory_item_id: '',
  employee_id: '',
  delivered_by: '',
  quantity: 1,
  delivery_date: '',
  notes: '',
  signature_data_url: '',
  status: 'em_uso',
};

export default function DeliveriesPage() {
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [form, setForm] = useState(emptyForm);

  async function loadData() {
    const [employeeRes, inventoryRes, deliveryRes] = await Promise.all([
      employeeApi.list(),
      inventoryApi.list(),
      assignmentApi.list(),
    ]);
    setEmployees((employeeRes.data || []).filter((employee) => employee.status === 'ativo'));
    setItems((inventoryRes.data || []).filter((item) => item.status === 'ativo'));
    setDeliveries(deliveryRes.data || []);
  }

  useEffect(() => { loadData(); }, []);

  const selectedItem = useMemo(() => items.find((item) => item.id === form.inventory_item_id), [items, form.inventory_item_id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await assignmentApi.create(form);
    if (selectedItem) {
      await inventoryApi.update(selectedItem.id, {
        available_quantity: Math.max(0, Number(selectedItem.available_quantity) - Number(form.quantity)),
      });
    }
    setForm(emptyForm);
    loadData();
  }

  async function markReturned(delivery) {
    await assignmentApi.update(delivery.id, { status: 'devolvido', return_date: new Date().toISOString().slice(0, 10) });
    const item = items.find((entry) => entry.id === delivery.inventory_item_id);
    if (item) {
      await inventoryApi.update(item.id, { available_quantity: Number(item.available_quantity) + Number(delivery.quantity) });
    }
    loadData();
  }

  return (
    <div className="page-grid two-columns">
      <PageSection title="Registrar entrega / retirada mensal" description="Assinatura digital do colaborador e baixa automática do estoque.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <select value={form.inventory_item_id} onChange={(e) => setForm({ ...form, inventory_item_id: e.target.value })} required>
            <option value="">Selecione o item</option>
            {items.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.available_quantity} disponíveis)</option>)}
          </select>
          <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
            <option value="">Selecione o funcionário</option>
            {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
          <input placeholder="Responsável pela entrega" value={form.delivered_by} onChange={(e) => setForm({ ...form, delivered_by: e.target.value })} required />
          <input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} required />
          <input type="date" value={form.delivery_date} onChange={(e) => setForm({ ...form, delivery_date: e.target.value })} required />
          <textarea rows="3" placeholder="Observações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div>
            <label className="field-label">Assinatura do funcionário</label>
            <SignaturePad value={form.signature_data_url} onChange={(signature) => setForm({ ...form, signature_data_url: signature })} />
          </div>
          <button className="primary-btn" type="submit">Registrar entrega</button>
        </form>
      </PageSection>

      <PageSection title="Movimentações" description="Controle de saída, posse do item e devolução.">
        <DataTable
          columns={[
            { key: 'inventory_items', label: 'Item', render: (row) => row.inventory_items?.name || '-' },
            { key: 'employees', label: 'Funcionário', render: (row) => row.employees?.name || '-' },
            { key: 'delivery_date', label: 'Entrega' },
            { key: 'return_date', label: 'Devolução' },
            { key: 'quantity', label: 'Qtd.' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_uso' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
            { key: 'actions', label: 'Ações', render: (row) => row.status === 'em_uso' ? <button className="secondary-btn" onClick={() => markReturned(row)}>Registrar devolução</button> : 'Concluído' },
          ]}
          rows={deliveries}
        />
      </PageSection>
    </div>
  );
}
