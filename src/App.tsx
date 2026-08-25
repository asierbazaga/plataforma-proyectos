import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Dumbbell, DollarSign, BookOpen, BookMarked, ShieldCheck, ChevronRight, Home, Building } from 'lucide-react';
import { AppId } from './types';

// Lazy loading de módulos para optimización extrema de carga y rendimiento
const FitnessApp = lazy(() => import('./apps/fitness/FitnessApp').then(m => ({ default: m.FitnessApp })));
const GastosApp = lazy(() => import('./apps/gastos/GastosApp').then(m => ({ default: m.GastosApp })));
const LibrosJuegosApp = lazy(() => import('./apps/libros-juegos/LibrosJuegosApp').then(m => ({ default: m.LibrosJuegosApp })));
const LoreApp = lazy(() => import('./apps/lore/LoreApp').then(m => ({ default: m.LoreApp })));
const EntrevistasApp = lazy(() => import('./apps/entrevistas/EntrevistasApp').then(m => ({ default: m.EntrevistasApp })));
const UserManagement = lazy(() => import('./components/UserManagement').then(m => ({ default: m.UserManagement })));
const ActivityLogs = lazy(() => import('./components/ActivityLogs').then(m => ({ default: m.ActivityLogs })));

const ModuleLoader: React.FC = () => (
  <div className="flex items-center justify-center p-12 min-h-[300px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400 font-medium">Cargando aplicación...</span>
    </div>
  </div>
);

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

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleBackToDashboard = () => {
    handleSelectTab('dashboard');
  };

  const getAppTitle = () => {
    switch (currentTab) {
      case 'fitness': return 'App Fitness & Salud';
      case 'gastos': return 'App Gastos & Finanzas';
      case 'libros-juegos': return 'App Libros & Juegos';
      case 'lore': return 'App Lore & Rutas';
      case 'entrevistas': return 'Mecalux Talent & Entrevistas';
      case 'permissions': return 'Matriz de Permisos (RBAC)';
      case 'logs': return 'Registro de Actividad';
      default: return 'Catálogo de Proyectos';
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onSelectApp={(appId) => handleSelectTab(appId)} />;

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

      case 'entrevistas':
        if (!hasAccessToApp('entrevistas')) return <AccessDeniedView onBack={handleBackToDashboard} appName="ENTREVISTAS MECALUX" />;
        return <EntrevistasApp onBack={handleBackToDashboard} />;

      case 'permissions':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={handleBackToDashboard} appName="Matriz de Permisos" />;
        return <UserManagement onBack={handleBackToDashboard} />;

      case 'logs':
        if (currentUser.role !== 'admin') return <AccessDeniedView onBack={handleBackToDashboard} appName="Registro de Actividad" />;
        return <ActivityLogs onBack={handleBackToDashboard} />;

      default:
        return <Dashboard onSelectApp={(appId) => handleSelectTab(appId)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col pb-16 md:pb-0">
      <Navbar currentTab={currentTab} onSelectTab={handleSelectTab} />
      <div className="flex flex-1">
        <Sidebar currentTab={currentTab} onSelectTab={handleSelectTab} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Suspense fallback={<ModuleLoader />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on Mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
            currentTab === 'dashboard'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-white font-medium'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px]">Catálogo</span>
        </button>

        {hasAccessToApp('gastos') && (
          <button
            onClick={() => handleSelectTab('gastos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'gastos'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[10px]">Gastos</span>
          </button>
        )}

        {hasAccessToApp('fitness') && (
          <button
            onClick={() => handleSelectTab('fitness')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'fitness'
                ? 'text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span className="text-[10px]">Fitness</span>
          </button>
        )}

        {hasAccessToApp('libros-juegos') && (
          <button
            onClick={() => handleSelectTab('libros-juegos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'libros-juegos'
                ? 'text-purple-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span className="text-[10px]">Biblioteca</span>
          </button>
        )}

        {hasAccessToApp('lore') && (
          <button
            onClick={() => handleSelectTab('lore')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'lore'
                ? 'text-teal-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[10px]">Lore</span>
          </button>
        )}

        {hasAccessToApp('entrevistas') && (
          <button
            onClick={() => handleSelectTab('entrevistas')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              currentTab === 'entrevistas'
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white font-medium'
            }`}
          >
            <Building className="w-4 h-4" />
            <span className="text-[10px]">Entrevistas</span>
          </button>
        )}
      </nav>
    </div>
  );
};

const AccessDeniedView: React.FC<{ onBack: () => void; appName: string }> = ({ onBack, appName }) => (
  <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto my-12 border-rose-500/30">
    <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Acceso No Autorizado</h2>
    <p className="text-slate-400 mb-6 text-sm">
      Tu perfil actual no dispone de permisos para acceder a <strong className="text-white">{appName}</strong>.
      Ponte en contacto con el administrador para solicitar acceso.
    </p>
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-all border border-slate-700"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Volver al Catálogo</span>
    </button>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
