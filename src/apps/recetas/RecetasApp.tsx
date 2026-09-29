import React, { useState, useEffect } from "react";
import {
  ChefHat,
  Wand2,
  Search,
  Plus,
  Clock,
  Flame,
  Info,
  Check,
  X,
  Trash2,
  Edit2,
} from "lucide-react";
import { FitnessRecipe } from "../../types";
import { FITNESS_RECIPES } from "../fitness/data/fitnessRecipes";
import { generateRecipeWithAI } from "../../services/aiRecipeService";
import { useToast } from "../../context/ToastContext";
import { storageService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { AddRecipeModal } from "./components/AddRecipeModal";

type Tab = "my_recipes" | "ai_chef";

interface RecetasAppProps {
  onBack?: () => void;
}

export const RecetasApp: React.FC<RecetasAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>("my_recipes");
  const [recipes, setRecipes] = useState<FitnessRecipe[]>(() => {
    const local = storageService.getSharedRecipesSync ? storageService.getSharedRecipesSync() : [];
    const existingIds = new Set(local.map(r => r.id));
    const examplesToAdd = FITNESS_RECIPES.filter(r => !existingIds.has(r.id));
    return [...local, ...examplesToAdd];
  });
  const [selectedRecipe, setSelectedRecipe] = useState<FitnessRecipe | null>(
    null,
  );
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<FitnessRecipe | null>(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    const loadRecipes = async () => {
      let data = await storageService.getSharedRecipes();
      
      // Siempre incluimos las recetas de ejemplo para que no desaparezcan,
      // filtrando para no duplicar si por casualidad tienen el mismo ID
      const existingIds = new Set(data.map(r => r.id));
      const examplesToAdd = FITNESS_RECIPES.filter(r => !existingIds.has(r.id));
      
      data = [...data, ...examplesToAdd];
      
      setRecipes(data);
    };

    loadRecipes();

    // Suscripción a cambios
    const unsubscribe = storageService.onSync(() => {
      loadRecipes();
    });

    return () => unsubscribe();
  }, []);

  // AI State
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] =
    useState<Partial<FitnessRecipe> | null>(null);
  const { addToast } = useToast();

  const handleGenerateRecipe = async () => {
    if (!ingredientsInput.trim()) {
      addToast("Por favor, introduce al menos un ingrediente.", "warning");
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);
    try {
      const ingredientsList = ingredientsInput
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);
      const newRecipe = await generateRecipeWithAI(ingredientsList);
      setGeneratedRecipe(newRecipe);
      addToast("¡Receta generada con éxito!", "success");
    } catch (error: any) {
      addToast(error.message || "Error al generar la receta.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAiRecipe = async () => {
    if (generatedRecipe) {
      try {
        await storageService.saveSharedRecipe(generatedRecipe, currentUser?.id);
        addToast("Receta guardada para todos los usuarios.", "success");
        setGeneratedRecipe(null);
        setActiveTab("my_recipes");
      } catch (error) {
        addToast("Error al guardar la receta.", "error");
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Recetas & Nutrición
          </h1>
          <p className="text-gray-400">
            Descubre, guarda y crea nuevas recetas con IA.
          </p>
        </div>
        <div className="p-3 bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-800/50 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("my_recipes")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "my_recipes"
              ? "bg-slate-700 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Mi Recetario</span>
        </button>
        <button
          onClick={() => setActiveTab("ai_chef")}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
            activeTab === "ai_chef"
              ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
              : "text-gray-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Chef IA</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-10 pr-2 custom-scrollbar">
        {activeTab === "my_recipes" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden hover:border-orange-500/50 transition-colors p-5 relative flex flex-col justify-between"
              >
                <div>
                  <div className="absolute top-4 right-4 bg-slate-900/80 px-2 py-1 rounded-full text-xs font-medium text-white border border-slate-700 flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span>{recipe.calories} kcal</span>
                  </div>
                  <h3 className="font-bold text-lg text-white mb-2 pr-20 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.prep_time_minutes} min</span>
                    </div>
                    {recipe.difficulty && (
                      <div className="flex items-center space-x-1">
                        <Info className="w-4 h-4" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center mb-4 text-xs font-medium border-t border-b border-slate-700/50 py-3">
                    <div>
                      <span className="block text-indigo-400">P</span>
                      <span className="text-white">{recipe.protein}g</span>
                    </div>
                    <div>
                      <span className="block text-emerald-400">C</span>
                      <span className="text-white">{recipe.carbs}g</span>
                    </div>
                    <div>
                      <span className="block text-amber-400">G</span>
                      <span className="text-white">{recipe.fat}g</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recipe.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-700 rounded-md text-[10px] text-gray-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setSelectedRecipe(recipe)}
                    className="w-full mt-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <span>Ver Receta Completa</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Add new card */}
            <div
              onClick={() => setShowAddManualModal(true)}
              className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 hover:border-orange-500/50 transition-colors cursor-pointer group min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Añadir Receta Manual
              </h3>
              <p className="text-sm text-gray-400 text-center">
                Introduce tu propia receta para tenerla siempre a mano.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Chef IA: Dime qué tienes en la nevera
                  </h2>
                  <p className="text-sm text-gray-400">
                    Escribe los ingredientes separados por comas y crearé una
                    receta para ti.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Ingredientes Disponibles
                  </label>
                  <textarea
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    placeholder="Ej. 2 pechugas de pollo, arroz, medio pimiento rojo, cebolla..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-32"
                  ></textarea>
                </div>
                <button
                  onClick={handleGenerateRecipe}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generar Receta Mágica</span>
                    </>
                  )}
                </button>
              </div>

              {generatedRecipe && (
                <div className="bg-slate-900 rounded-xl p-6 border border-purple-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {generatedRecipe.title}
                  </h3>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-purple-400 border border-purple-500/20">
                      {generatedRecipe.category}
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-orange-400 border border-orange-500/20">
                      {generatedRecipe.calories} kcal
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                      ⏱ {generatedRecipe.prep_time_minutes} min
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                      🎓 {generatedRecipe.difficulty || "Media"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                          🥘
                        </span>
                        <span>Ingredientes</span>
                      </h4>
                      <ul className="space-y-2">
                        {generatedRecipe.ingredients?.map((ing, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-300 flex items-start space-x-2"
                          >
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                          📝
                        </span>
                        <span>Macros</span>
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                          <span className="text-sm text-gray-400">
                            Proteínas
                          </span>
                          <span className="font-bold text-indigo-400">
                            {generatedRecipe.protein}g
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                          <span className="text-sm text-gray-400">
                            Carbohidratos
                          </span>
                          <span className="font-bold text-emerald-400">
                            {generatedRecipe.carbs}g
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg">
                          <span className="text-sm text-gray-400">Grasas</span>
                          <span className="font-bold text-amber-400">
                            {generatedRecipe.fat}g
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                        👨‍🍳
                      </span>
                      <span>Instrucciones</span>
                    </h4>
                    <ol className="space-y-4">
                      {generatedRecipe.instructions?.map((inst, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-gray-300 flex items-start space-x-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-gray-400">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{inst}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={handleSaveAiRecipe}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Guardar en Mi Recetario</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 rounded-full text-gray-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedRecipe.image_url && (
              <div className="w-full h-48 bg-slate-800">
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-4 pr-8">
                {selectedRecipe.title}
              </h2>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-orange-500/10 rounded-full text-xs font-medium text-orange-400 border border-orange-500/20">
                  {selectedRecipe.calories} kcal
                </span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                  ⏱ {selectedRecipe.prep_time_minutes} min
                </span>
                {selectedRecipe.difficulty && (
                  <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                    🎓 {selectedRecipe.difficulty}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                      🥘
                    </span>
                    <span>Ingredientes</span>
                  </h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients?.map((ing, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-300 flex items-start space-x-2"
                      >
                        <span className="text-orange-500 mt-0.5">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                      📝
                    </span>
                    <span>Macros</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-sm text-gray-400">Proteínas</span>
                      <span className="font-bold text-indigo-400">
                        {selectedRecipe.protein}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-sm text-gray-400">
                        Carbohidratos
                      </span>
                      <span className="font-bold text-emerald-400">
                        {selectedRecipe.carbs}g
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                      <span className="text-sm text-gray-400">Grasas</span>
                      <span className="font-bold text-amber-400">
                        {selectedRecipe.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs">
                    👨‍🍳
                  </span>
                  <span>Instrucciones</span>
                </h4>
                <ol className="space-y-4">
                  {selectedRecipe.instructions?.map((inst, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-300 flex items-start space-x-3"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-gray-400">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>


              <div className="mt-8 flex items-center justify-end space-x-3 pt-6 border-t border-slate-700/50">
                <button
                  onClick={() => {
                    setRecipeToEdit(selectedRecipe);
                    setSelectedRecipe(null);
                    setShowAddManualModal(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm('¿Estás seguro de que deseas eliminar esta receta?')) {
                      await storageService.deleteSharedRecipe(selectedRecipe.id);
                      setSelectedRecipe(null);
                      addToast('Receta eliminada correctamente', 'success');
                    }
                  }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddManualModal && (
        <AddRecipeModal
          initialRecipe={recipeToEdit || undefined}
          onClose={() => {
            setShowAddManualModal(false);
            setRecipeToEdit(null);
          }}
          onSuccess={() => {
            setShowAddManualModal(false);
            setRecipeToEdit(null);
          }}
        />
      )}
    </div>
  );
};
