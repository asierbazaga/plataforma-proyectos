import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Droplet,
  Sparkles,
  BookOpen,
  Search,
  CheckCircle2,
  Zap,
  Clock,
  Lightbulb,
  ArrowUpRight,
  Camera
} from 'lucide-react';
import { DailyNutritionLog, FoodEntry, MealType, FitnessProfile, FitnessRecipe } from '../../../types';
import { FITNESS_RECIPES } from '../data/fitnessRecipes';
import { MacroRings } from './MacroRings';
import { FoodPhotoScannerModal } from './FoodPhotoScannerModal';

interface NutritionTrackerProps {
  profile: FitnessProfile;
  canEdit: boolean;
  currentLog: DailyNutritionLog;
  onAddFood: (date: string, food: Omit<FoodEntry, 'id'>) => Promise<void>;
  onRemoveFood: (date: string, foodId: string) => Promise<void>;
  onUpdateWater: (date: string, amountMl: number) => Promise<void>;
  initialOpenModal?: boolean;
}

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
  const [activeSection, setActiveSection] = useState<'tracker' | 'assistant' | 'recipes'>('tracker');
  const [showAddModal, setShowAddModal] = useState(initialOpenModal);
  const [showPhotoScanner, setShowPhotoScanner] = useState(false);

  // Form State
  const [foodMealType, setFoodMealType] = useState<MealType>('lunch');
  const [foodName, setFoodName] = useState('');
  const [foodCalories, setFoodCalories] = useState<number | ''>(250);
  const [foodProtein, setFoodProtein] = useState<number | ''>(25);
  const [foodCarbs, setFoodCarbs] = useState<number | ''>(25);
  const [foodFat, setFoodFat] = useState<number | ''>(5);
  const [foodPortion, setFoodPortion] = useState('1 ración');
  const [selectedRecipe, setSelectedRecipe] = useState<FitnessRecipe | null>(null);

  const totalCalories = currentLog.meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = currentLog.meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = currentLog.meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = currentLog.meals.reduce((acc, m) => acc + m.fat, 0);

  const remainingCalories = Math.max(0, profile.target_calories - totalCalories);
  const remainingProtein = Math.max(0, profile.target_protein - totalProtein);
  const remainingCarbs = Math.max(0, profile.target_carbs - totalCarbs);
  const remainingFat = Math.max(0, profile.target_fat - totalFat);

  const calPct = Math.round((totalCalories / profile.target_calories) * 100) || 0;
  const proPct = Math.round((totalProtein / profile.target_protein) * 100) || 0;
  const carbPct = Math.round((totalCarbs / profile.target_carbs) * 100) || 0;
  const fatPct = Math.round((totalFat / profile.target_fat) * 100) || 0;

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    await onAddFood(selectedDate, {
      meal_type: foodMealType,
      name: foodName,
      calories: Number(foodCalories) || 0,
      protein: Number(foodProtein) || 0,
      carbs: Number(foodCarbs) || 0,
      fat: Number(foodFat) || 0,
      portion_size: foodPortion
    });

    setFoodName('');
    setShowAddModal(false);
  };

  const handleApplyFromPhotoScan = (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion_size: string;
  }) => {
    setFoodName(food.name);
    setFoodCalories(food.calories);
    setFoodProtein(food.protein);
    setFoodCarbs(food.carbs);
    setFoodFat(food.fat);
    setFoodPortion(food.portion_size);
    setShowAddModal(true);
  };

  const mealCategories: { key: MealType; label: string; icon: string }[] = [
    { key: 'breakfast', label: 'Desayuno', icon: '☀️' },
    { key: 'lunch', label: 'Almuerzo / Comida', icon: '🍲' },
    { key: 'snack', label: 'Merienda & Snacks', icon: '🍎' },
    { key: 'dinner', label: 'Cena', icon: '🌙' },
    { key: 'post_workout', label: 'Post-Entreno', icon: '⚡' }
  ];

  return (
    <div className="space-y-7">
      {/* Sub-Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#111622] p-4 rounded-3xl border border-white/5 shadow-md">
        <div className="flex items-center gap-2 bg-[#090C15] p-1.5 rounded-2xl border border-white/5 text-xs">
          <button
            onClick={() => setActiveSection('tracker')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeSection === 'tracker' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Diario de Comidas
          </button>
          <button
            onClick={() => setActiveSection('assistant')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeSection === 'assistant' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            ¿Qué comer ahora?
          </button>
          <button
            onClick={() => setActiveSection('recipes')}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeSection === 'recipes' ? 'bg-[#FF6B00] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recetario ({FITNESS_RECIPES.length})
          </button>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPhotoScanner(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-[#FF6B00]/20 hover:from-amber-500/30 hover:to-[#FF6B00]/30 text-white text-xs font-bold rounded-2xl border border-[#FF6B00]/30 shadow-lg transition-all"
            >
              <Camera className="w-4 h-4 text-[#FF6B00]" /> Escanear con Foto (IA)
            </button>

            <button
              onClick={() => {
                setFoodName('');
                setShowAddModal(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#FA8500] text-white text-xs font-bold rounded-2xl shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Añadir Manual
            </button>
          </div>
        )}
      </div>

      {/* 1. DIARIO */}
      {activeSection === 'tracker' && (
        <div className="space-y-6">
          {/* Header Scoreboard & Macro Rings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 rounded-3xl bg-[#111622] border border-white/5 shadow-xl">
            {/* Concentric Rings */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-2">
              <MacroRings
                caloriePct={calPct}
                proteinPct={proPct}
                carbsPct={carbPct}
                fatPct={fatPct}
                size={190}
              />
            </div>

            {/* Dials & Progress */}
            <div className="lg:col-span-8 space-y-4 flex flex-col justify-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance del Día</span>
                <div className="text-3xl font-black text-white font-mono mt-0.5">
                  {totalCalories} <span className="text-sm font-normal text-slate-400">/ {profile.target_calories} kcal</span>
                </div>
                <p className="text-xs text-amber-400 mt-0.5">Te quedan {remainingCalories} kcal para tu meta diaria.</p>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-[#090C15] border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#FF3B30]">Proteína</span>
                    <span className="text-white font-mono">{totalProtein}/{profile.target_protein}g</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF3B30] rounded-full" style={{ width: `${proPct}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#090C15] border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#38BDF8]">Carbos</span>
                    <span className="text-white font-mono">{totalCarbs}/{profile.target_carbs}g</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: `${carbPct}%` }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#090C15] border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#30D158]">Grasas</span>
                    <span className="text-white font-mono">{totalFat}/{profile.target_fat}g</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#30D158] rounded-full" style={{ width: `${fatPct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline de Tomas */}
          <div className="space-y-4">
            {mealCategories.map(cat => {
              const mealsInCat = currentLog.meals.filter(m => m.meal_type === cat.key);
              const catCalories = mealsInCat.reduce((acc, m) => acc + m.calories, 0);
              const catProtein = mealsInCat.reduce((acc, m) => acc + m.protein, 0);

              return (
                <div key={cat.key} className="p-5 rounded-3xl bg-[#111622] border border-white/5 space-y-3 shadow-lg">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <h4 className="font-bold text-white text-sm">{cat.label}</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-amber-400">{catCalories} kcal</span>
                      <span className="text-xs font-mono text-slate-400">({catProtein}g P)</span>
                      {canEdit && (
                        <button
                          onClick={() => {
                            setFoodMealType(cat.key);
                            setFoodName('');
                            setShowAddModal(true);
                          }}
                          className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {mealsInCat.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-1">Sin alimentos registrados.</p>
                  ) : (
                    <div className="space-y-2">
                      {mealsInCat.map(food => (
                        <div key={food.id} className="flex justify-between items-center p-3 rounded-2xl bg-[#090C15] border border-white/5 text-xs">
                          <div>
                            <p className="font-bold text-white text-sm">{food.name}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{food.portion_size} • {food.protein}g P | {food.carbs}g C | {food.fat}g G</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-amber-400 font-mono">{food.calories} kcal</span>
                            {canEdit && (
                              <button onClick={() => onRemoveFood(selectedDate, food.id)} className="text-slate-600 hover:text-[#FF3B30]">
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

      {/* 2. ASISTENTE */}
      {activeSection === 'assistant' && (
        <div className="p-7 rounded-3xl bg-[#111622] border border-white/5 space-y-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-[#FF6B00]" />
            <div>
              <h3 className="text-lg font-bold text-white">Sugerencia según tus macros restantes</h3>
              <p className="text-xs text-slate-400">Te quedan: {remainingCalories} kcal ({remainingProtein}g P, {remainingCarbs}g C, {remainingFat}g G)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {FITNESS_RECIPES.slice(0, 4).map(rec => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecipe(rec)}
                className="p-5 rounded-2xl bg-[#090C15] border border-white/5 hover:border-[#FF6B00]/40 cursor-pointer space-y-2"
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-bold text-white text-sm">{rec.title}</h5>
                  <span className="text-xs text-[#FF6B00] font-mono font-bold">{rec.calories} kcal</span>
                </div>
                <div className="flex gap-3 text-xs text-slate-400">
                  <span className="text-[#FF3B30] font-bold">{rec.protein}g P</span>
                  <span>{rec.carbs}g C</span>
                  <span>{rec.fat}g G</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RECETARIO */}
      {activeSection === 'recipes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FITNESS_RECIPES.map(rec => (
            <div
              key={rec.id}
              onClick={() => setSelectedRecipe(rec)}
              className="p-6 rounded-3xl bg-[#111622] border border-white/5 hover:border-white/20 cursor-pointer space-y-4 shadow-lg transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF6B00]/15 text-[#FF6B00]">
                  {rec.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">{rec.calories} kcal</span>
              </div>
              <h4 className="font-bold text-white text-base">{rec.title}</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-[#090C15] rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-slate-500 block">PRO</span>
                  <span className="font-bold text-[#FF3B30]">{rec.protein}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CARB</span>
                  <span className="font-bold text-[#38BDF8]">{rec.carbs}g</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">FAT</span>
                  <span className="font-bold text-[#30D158]">{rec.fat}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOTO SCANNER */}
      <FoodPhotoScannerModal
        isOpen={showPhotoScanner}
        onClose={() => setShowPhotoScanner(false)}
        onApplyFood={handleApplyFromPhotoScan}
      />

      {/* MODAL AÑADIR COMIDA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-white/10 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h4 className="font-bold text-white text-base">Registrar Alimento</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Banner Escáner */}
            <div
              onClick={() => {
                setShowAddModal(false);
                setShowPhotoScanner(true);
              }}
              className="p-3 rounded-2xl bg-gradient-to-r from-[#FF6B00]/15 to-amber-500/10 border border-[#FF6B00]/30 hover:border-[#FF6B00] cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 text-xs">
                <Camera className="w-4 h-4 text-[#FF6B00]" />
                <div>
                  <p className="font-bold text-white">¿No sabes los macros?</p>
                  <p className="text-[11px] text-slate-400">Escanea la comida con una foto</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 bg-[#FF6B00] text-white rounded-lg">📸 Escanear</span>
            </div>

            <form onSubmit={handleSaveFood} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400">Toma</label>
                <select
                  value={foodMealType}
                  onChange={e => setFoodMealType(e.target.value as MealType)}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white"
                >
                  <option value="breakfast">Desayuno</option>
                  <option value="lunch">Almuerzo / Comida</option>
                  <option value="snack">Merienda</option>
                  <option value="dinner">Cena</option>
                  <option value="post_workout">Post-Entreno</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Pechuga de Pollo con Arroz"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400">Ración / Cantidad</label>
                <input
                  type="text"
                  placeholder="Ej. 1 plato mediano (300g)"
                  value={foodPortion}
                  onChange={e => setFoodPortion(e.target.value)}
                  className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Calorías (kcal)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={foodCalories}
                    onFocus={e => e.target.select()}
                    onChange={e => setFoodCalories(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-amber-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Proteína (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={foodProtein}
                    onFocus={e => e.target.select()}
                    onChange={e => setFoodProtein(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-[#FF3B30] font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400">Carbos (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={foodCarbs}
                    onFocus={e => e.target.select()}
                    onChange={e => setFoodCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-[#38BDF8] font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400">Grasas (g)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={foodFat}
                    onFocus={e => e.target.select()}
                    onChange={e => setFoodFat(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full mt-1 bg-[#090C15] border border-white/5 rounded-xl px-3 py-2 text-[#30D158] font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-[#FF6B00] text-white font-bold rounded-xl">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
