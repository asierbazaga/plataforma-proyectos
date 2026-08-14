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
import { ShieldAlert, ArrowLeft, LayoutDashboard, Dumbbell, DollarSign, BookOpen, BookMarked, ShieldCheck, ChevronRight, Home } from 'lucide-react';
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

  const handleBackToDashboard = () => {
    setCurrentTab('dashboard');
  };

  const getAppTitle = () => {
    switch (currentTab) {
      case 'fitness': return 'App Fitness & Salud';
      case 'gastos': return 'App Gastos & Finanzas';
      case 'libros-juegos': return 'App Libros & Juegos';
      case 'lore': return 'App Lore & Rutas';
      case 'permissions': return 'Matriz de Permisos (RBAC)';
      case 'logs': return 'Registro de Actividad';
      default: return 'Catálogo de Proyectos';
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onSelectApp={(appId) => setCurrentTab(appId)} />;

      case 'fitness':
        if (!hasAccessToApp('fitness')) return <AccessDeniedView onBack={handleBackToDashboard} appName="APP FITNESS" />;
        return <FitnessApp onBack={handleBackToDashboard} />;

      case 'gastos':
        if (!hasAccessToApp('gastos')) return <AccessDeniedView onBack={handleBackToDashboard} appName="APP GASTOS" />;
        return <GastosApp onBack={handleBackToDashboard} />;

      case 'libros-juegos':
        if (!hasAccessToApp('libros-juegos')) return <AccessDeniedView onBack={handleBackToDashboard} appName="APP LIBROS & JUEGOS" />;
        return <LibrosJuegosApp onBack={handleBackToDashboard} />;

      case 'lore':
        if (!hasAccessToApp('lore')) return <AccessDeniedView onBack={handleBackToDashboard} appName="APP LORE" />;
        return <LoreApp onBack={handleBackToDashboard} />;

      case 'permissions':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={handleBackToDashboard} appName="Matriz de Permisos" />;
        return <UserManagement onBack={handleBackToDashboard} />;

      case 'logs':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={handleBackToDashboard} appName="Registro de Actividad" />;
        return <ActivityLogs onBack={handleBackToDashboard} />;

      default:
        return <Dashboard onSelectApp={(appId) => setCurrentTab(appId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />
      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden space-y-4">
          {/* Quick Breadcrumb Navigation Bar (when inside any module) */}
          {currentTab !== 'dashboard' && (
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-xs backdrop-blur-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={handleBackToDashboard}
                  className="flex items-center gap-1.5 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Plataforma</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="font-semibold text-white">{getAppTitle()}</span>
              </div>

              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-xl border border-slate-700 transition-all text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la Plataforma</span>
              </button>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on Mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Catálogo</span>
        </button>

        <button
          onClick={() => setCurrentTab('fitness')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'fitness'
              ? 'text-orange-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px]">Fitness</span>
        </button>

        <button
          onClick={() => setCurrentTab('gastos')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'gastos'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[10px]">Gastos</span>
        </button>

        <button
          onClick={() => setCurrentTab('libros-juegos')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'libros-juegos'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px]">Libros</span>
        </button>

        <button
          onClick={() => setCurrentTab('lore')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'lore'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px]">Lore</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setCurrentTab('permissions')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'permissions' || currentTab === 'logs'
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px]">Admin</span>
          </button>
        )}
      </nav>
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
