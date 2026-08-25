import React, { useState, useEffect } from 'react';
import {
  Dumbbell,
  Flame,
  Scale,
  Heart,
  Wrench,
  User,
  LayoutDashboard,
  ShieldAlert,
  ArrowLeft,
  Calculator,
  Sparkles,
  RotateCcw
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
import { FitnessAssessmentModal } from './components/FitnessAssessmentModal';

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
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [openNewWorkoutModal, setOpenNewWorkoutModal] = useState(false);
  const [openNewFoodModal, setOpenNewFoodModal] = useState(false);
  const [openWeightModal, setOpenWeightModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadAllFitnessData = async () => {
    // Si es la primera vez que se carga con la nueva versión limpia, resetear datos antiguos mock
    if (localStorage.getItem('fitness_clean_v2') !== 'true') {
      localStorage.setItem('fitness_clean_v2', 'true');
      await storageService.resetFitnessData();
    }

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

    // Si el usuario aún no ha completado el test inicial de evaluación, lanzarlo automáticamente
    if (prof && !prof.onboarding_completed) {
      setShowAssessmentModal(true);
    }
  };

  useEffect(() => {
    loadAllFitnessData();
    const unsubscribe = storageService.onSync(() => {
      loadAllFitnessData();
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (updated: Partial<FitnessProfile>) => {
    const saved = await storageService.updateFitnessProfile(updated);
    setProfile(saved);
  };

  const handleSaveAssessmentPlan = async (
    updated: Partial<FitnessProfile>,
    initialWeightEntry?: number
  ) => {
    const saved = await storageService.updateFitnessProfile({
      ...updated,
      onboarding_completed: true
    });
    setProfile(saved);

    // Si introduce peso inicial, registrar pesaje único en el historial de peso
    if (initialWeightEntry) {
      await storageService.addBodyProgress({
        date: todayStr,
        weight: initialWeightEntry,
        notes: 'Pesaje inicial del plan'
      });
    }

    await loadAllFitnessData();
  };

  const handleResetFitness = async () => {
    if (window.confirm('¿Deseas reiniciar todos los datos de fitness y volver a realizar el test inicial?')) {
      await storageService.resetFitnessData();
      await loadAllFitnessData();
      setShowAssessmentModal(true);
    }
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
      <div className="flex items-center justify-center p-16 min-h-[350px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Cargando Fitness Hub...</span>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Hoy', icon: LayoutDashboard },
    { id: 'workouts', label: 'Entrenar', icon: Dumbbell },
    { id: 'nutrition', label: 'Nutrición', icon: Flame },
    { id: 'macros', label: 'Calculadora Macros', icon: Calculator },
    { id: 'weight', label: 'Cuerpo & Peso', icon: Scale },
    { id: 'polar', label: 'Polar Grit X Pro', icon: Heart },
    { id: 'tools', label: 'Herramientas', icon: Wrench }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Barra Superior Integrada y Minimalista */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[#111622] p-2 rounded-2xl border border-white/5 shadow-lg">
        {/* Controles de Navegación Segmentada */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver a la plataforma"
              className="p-2.5 rounded-xl bg-[#090C15] hover:bg-white/10 text-slate-300 border border-white/5 transition-all flex-shrink-0 mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Acceso Rápido al Perfil, Test y Reset */}
        <div className="flex items-center justify-end gap-2 px-2 pb-1 sm:pb-0">
          <button
            onClick={() => setShowAssessmentModal(true)}
            title="Realizar test de objetivos y recomendaciones"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B00]/10 hover:bg-[#FF6B00]/20 text-[#FF6B00] font-bold text-xs rounded-xl border border-[#FF6B00]/25 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Test Inicial</span>
          </button>

          <button
            onClick={handleResetFitness}
            title="Resetear datos y empezar de cero"
            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#090C15] hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>{profile.current_weight} kg</span>
          </button>

          {!canEdit && (
            <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20">
              <ShieldAlert className="w-3 h-3" />
              Lectura
            </div>
          )}
        </div>
      </div>

      {/* Contenido de la Sección Activa */}
      <main>
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
      </main>

      {/* Modal Test de Evaluación Inicial / Reajuste */}
      <FitnessAssessmentModal
        isOpen={showAssessmentModal}
        onClose={() => setShowAssessmentModal(false)}
        profile={profile}
        onSavePlan={handleSaveAssessmentPlan}
      />

      {/* Modal Profile */}
      <FitnessProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};
