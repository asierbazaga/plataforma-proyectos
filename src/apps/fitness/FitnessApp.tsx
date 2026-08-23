import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Flame,
  Scale,
  Heart,
  Calculator,
  Wrench,
  User,
  LayoutDashboard,
  ShieldAlert,
  ArrowLeft,
  Sparkles,
  Zap,
  Droplet
} from 'lucide-react';
import {
  FitnessProfile,
  FitnessWorkout,
  DailyNutritionLog,
  BodyProgressEntry,
  PolarGritMetrics,
  FoodEntry
} from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

import { FitnessDashboard } from './components/FitnessDashboard';
import { WorkoutPlanner } from './components/WorkoutPlanner';
import { NutritionTracker } from './components/NutritionTracker';
import { MacroCalculator } from './components/MacroCalculator';
import { BodyMetricsTracker } from './components/BodyMetricsTracker';
import { PolarGritHub } from './components/PolarGritHub';
import { FitnessTools } from './components/FitnessTools';
import { FitnessProfileModal } from './components/FitnessProfileModal';

interface FitnessAppProps {
  onBack?: () => void;
}

export const FitnessApp: React.FC<FitnessAppProps> = ({ onBack }) => {
  const { canEditApp } = useAuth();
  const canEdit = canEditApp('fitness');

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // App Data State
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [workouts, setWorkouts] = useState<FitnessWorkout[]>([]);
  const [todayNutrition, setTodayNutrition] = useState<DailyNutritionLog | null>(null);
  const [bodyProgress, setBodyProgress] = useState<BodyProgressEntry[]>([]);
  const [polarMetrics, setPolarMetrics] = useState<PolarGritMetrics[]>([]);

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openNewWorkoutModal, setOpenNewWorkoutModal] = useState(false);
  const [openNewFoodModal, setOpenNewFoodModal] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAllFitnessData = async () => {
    const [prof, wks, nut, bp, pol] = await Promise.all([
      storageService.getFitnessProfile(),
      storageService.getWorkouts(),
      storageService.getDailyNutrition(todayStr),
      storageService.getBodyProgress(),
      storageService.getPolarMetrics()
    ]);

    setProfile(prof);
    setWorkouts(wks);
    setTodayNutrition(nut);
    setBodyProgress(bp);
    setPolarMetrics(pol);
  };

  useEffect(() => {
    loadAllFitnessData();
    const unsubscribe = storageService.onSync(() => {
      loadAllFitnessData();
    });
    return () => unsubscribe();
  }, []);

  // Handlers de persistencia
  const handleSaveProfile = async (updated: Partial<FitnessProfile>) => {
    const saved = await storageService.updateFitnessProfile(updated);
    setProfile(saved);
  };

  const handleApplyMacrosFromCalculator = async (macros: {
    target_calories: number;
    target_protein: number;
    target_carbs: number;
    target_fat: number;
    carb_cycling_enabled?: boolean;
    training_day_carbs?: number;
    rest_day_carbs?: number;
  }) => {
    const saved = await storageService.updateFitnessProfile(macros);
    setProfile(saved);
  };

  const handleSaveWorkout = async (workout: Omit<FitnessWorkout, 'id'>) => {
    await storageService.addWorkout(workout);
    await loadAllFitnessData();
  };

  const handleDeleteWorkout = async (id: string) => {
    await storageService.deleteWorkout(id);
    await loadAllFitnessData();
  };

  const handleAddFood = async (date: string, food: Omit<FoodEntry, 'id'>) => {
    await storageService.addFoodToDate(date, food);
    await loadAllFitnessData();
  };

  const handleRemoveFood = async (date: string, foodId: string) => {
    await storageService.removeFoodFromDate(date, foodId);
    await loadAllFitnessData();
  };

  const handleUpdateWater = async (date: string, amountMl: number) => {
    await storageService.updateWater(date, amountMl);
    await loadAllFitnessData();
  };

  const handleAddBodyProgress = async (entry: Omit<BodyProgressEntry, 'id'>) => {
    await storageService.addBodyProgress(entry);
    await loadAllFitnessData();
  };

  const handleDeleteBodyProgress = async (id: string) => {
    await storageService.deleteBodyProgress(id);
    await loadAllFitnessData();
  };

  const handleSavePolarMetric = async (metric: Omit<PolarGritMetrics, 'id'>) => {
    await storageService.savePolarMetric(metric);
    await loadAllFitnessData();
  };

  if (!profile || !todayNutrition) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Cargando Centro de Fitness & Salud...</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Centro de Mando', icon: LayoutDashboard },
    { id: 'workouts', label: 'Entrenamientos', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrición & Diario', icon: Flame },
    { id: 'macros', label: 'Calculadora Macros', icon: Calculator },
    { id: 'weight', label: 'Peso & Medidas', icon: Scale },
    { id: 'polar', label: 'Polar Grit X Pro', icon: Heart },
    { id: 'tools', label: 'Herramientas', icon: Wrench }
  ];

  return (
    <div className="space-y-6">
      {/* Header Principal de la App */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-slate-900 p-6 rounded-3xl border border-orange-500/25">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la Plataforma"
              className="p-3 rounded-2xl bg-slate-800/80 hover:bg-orange-500 hover:text-white text-slate-300 border border-slate-700 hover:border-orange-400 transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          )}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0 text-white">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">APP FITNESS & CAMBIO FÍSICO</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 font-semibold">
                Polar Pro Edition
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Fuerza, Hipertrofia, Nutrición Inteligente, Peso Tendencia & Rendimiento Polar Grit X Pro.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all hover:border-orange-500/50"
          >
            <User className="w-4 h-4 text-orange-400" />
            Mi Perfil ({profile.current_weight} kg)
          </button>

          {!canEdit && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl border border-amber-400/20">
              <ShieldAlert className="w-4 h-4" />
              Solo Lectura
            </div>
          )}
        </div>
      </div>

      {/* Navegación por Pestañas (Desktop & Mobile Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 text-xs no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
      <div className="pt-2">
        {currentTab === 'dashboard' && (
          <FitnessDashboard
            profile={profile}
            todayNutrition={todayNutrition}
            workouts={workouts}
            bodyProgress={bodyProgress}
            latestPolar={polarMetrics[0]}
            onNavigateTab={tabId => setCurrentTab(tabId)}
            onOpenNewWorkoutModal={() => {
              setCurrentTab('workouts');
              setOpenNewWorkoutModal(true);
            }}
            onOpenNewFoodModal={() => {
              setCurrentTab('nutrition');
              setOpenNewFoodModal(true);
            }}
            onOpenWeightModal={() => {
              setCurrentTab('weight');
              setOpenWeightModal(true);
            }}
            onOpenProfileModal={() => setShowProfileModal(true)}
          />
        )}

        {currentTab === 'workouts' && (
          <WorkoutPlanner
            workouts={workouts}
            canEdit={canEdit}
            onSaveWorkout={handleSaveWorkout}
            onDeleteWorkout={handleDeleteWorkout}
            initialOpenModal={openNewWorkoutModal}
          />
        )}

        {currentTab === 'nutrition' && (
          <NutritionTracker
            profile={profile}
            canEdit={canEdit}
            currentLog={todayNutrition}
            onAddFood={handleAddFood}
            onRemoveFood={handleRemoveFood}
            onUpdateWater={handleUpdateWater}
            initialOpenModal={openNewFoodModal}
          />
        )}

        {currentTab === 'macros' && (
          <MacroCalculator
            profile={profile}
            onApplyMacros={handleApplyMacrosFromCalculator}
          />
        )}

        {currentTab === 'weight' && (
          <BodyMetricsTracker
            profile={profile}
            canEdit={canEdit}
            progressList={bodyProgress}
            onAddEntry={handleAddBodyProgress}
            onDeleteEntry={handleDeleteBodyProgress}
            initialOpenModal={openWeightModal}
          />
        )}

        {currentTab === 'polar' && (
          <PolarGritHub
            metricsList={polarMetrics}
            canEdit={canEdit}
            onSaveMetric={handleSavePolarMetric}
          />
        )}

        {currentTab === 'tools' && <FitnessTools />}
      </div>

      {/* MODAL CONFIGURACIÓN PERFIL */}
      <FitnessProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
