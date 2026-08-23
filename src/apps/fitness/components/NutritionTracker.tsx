import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Droplet,
  Sparkles,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Search,
  CheckCircle2,
  Zap,
  Clock,
  Lightbulb
} from 'lucide-react';
import { DailyNutritionLog, FoodEntry, MealType, FitnessProfile, FitnessRecipe } from '../../../types';
import { FITNESS_RECIPES } from '../data/fitnessRecipes';

interface NutritionTrackerProps {
  profile: FitnessProfile;
  canEdit: boolean;
  currentLog: DailyNutritionLog;
  onAddFood: (date: string, food: Omit<FoodEntry, 'id'>) => Promise<void>;
  onRemoveFood: (date: string, foodId: string) => Promise<void>;
  onUpdateWater: (date: string, amountMl: number) => Promise<void>;
  initialOpenModal?: boolean;
}

const COMMON_FOODS: Omit<FoodEntry, 'id'>[] = [
  { meal_type: 'breakfast', name: 'Huevos Enteros (2 uds grandes)', calories: 155, protein: 13, carbs: 1, fat: 11, portion_size: '2 unidades' },
  { meal_type: 'breakfast', name: 'Claras de Huevo Pasteurizadas (150ml)', calories: 75, protein: 16, carbs: 1, fat: 0, portion_size: '150 ml' },
  { meal_type: 'breakfast', name: 'Copos de Avena Integral (50g)', calories: 185, protein: 7, carbs: 32, fat: 3, portion_size: '50 g' },
  { meal_type: 'lunch', name: 'Pechuga de Pollo a la Plancha (180g)', calories: 215, protein: 42, carbs: 0, fat: 4, portion_size: '180 g' },
  { meal_type: 'lunch', name: 'Arroz Basmati / Jazmín Cocido (180g)', calories: 230, protein: 5, carbs: 50, fat: 1, portion_size: '180 g' },
  { meal_type: 'dinner', name: 'Lomo de Salmón al Horno (170g)', calories: 340, protein: 34, carbs: 0, fat: 22, portion_size: '170 g' },
  { meal_type: 'dinner', name: 'Boniato / Batata Asada (200g)', calories: 170, protein: 3, carbs: 40, fat: 0, portion_size: '200 g' },
  { meal_type: 'snack', name: 'Yogur Griego 0% Grasa (200g)', calories: 115, protein: 20, carbs: 8, fat: 0, portion_size: '200 g' },
  { meal_type: 'snack', name: 'Nueces Naturales Peladas (25g)', calories: 165, protein: 4, carbs: 3, fat: 16, portion_size: '25 g' },
  { meal_type: 'post_workout', name: 'Proteína Whey Isolate (30g)', calories: 110, protein: 26, carbs: 1, fat: 0.5, portion_size: '1 cazo (30g)' },
  { meal_type: 'post_workout', name: 'Plátano Maduro Mediano (100g)', calories: 90, protein: 1, carbs: 23, fat: 0, portion_size: '1 unidad' }
];

