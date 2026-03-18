import { useEffect, useState } from 'react';
import { inventoryApi } from '../lib/api';
import { DataTable, PageSection, StatusBadge } from '../components/UI';

const emptyForm = {
  name: '', category: 'equipamento', description: '', internal_code: '', total_quantity: 1, available_quantity: 1, unit: 'un', status: 'ativo', notes: ''
};

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    const response = await inventoryApi.list();
    setItems(response.data || []);
  };

  useEffect(() => { loadData(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    await inventoryApi.create(form);
    setForm(emptyForm);
    loadData();
  }

  async function removeItem(id) {
    await inventoryApi.remove(id);
    loadData();
  }

  return (
    <div className="page-grid two-columns">
      <PageSection title="Lançamento de inventário" description="Cadastre equipamentos, EPIs, produtos e materiais da empresa.">
        <form className="form-grid" onSubmit={handleSubmit}>
          <input placeholder="Nome do item" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="equipamento">Equipamento</option>
            <option value="produto_quimico">Produto químico</option>
            <option value="epi">EPI</option>
            <option value="ferramenta">Ferramenta</option>
            <option value="material_apoio">Material de apoio</option>
          </select>
          <input placeholder="Código interno / patrimônio" value={form.internal_code} onChange={(e) => setForm({ ...form, internal_code: e.target.value })} />
          <input type="number" placeholder="Quantidade total" value={form.total_quantity} onChange={(e) => setForm({ ...form, total_quantity: Number(e.target.value), available_quantity: Number(e.target.value) })} />
          <input placeholder="Unidade" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <textarea placeholder="Descrição / observações" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="primary-btn" type="submit">Salvar item</button>
        </form>
      </PageSection>

      <PageSection title="Inventário ativo" description="Saldo total, saldo disponível e exclusão controlada.">
        <DataTable
          columns={[
            { key: 'name', label: 'Item' },
            { key: 'category', label: 'Categoria' },
            { key: 'internal_code', label: 'Código' },
            { key: 'total_quantity', label: 'Qtd. total' },
            { key: 'available_quantity', label: 'Disponível' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'ativo' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
            { key: 'actions', label: 'Ações', render: (row) => <button className="danger-btn" onClick={() => removeItem(row.id)}>Excluir</button> },
          ]}
          rows={items}
        />
      </PageSection>
    </div>
  );
}
