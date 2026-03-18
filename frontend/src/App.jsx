import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Boxes, ClipboardList, FileBarChart2, Gauge, LogOut, ShieldCheck, UserCog, Users, Wrench } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import EmployeesPage from './pages/EmployeesPage';
import InventoryPage from './pages/InventoryPage';
import DeliveriesPage from './pages/DeliveriesPage';
import RepairsPage from './pages/RepairsPage';
import ReportsPage from './pages/ReportsPage';
import LoginPage from './pages/LoginPage';
import UsersPage from './pages/UsersPage';
import { supabase } from './lib/supabase';
import { profileApi } from './lib/api';
import { signOutSession } from './lib/auth';

const baseMenu = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/funcionarios', label: 'Funcionários', icon: Users },
  { to: '/inventario', label: 'Inventário', icon: Boxes },
  { to: '/entregas', label: 'Entregas', icon: ClipboardList },
  { to: '/reparos', label: 'Reparos', icon: Wrench },
  { to: '/relatorios', label: 'Relatórios', icon: FileBarChart2 },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user?.id) {
        const profileRes = await profileApi.me(data.session.user.id);
        setProfile(profileRes.data || null);
      }
      setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user?.id) {
        const profileRes = await profileApi.me(nextSession.user.id);
        setProfile(profileRes.data || null);
      } else {
        setProfile(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const menu = useMemo(() => {
    const items = [...baseMenu];
    if (profile?.role === 'admin') {
      items.push({ to: '/usuarios', label: 'Usuários', icon: UserCog });
    }
    return items;
  }, [profile]);

  if (loading) {
    return <div className="loading-screen">Carregando sistema...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-card">
            <div className="brand-icon"><ShieldCheck size={28} /></div>
            <div>
              <h1>Vital Tec</h1>
              <p>Estoque, usuários e responsabilidade</p>
            </div>
          </div>
          <nav className="nav-menu">
            {menu.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="sidebar-footer">
          <strong>{profile?.display_name || 'Usuário'}</strong>
          <span>{profile?.role === 'admin' ? 'Administrador' : 'Operador'}</span>
          <button className="secondary-btn full-width" onClick={signOutSession}><LogOut size={16} /> Sair</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Gestão operacional</span>
            <h2>Controle total do inventário, reparos, entregas e acessos do sistema</h2>
          </div>
          <div className="topbar-badge">Sistema online Vital Tec</div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/funcionarios" element={<EmployeesPage />} />
          <Route path="/inventario" element={<InventoryPage />} />
          <Route path="/entregas" element={<DeliveriesPage />} />
          <Route path="/reparos" element={<RepairsPage />} />
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/usuarios" element={profile?.role === 'admin' ? <UsersPage /> : <DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}
