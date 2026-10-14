import React, { useState } from 'react';
import { X, Save, Calculator, Clock, Sparkles, ChefHat } from 'lucide-react';
import { FitnessRecipe, MealType } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { estimateMacrosFromText } from '../../../services/aiRecipeService';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialRecipe?: FitnessRecipe;
}

export const AddRecipeModal: React.FC<Props> = ({ onClose, onSuccess, initialRecipe }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: initialRecipe?.title || '',
    category: (initialRecipe?.category || 'lunch') as MealType,
    calories: initialRecipe?.calories || 0,
    protein: initialRecipe?.protein || 0,
    carbs: initialRecipe?.carbs || 0,
    fat: initialRecipe?.fat || 0,
    prep_time_minutes: initialRecipe?.prep_time_minutes || 15,
    difficulty: initialRecipe?.difficulty || 'Media' as 'Fácil' | 'Media' | 'Difícil',
    ingredientsText: initialRecipe?.ingredients?.join('\n') || '',
    instructionsText: initialRecipe?.instructions?.join('\n') || '',
    tagsText: initialRecipe?.tags?.join(', ') || 'Manual',
    image_url: initialRecipe?.image_url || ''
  });

  const handleCalculateMacros = () => {
    if (!formData.ingredientsText.trim()) {
      addToast('Añade primero algunos ingredientes con sus cantidades (ej. 150g pollo, 60g arroz)', 'warning');
      return;
    }
    const macros = estimateMacrosFromText(formData.ingredientsText);
    setFormData(prev => ({
      ...prev,
      ...macros
    }));
    addToast('¡Macros calculados automáticamente a partir de los ingredientes!', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('El título de la receta es obligatorio', 'warning');
      return;
    }

    const tags = formData.tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newRecipe: Partial<FitnessRecipe> = {
      ...(initialRecipe ? { id: initialRecipe.id } : {}),
      title: formData.title.trim(),
      category: formData.category,
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      prep_time_minutes: Number(formData.prep_time_minutes) || 15,
      difficulty: formData.difficulty,
      ingredients: formData.ingredientsText.split('\n').map(s => s.trim()).filter(Boolean),
      instructions: formData.instructionsText.split('\n').map(s => s.trim()).filter(Boolean),
      tags: tags.length > 0 ? tags : ['Manual'],
      image_url: formData.image_url.trim() || undefined
    };

    try {
      await storageService.saveSharedRecipe(newRecipe, currentUser?.id);
      addToast(initialRecipe ? 'Receta actualizada con éxito.' : 'Receta creada correctamente.', 'success');
      onSuccess();
    } catch (err) {
      addToast('Error al guardar la receta.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar relative shadow-2xl shadow-black/60 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20 text-white">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialRecipe ? 'Editar Receta' : 'Añadir Nueva Receta'}
              </h2>
              <p className="text-xs text-slate-400">
                Personaliza ingredientes, instrucciones y valores nutricionales
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Título & Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Título de la Receta *
              </label>
              <input 
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej. Tacos de pollo con aguacate y lima"
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 transition-all text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as MealType })}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 transition-all text-sm"
              >
                <option value="breakfast">🥞 Desayuno</option>
                <option value="lunch">🍲 Comida / Almuerzo</option>
                <option value="dinner">🥗 Cena</option>
                <option value="snack">🍰 Snack / Postre</option>
                <option value="post_workout">⚡ Post-Entreno</option>
              </select>
            </div>
          </div>

          {/* Tiempo, Dificultad, Tags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                <span>Tiempo (minutos)</span>
              </label>
              <input 
                type="number" 
                min={1} 
                required 
                value={formData.prep_time_minutes} 
                onChange={e => setFormData({ ...formData, prep_time_minutes: Number(e.target.value) })} 
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Dificultad
              </label>
              <select 
                value={formData.difficulty} 
                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })} 
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm"
              >
                <option value="Fácil">🟢 Fácil</option>
                <option value="Media">🟡 Media</option>
                <option value="Difícil">🔴 Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Etiquetas (separadas por coma)
              </label>
              <input 
                value={formData.tagsText} 
                onChange={e => setFormData({ ...formData, tagsText: e.target.value })} 
                placeholder="Ej. Airfryer, Alta Proteína, Rápido"
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm" 
              />
            </div>
          </div>

          {/* Ingredientes & Auto-calcular Macros */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Ingredientes (uno por línea)
              </label>
              <button 
                type="button"
                onClick={handleCalculateMacros}
                className="text-xs bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-400 hover:text-orange-300 hover:from-orange-500/30 hover:to-rose-500/30 border border-orange-500/30 px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <Calculator className="w-3.5 h-3.5 text-orange-400" />
                <span className="font-semibold">Auto-Calcular Macros</span>
              </button>
            </div>
            <textarea 
              rows={4}
              required
              placeholder={"150g pechuga de pollo\n50g arroz jazmín\n1 cucharada de aceite de oliva\n100g brócoli"}
              value={formData.ingredientsText}
              onChange={e => setFormData({ ...formData, ingredientsText: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm resize-y font-mono" 
            />
          </div>

          {/* Valores Nutricionales (Macros) */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Información Nutricional</span>
              </span>
              <span className="text-[11px] text-slate-400">Por ración completa</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/90 border border-orange-500/30 p-2.5 rounded-xl text-center">
                <label className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">Calorías</label>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    min={0}
                    required 
                    value={formData.calories} 
                    onChange={e => setFormData({ ...formData, calories: Number(e.target.value) })} 
                    className="w-16 bg-transparent text-center font-bold text-white text-base focus:outline-none focus:bg-slate-800 rounded" 
                  />
                  <span className="text-xs text-slate-400">kcal</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-indigo-500/30 p-2.5 rounded-xl text-center">
                <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Proteína</label>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    min={0}
                    required 
                    value={formData.protein} 
                    onChange={e => setFormData({ ...formData, protein: Number(e.target.value) })} 
                    className="w-16 bg-transparent text-center font-bold text-white text-base focus:outline-none focus:bg-slate-800 rounded" 
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                <label className="block text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Carbos</label>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    min={0}
                    required 
                    value={formData.carbs} 
                    onChange={e => setFormData({ ...formData, carbs: Number(e.target.value) })} 
                    className="w-16 bg-transparent text-center font-bold text-white text-base focus:outline-none focus:bg-slate-800 rounded" 
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
              <div className="bg-slate-900/90 border border-amber-500/30 p-2.5 rounded-xl text-center">
                <label className="block text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">Grasas</label>
                <div className="flex items-center justify-center gap-1">
                  <input 
                    type="number" 
                    min={0}
                    required 
                    value={formData.fat} 
                    onChange={e => setFormData({ ...formData, fat: Number(e.target.value) })} 
                    className="w-16 bg-transparent text-center font-bold text-white text-base focus:outline-none focus:bg-slate-800 rounded" 
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Instrucciones / Pasos de Preparación (uno por línea)
            </label>
            <textarea 
              rows={4}
              required
              placeholder={"1. Corta los ingredientes en dados pequeños.\n2. Cocina en la sartén o airfryer a 180°C durante 12 minutos.\n3. Emplata y sazona con tus especias favoritas."}
              value={formData.instructionsText}
              onChange={e => setFormData({ ...formData, instructionsText: e.target.value })}
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm resize-y" 
            />
          </div>

          {/* URL de Imagen (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              URL de Foto (Opcional)
            </label>
            <input 
              value={formData.image_url}
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://ejemplo.com/foto-receta.jpg"
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-sm" 
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-medium transition-colors text-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 flex items-center space-x-2 text-sm"
            >
              <Save className="w-4 h-4" />
              <span>{initialRecipe ? 'Guardar Cambios' : 'Crear Receta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
