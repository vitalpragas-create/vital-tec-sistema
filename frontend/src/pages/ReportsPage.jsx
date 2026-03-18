import { useEffect, useState } from 'react';
import { assignmentApi, employeeApi, inventoryApi, repairApi } from '../lib/api';
import { DataTable, PageSection, StatusBadge } from '../components/UI';

export default function ReportsPage() {
  const [inventory, setInventory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [repairs, setRepairs] = useState([]);

  async function loadData() {
    const [inventoryRes, employeeRes, deliveriesRes, repairsRes] = await Promise.all([
      inventoryApi.list(),
      employeeApi.list(),
      assignmentApi.list(),
      repairApi.list(),
    ]);
    setInventory(inventoryRes.data || []);
    setEmployees(employeeRes.data || []);
    setDeliveries(deliveriesRes.data || []);
    setRepairs(repairsRes.data || []);
  }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="page-grid">
      <PageSection title="Relatório geral do inventário" description="Saldo total, disponível e categoria.">
        <DataTable
          columns={[
            { key: 'name', label: 'Item' },
            { key: 'category', label: 'Categoria' },
            { key: 'total_quantity', label: 'Total' },
            { key: 'available_quantity', label: 'Disponível' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'ativo' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
          ]}
          rows={inventory}
        />
      </PageSection>

      <PageSection title="Relatório por funcionário" description="Visualize posse atual e histórico por colaborador.">
        <DataTable
          columns={[
            { key: 'name', label: 'Funcionário' },
            { key: 'role', label: 'Função' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'ativo' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
            { key: 'phone', label: 'Telefone' },
          ]}
          rows={employees}
        />
      </PageSection>

      <PageSection title="Relatório de entregas" description="Conferência de saídas, retornos e assinaturas.">
        <DataTable
          columns={[
            { key: 'inventory_items', label: 'Item', render: (row) => row.inventory_items?.name || '-' },
            { key: 'employees', label: 'Funcionário', render: (row) => row.employees?.name || '-' },
            { key: 'delivery_date', label: 'Entrega' },
            { key: 'return_date', label: 'Devolução' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_uso' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
          ]}
          rows={deliveries}
        />
      </PageSection>

      <PageSection title="Relatório de reparos" description="Equipamentos em reparo, retornados e concluídos.">
        <DataTable
          columns={[
            { key: 'inventory_items', label: 'Equipamento', render: (row) => row.inventory_items?.name || '-' },
            { key: 'sent_for_repair_date', label: 'Envio' },
            { key: 'return_from_repair_date', label: 'Retorno' },
            { key: 'final_return_date', label: 'Devolução final' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_reparo' ? 'warning' : 'success'}>{row.status}</StatusBadge> },
          ]}
          rows={repairs}
        />
      </PageSection>
    </div>
  );
}