export const NutritionTracker: React.FC<NutritionTrackerProps> = ({
  profile,
  canEdit,
  currentLog,
  onAddFood,
  onRemoveFood,
  onUpdateWater,
  initialOpenModal = false
}) => {
  const [selectedDate, setSelectedDate] = useState(currentLog.date || new Date().toISOString().split('T')[0]);
  const [activeSection, setActiveSection] = useState<'tracker' | 'recipes' | 'assistant'>('tracker');
  const [showAddModal, setShowAddModal] = useState(initialOpenModal);

  // Form State para nuevo alimento
  const [foodMealType, setFoodMealType] = useState<MealType>('breakfast');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState(250);
  const [foodProtein, setFoodProtein] = useState(25);
  const [foodCarbs, setFoodCarbs] = useState(25);
  const [foodFat, setFoodFat] = useState(5);
  const [foodPortion, setFoodPortion] = useState('1 ración');
  const [foodSearch, setFoodSearch] = useState('');

  // Selected Recipe modal
  const [selectedRecipe, setSelectedRecipe] = useState<FitnessRecipe | null>(null);

  // Cálculo de totales consumidos
  const totalCalories = currentLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = currentLog.meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = currentLog.meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = currentLog.meals.reduce((acc, m) => acc + m.fat, 0);

  const remainingCalories = Math.max(0, profile.target_calories - totalCalories);
  const remainingProtein = Math.max(0, profile.target_protein - totalProtein);
  const remainingCarbs = Math.max(0, profile.target_carbs - totalCarbs);
  const remainingFat = Math.max(0, profile.target_fat - totalFat);

  const calPct = Math.min(100, Math.round((totalCalories / profile.target_calories) * 100)) || 0;
  const proPct = Math.min(100, Math.round((totalProtein / profile.target_protein) * 100)) || 0;
  const carbPct = Math.min(100, Math.round((totalCarbs / profile.target_carbs) * 100)) || 0;
  const fatPct = Math.min(100, Math.round((totalFat / profile.target_fat) * 100)) || 0;

  const handleSelectCommonFood = (food: Omit<FoodEntry, 'id'>) => {
    setFoodMealType(food.meal_type);
    setFoodName(food.name);
    setFoodCalories(food.calories);
    setFoodProtein(food.protein);
    setFoodCarbs(food.carbs);
    setFoodFat(food.fat);
    setFoodPortion(food.portion_size || '1 ración');
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    await onAddFood(selectedDate, {
      meal_type: foodMealType,
      name: foodName,
      calories: Number(foodCalories),
      protein: Number(foodProtein),
      carbs: Number(foodCarbs),
      fat: Number(foodFat),
      portion_size: foodPortion
    });

    setFoodName('');
    setShowAddModal(false);
  };

  // Filtrado de alimentos rápidos
  const filteredCommonFoods = COMMON_FOODS.filter(f =>
    f.name.toLowerCase().includes(foodSearch.toLowerCase())
  );

  const mealCategories: { key: MealType; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Desayuno', icon: '☀️' },
    { key: 'lunch', label: 'Almuerzo / Comida', icon: '🍲' },
    { key: 'snack', label: 'Merienda / Snacks', icon: '🍎' },
    { key: 'dinner', label: 'Cena', icon: '🌙' },
    { key: 'post_workout', label: 'Post-Entreno', icon: '⚡' }
  ];

  return (
    <div className="space-y-6">
      {/* Sub-Header & Selector de Sección */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSection('tracker')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'tracker'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Diario de Comidas
          </button>
          <button
            onClick={() => setActiveSection('assistant')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'assistant'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ¿Qué puedo comer ahora?
          </button>
          <button
            onClick={() => setActiveSection('recipes')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeSection === 'recipes'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Recetario Fitness
          </button>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              setFoodName('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Añadir Alimento
          </button>
        )}
      </div>

      {/* SECCIÓN 1: DIARIO DE COMIDAS & MACROS */}
      {activeSection === 'tracker' && (
        <div className="space-y-6">
          {/* Card de Resumen de Macros del Día */}
          <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">Balance Calórico</span>
                <h3 className="text-xl font-bold text-white">Consumo Nutricional de Hoy</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-slate-400">
                  Consumidas: <strong className="text-white">{totalCalories}</strong> / {profile.target_calories} kcal
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Restan {remainingCalories} kcal
                </span>
              </div>
            </div>

            {/* Barra General de Calorías */}
            <div className="space-y-1.5">
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all rounded-full"
                  style={{ width: `${calPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 kcal</span>
                <span>{calPct}% de la meta</span>
                <span>{profile.target_calories} kcal</span>
              </div>
            </div>

            {/* 3 Bloques de Macros */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/60 border border-rose-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-rose-400">Proteína</span>
                  <span className="text-slate-300 font-bold">{totalProtein}g / {profile.target_protein}g</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${proPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Quedan {remainingProtein}g</span>
                  <span>{proPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-sky-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sky-400">Carbohidratos</span>
                  <span className="text-slate-300 font-bold">{totalCarbs}g / {profile.target_carbs}g</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${carbPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Quedan {remainingCarbs}g</span>
                  <span>{carbPct}%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/60 border border-emerald-500/20 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-400">Grasas</span>
                  <span className="text-slate-300 font-bold">{totalFat}g / {profile.target_fat}g</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fatPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Quedan {remainingFat}g</span>
                  <span>{fatPct}%</span>
                </div>
              </div>
            </div>

            {/* Tracker de Agua Interactivo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Hidratación Diaria</h4>
                  <p className="text-xs text-sky-300 font-medium">
                    {currentLog.water_ml} ml / {profile.target_water_ml} ml ({Math.round((currentLog.water_ml / profile.target_water_ml) * 100)}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onUpdateWater(selectedDate, currentLog.water_ml + 250)}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs rounded-lg border border-sky-500/40 transition-colors"
                >
                  +250 ml (1 Vaso)
                </button>
                <button
                  onClick={() => onUpdateWater(selectedDate, currentLog.water_ml + 500)}
                  className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold text-xs rounded-lg border border-sky-500/40 transition-colors"
                >
                  +500 ml (Botella)
                </button>
              </div>
            </div>
          </div>

          {/* Listado de Comidas por Categoría */}
          <div className="space-y-4">
            {mealCategories.map(cat => {
              const mealsInCat = currentLog.meals.filter(m => m.meal_type === cat.key);
              const catCalories = mealsInCat.reduce((acc, m) => acc + m.calories, 0);
              const catProtein = mealsInCat.reduce((acc, m) => acc + m.protein, 0);

              return (
                <div key={cat.key} className="glass-panel p-5 rounded-2xl space-y-3 bg-slate-900/60">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h4 className="font-bold text-white text-sm">{cat.label}</h4>
                      <span className="text-xs text-slate-400 font-medium">({mealsInCat.length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-amber-400 font-bold">{catCalories} kcal</span>
                      <span className="text-xs text-rose-400 font-semibold">{catProtein}g pro</span>
                      {canEdit && (
                        <button
                          onClick={() => {
                            setFoodMealType(cat.key);
                            setShowAddModal(true);
                          }}
                          className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {mealsInCat.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-1">Sin alimentos registrados en esta toma.</p>
                  ) : (
                    <div className="space-y-2">
                      {mealsInCat.map(food => (
                        <div
                          key={food.id}
                          className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs"
                        >
                          <div>
                            <p className="font-bold text-white">{food.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {food.portion_size} • {food.protein}g P | {food.carbs}g C | {food.fat}g G
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-400">{food.calories} kcal</span>
                            {canEdit && (
                              <button
                                onClick={() => onRemoveFood(selectedDate, food.id)}
                                className="p-1 text-slate-500 hover:text-rose-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: ASISTENTE "¿QUÉ PUEDO COMER AHORA?" */}
      {activeSection === 'assistant' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Asistente Inteligente de Comidas</h3>
              <p className="text-xs text-slate-400">
                Sugerencias personalizadas según tus macros restantes de hoy
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs text-slate-400">Tus macros restantes para hoy:</span>
              <div className="flex items-center gap-4 text-sm font-bold mt-1">
                <span className="text-amber-400">{remainingCalories} kcal</span>
                <span className="text-rose-400">{remainingProtein}g Proteína</span>
                <span className="text-sky-400">{remainingCarbs}g Carbos</span>
                <span className="text-emerald-400">{remainingFat}g Grasas</span>
              </div>
            </div>

            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg border border-amber-500/30">
              {remainingProtein > 30 ? 'Enfoque Alta Proteína Requerido' : 'Macros Equilibrados'}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white">Ideas de Comidas Óptimas para Completar el Día:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FITNESS_RECIPES.slice(0, 4).map(rec => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecipe(rec)}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-white text-xs group-hover:text-amber-300">
                      {rec.title}
                    </h5>
                    <span className="text-xs text-amber-400 font-bold">{rec.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="text-rose-400 font-bold">{rec.protein}g Proteína</span>
                    <span>{rec.carbs}g Carbos</span>
                    <span>{rec.fat}g Grasa</span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {rec.prep_time_minutes} min
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {rec.ingredients.slice(0, 3).join(', ')}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 3: RECETARIO FITNESS COMPLETO */}
      {activeSection === 'recipes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FITNESS_RECIPES.map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecipe(rec)}
                className="glass-panel p-5 rounded-2xl space-y-3 hover:border-amber-500/50 cursor-pointer transition-all bg-slate-900/60 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {rec.category}
                    </span>
                    <span className="text-xs font-bold text-amber-400">{rec.calories} kcal</span>
                  </div>
                  <h4 className="font-bold text-white text-sm leading-snug">{rec.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-300 pt-1">
                    <span className="text-rose-400 font-bold">{rec.protein}g Proteína</span>
                    <span className="text-sky-400">{rec.carbs}g C</span>
                    <span className="text-emerald-400">{rec.fat}g G</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {rec.prep_time_minutes} min
                  </span>
                  <span className="text-amber-400 font-semibold">Ver Receta →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE RECETA */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  {selectedRecipe.category}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedRecipe.title}</h3>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Macros Badge */}
            <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-800/60 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Calorías</span>
                <span className="font-bold text-amber-400">{selectedRecipe.calories} kcal</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Proteína</span>
                <span className="font-bold text-rose-400">{selectedRecipe.protein}g</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Carbos</span>
                <span className="font-bold text-sky-400">{selectedRecipe.carbs}g</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Grasas</span>
                <span className="font-bold text-emerald-400">{selectedRecipe.fat}g</span>
              </div>
            </div>

            {/* Ingredientes */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Ingredientes:</h4>
              <ul className="text-xs text-slate-300 space-y-1 pl-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <li key={i}>• {ing}</li>
                ))}
              </ul>
            </div>

            {/* Instrucciones */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Preparación Paso a Paso:</h4>
              <ol className="text-xs text-slate-300 space-y-1.5 pl-2 list-decimal list-inside">
                {selectedRecipe.instructions.map((step, i) => (
                  <li key={i} className="leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => setSelectedRecipe(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR ALIMENTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" /> Añadir Alimento al Diario
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Selector rápido de alimentos comunes */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400">Atajo: Alimentos Frecuentes</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
                {filteredCommonFoods.slice(0, 5).map((cf, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCommonFood(cf)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap text-[11px]"
                  >
                    {cf.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Toma del Día</label>
                <select
                  value={foodMealType}
                  onChange={e => setFoodMealType(e.target.value as MealType)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="breakfast">Desayuno</option>
                  <option value="lunch">Almuerzo / Comida</option>
                  <option value="snack">Merienda / Snack</option>
                  <option value="dinner">Cena</option>
                  <option value="post_workout">Post-Entreno</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Nombre del Alimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pechuga de Pollo 200g"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Calorías (kcal)</label>
                  <input
                    type="number"
                    value={foodCalories}
                    onChange={e => setFoodCalories(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Proteína (g)</label>
                  <input
                    type="number"
                    value={foodProtein}
                    onChange={e => setFoodProtein(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-rose-400 font-bold focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400">Carbohidratos (g)</label>
                  <input
                    type="number"
                    value={foodCarbs}
                    onChange={e => setFoodCarbs(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sky-400 font-bold focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Grasas (g)</label>
                  <input
                    type="number"
                    value={foodFat}
                    onChange={e => setFoodFat(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400">Porción / Cantidad</label>
                <input
                  type="text"
                  placeholder="Ej. 1 plato grande / 150g"
                  value={foodPortion}
                  onChange={e => setFoodPortion(e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
