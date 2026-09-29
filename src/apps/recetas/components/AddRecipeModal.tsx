import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { FitnessRecipe } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { storageService } from '../../../services/storageService';
import { useAuth } from '../../../context/AuthContext';
import { estimateMacrosFromText } from '../../../services/aiRecipeService';
import { Calculator } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRecipeModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'lunch' as any,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    prep_time_minutes: 15,
    difficulty: 'Media' as any,
    ingredientsText: '',
    instructionsText: ''
  });

  const handleCalculateMacros = () => {
    if (!formData.ingredientsText.trim()) {
      addToast('Añade primero algunos ingredientes con sus cantidades (ej. 150g pollo)', 'warning');
      return;
    }
    const macros = estimateMacrosFromText(formData.ingredientsText);
    setFormData(prev => ({
      ...prev,
      ...macros
    }));
    addToast('Macros calculados automáticamente basándose en los ingredientes', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const newRecipe: Partial<FitnessRecipe> = {
      title: formData.title,
      category: formData.category,
      calories: Number(formData.calories),
      protein: Number(formData.protein),
      carbs: Number(formData.carbs),
      fat: Number(formData.fat),
      prep_time_minutes: Number(formData.prep_time_minutes),
      difficulty: formData.difficulty,
      ingredients: formData.ingredientsText.split('\n').filter(Boolean),
      instructions: formData.instructionsText.split('\n').filter(Boolean),
      tags: ['Manual']
    };

    try {
      await storageService.saveSharedRecipe(newRecipe, currentUser?.id);
      addToast('Receta creada correctamente.', 'success');
      onSuccess();
    } catch (err) {
      addToast('Error al guardar.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl p-6">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Añadir Receta Manual</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Título</label>
            <input 
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Tiempo (min)</label>
              <input type="number" required value={formData.prep_time_minutes} onChange={e => setFormData({ ...formData, prep_time_minutes: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Dificultad</label>
              <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white">
                <option value="Fácil">Fácil</option>
                <option value="Media">Media</option>
                <option value="Difícil">Difícil</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-400">Ingredientes (uno por línea, añade cantidades ej. 150g)</label>
              <button 
                type="button"
                onClick={handleCalculateMacros}
                className="text-xs bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 px-3 py-1 rounded-md transition-colors flex items-center space-x-1"
              >
                <Calculator className="w-3 h-3" />
                <span>Auto-Calcular Macros</span>
              </button>
            </div>
            <textarea 
              rows={4}
              required
              value={formData.ingredientsText}
              onChange={e => setFormData({ ...formData, ingredientsText: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Calorías</label>
              <input type="number" required value={formData.calories} onChange={e => setFormData({ ...formData, calories: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Prot (g)</label>
              <input type="number" required value={formData.protein} onChange={e => setFormData({ ...formData, protein: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Carbs (g)</label>
              <input type="number" required value={formData.carbs} onChange={e => setFormData({ ...formData, carbs: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Grasas (g)</label>
              <input type="number" required value={formData.fat} onChange={e => setFormData({ ...formData, fat: Number(e.target.value) })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Instrucciones (una por línea)</label>
            <textarea 
              rows={4}
              required
              value={formData.instructionsText}
              onChange={e => setFormData({ ...formData, instructionsText: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white" 
            />
          </div>

          <button type="submit" className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2">
            <Save className="w-5 h-5" />
            <span>Guardar Receta</span>
          </button>
        </form>
      </div>
    </div>
  );
};
