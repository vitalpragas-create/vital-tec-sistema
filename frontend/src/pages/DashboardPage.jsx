import { useEffect, useState } from 'react';
import { getDashboardData } from '../lib/api';
import { DataTable, PageSection, StatCard, StatusBadge } from '../components/UI';

export default function DashboardPage() {
  const [data, setData] = useState({
    summary: { total_items: 0, available_items: 0, assigned_items: 0, repair_items: 0, returned_items: 0, active_employees: 0 },
    recentAssignments: [],
    repairAlerts: [],
  });

  useEffect(() => {
    getDashboardData().then(setData);
  }, []);

  const summaryCards = [
    ['Itens cadastrados', data.summary.total_items, 'Inventário total'],
    ['Disponíveis', data.summary.available_items, 'Saldo em estoque'],
    ['Em uso', data.summary.assigned_items, 'Com colaboradores'],
    ['Em reparo', data.summary.repair_items, 'Equipamentos na assistência'],
    ['Devolvidos', data.summary.returned_items, 'Histórico concluído'],
    ['Funcionários ativos', data.summary.active_employees, 'Equipe operacional'],
  ];

  return (
    <div className="page-grid">
      <div className="stats-grid">
        {summaryCards.map(([title, value, subtitle]) => <StatCard key={title} title={title} value={value} subtitle={subtitle} />)}
      </div>

      <PageSection title="Últimas entregas" description="Saídas recentes com rastreabilidade por funcionário e assinatura.">
        <DataTable
          columns={[
            { key: 'item', label: 'Item', render: (row) => row.inventory_items?.name || '-' },
            { key: 'employee', label: 'Funcionário', render: (row) => row.employees?.name || '-' },
            { key: 'delivery_date', label: 'Data' },
            { key: 'quantity', label: 'Qtd.' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_uso' ? 'success' : 'neutral'}>{row.status}</StatusBadge> },
          ]}
          rows={data.recentAssignments}
        />
      </PageSection>

      <PageSection title="Alertas de reparo" description="Acompanhe itens enviados, devolvidos e pendentes.">
        <DataTable
          columns={[
            { key: 'item', label: 'Equipamento', render: (row) => row.inventory_items?.name || '-' },
            { key: 'sent_for_repair_date', label: 'Envio p/ reparo' },
            { key: 'return_from_repair_date', label: 'Retorno' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge tone={row.status === 'em_reparo' ? 'warning' : 'success'}>{row.status}</StatusBadge> },
            { key: 'repair_reason', label: 'Motivo' },
          ]}
          rows={data.repairAlerts}
        />
      </PageSection>
    </div>
  );
}
