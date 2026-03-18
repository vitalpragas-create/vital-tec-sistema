import { safeQuery, supabase } from './supabase';

export async function getDashboardData() {
  const fallback = {
    summary: { total_items: 0, available_items: 0, assigned_items: 0, repair_items: 0, returned_items: 0, active_employees: 0 },
    recentAssignments: [],
    repairAlerts: [],
  };

  if (!supabase) return fallback;

  const [items, assignments, repairs, employees] = await Promise.all([
    supabase.from('inventory_items').select('*'),
    supabase.from('assignments').select('*, inventory_items(name), employees(name)').order('delivery_date', { ascending: false }).limit(5),
    supabase.from('repairs').select('*, inventory_items(name)').order('sent_for_repair_date', { ascending: false }).limit(5),
    supabase.from('employees').select('*').eq('status', 'ativo'),
  ]);

  const allItems = items.data ?? [];
  const activeAssignments = (assignments.data ?? []).filter((item) => item.status === 'em_uso');
  const repairItems = (repairs.data ?? []).filter((item) => item.status === 'em_reparo');

  return {
    summary: {
      total_items: allItems.length,
      available_items: allItems.filter((item) => item.status === 'ativo').reduce((acc, cur) => acc + Number(cur.available_quantity || 0), 0),
      assigned_items: activeAssignments.length,
      repair_items: repairItems.length,
      returned_items: (assignments.data ?? []).filter((item) => item.status === 'devolvido').length,
      active_employees: employees.data?.length ?? 0,
    },
    recentAssignments: assignments.data ?? [],
    repairAlerts: repairs.data ?? [],
  };
}

export const employeeApi = {
  list: () => safeQuery(() => supabase.from('employees').select('*').order('name')),
  create: (payload) => safeQuery(() => supabase.from('employees').insert(payload).select().single(), {}),
  update: (id, payload) => safeQuery(() => supabase.from('employees').update(payload).eq('id', id).select().single(), {}),
};

export const inventoryApi = {
  list: () => safeQuery(() => supabase.from('inventory_items').select('*').order('created_at', { ascending: false })),
  create: (payload) => safeQuery(() => supabase.from('inventory_items').insert(payload).select().single(), {}),
  update: (id, payload) => safeQuery(() => supabase.from('inventory_items').update(payload).eq('id', id).select().single(), {}),
  remove: (id) => safeQuery(() => supabase.from('inventory_items').delete().eq('id', id), {}),
};

export const assignmentApi = {
  list: () => safeQuery(() => supabase.from('assignments').select('*, inventory_items(name), employees(name)').order('delivery_date', { ascending: false })),
  create: (payload) => safeQuery(() => supabase.from('assignments').insert(payload).select().single(), {}),
  update: (id, payload) => safeQuery(() => supabase.from('assignments').update(payload).eq('id', id).select().single(), {}),
};

export const repairApi = {
  list: () => safeQuery(() => supabase.from('repairs').select('*, inventory_items(name), employees(name)').order('sent_for_repair_date', { ascending: false })),
  create: (payload) => safeQuery(() => supabase.from('repairs').insert(payload).select().single(), {}),
  update: (id, payload) => safeQuery(() => supabase.from('repairs').update(payload).eq('id', id).select().single(), {}),
};

export const profileApi = {
  list: () => safeQuery(() => supabase.from('profiles').select('*').order('created_at', { ascending: false })),
  me: (id) => safeQuery(() => supabase.from('profiles').select('*').eq('id', id).single(), null),
  bootstrapStatus: () => safeQuery(() => supabase.rpc('is_bootstrap_required'), false),
  update: (id, payload) => safeQuery(() => supabase.from('profiles').update(payload).eq('id', id).select().single(), {}),
};
