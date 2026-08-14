import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { FitnessApp } from './apps/fitness/FitnessApp';
import { GastosApp } from './apps/gastos/GastosApp';
import { LibrosJuegosApp } from './apps/libros-juegos/LibrosJuegosApp';
import { LoreApp } from './apps/lore/LoreApp';
import { UserManagement } from './components/UserManagement';
import { ActivityLogs } from './components/ActivityLogs';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { AppId } from './types';

const MainLayout: React.FC = () => {
  const { currentUser, loading, hasAccessToApp } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Cargando Plataforma Unificada...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onSelectApp={(appId) => setCurrentTab(appId)} />;

      case 'fitness':
        if (!hasAccessToApp('fitness')) return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="APP FITNESS" />;
        return <FitnessApp />;

      case 'gastos':
        if (!hasAccessToApp('gastos')) return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="APP GASTOS" />;
        return <GastosApp />;

      case 'libros-juegos':
        if (!hasAccessToApp('libros-juegos')) return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="APP LIBROS & JUEGOS" />;
        return <LibrosJuegosApp />;

      case 'lore':
        if (!hasAccessToApp('lore')) return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="APP LORE" />;
        return <LoreApp />;

      case 'permissions':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="Matriz de Permisos" />;
        return <UserManagement />;

      case 'logs':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={() => setCurrentTab('dashboard')} appName="Registro de Actividad" />;
        return <ActivityLogs />;

      default:
        return <Dashboard onSelectApp={(appId) => setCurrentTab(appId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={(tab) => setCurrentTab(tab)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const AccessDeniedView: React.FC<{ onBack: () => void; appName: string }> = ({ onBack, appName }) => (
  <div className="glass-panel p-12 rounded-3xl border border-rose-500/30 text-center space-y-4 max-w-lg mx-auto my-12">
    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-extrabold text-white">Acceso Restringido</h2>
    <p className="text-sm text-slate-400">
      Tu usuario no dispone de permiso suficiente para acceder a <span className="font-bold text-white">{appName}</span>. Contacta con el Administrador para otorgar acceso en la Matriz RBAC.
    </p>
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver al Catálogo
    </button>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

export default App;
