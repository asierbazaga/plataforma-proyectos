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
  Calculator
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
      {/* Minimalist Top App Bar */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-5 sm:p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              title="Volver"
              className="p-3 rounded-2xl bg-[#090C15] hover:bg-white/10 text-slate-300 border border-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Fitness & Polar</h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FF6B00]/15 text-[#FF6B00] font-bold">
                Polar Grit X Pro
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Fuerza, calorías, recuperación de frecuencia cardíaca y peso.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#090C15] hover:bg-white/10 text-white font-bold text-xs rounded-2xl border border-white/5 transition-all"
          >
            <User className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Perfil ({profile.current_weight} kg)</span>
          </button>

          {!canEdit && (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-2xl border border-amber-400/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              Lectura
            </div>
          )}
        </div>
      </header>

      {/* Modern Segmented Navigation Bar */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar p-1.5 bg-[#111622] rounded-2xl border border-white/5">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main Views */}
      <main className="pt-1">
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
