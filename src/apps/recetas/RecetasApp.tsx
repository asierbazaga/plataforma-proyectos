import React, { useState, useEffect, useMemo } from "react";
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
  Calculator,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { FitnessRecipe } from "../../types";
import { FITNESS_RECIPES } from "../fitness/data/fitnessRecipes";
import { generateRecipeWithAI, estimateMacrosFromText } from "../../services/aiRecipeService";
import { useToast } from "../../context/ToastContext";
import { storageService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { AddRecipeModal } from "./components/AddRecipeModal";

type Tab = "my_recipes" | "ai_chef";
type CategoryFilter = "all" | "breakfast" | "lunch" | "dinner" | "snack" | "airfryer";

interface RecetasAppProps {
  onBack?: () => void;
}

// Resolver inteligente de categoría para asignar un toque visual distintivo pero sutil
const getRecipeCategoryInfo = (recipe: FitnessRecipe) => {
  const cat = recipe.category;
  const text = `${recipe.title} ${recipe.tags?.join(" ") || ""}`.toLowerCase();

  if (text.includes("freidora") || text.includes("airfryer")) {
    return {
      label: "Airfryer",
      icon: "💨",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      accentColor: "from-amber-500 via-orange-500 to-amber-600",
    };
  }
  if (cat === "breakfast" || text.includes("desayuno") || text.includes("avena") || text.includes("tortita") || text.includes("tostada")) {
    return {
      label: "Desayuno",
      icon: "🥣",
      color: "text-amber-300 bg-amber-500/10 border-amber-500/25",
      accentColor: "from-amber-400 via-orange-400 to-rose-400",
    };
  }
  if (cat === "dinner" || text.includes("cena") || text.includes("ensalada") || text.includes("salmón") || text.includes("sepia")) {
    return {
      label: "Cena",
      icon: "🥗",
      color: "text-teal-400 bg-teal-500/10 border-teal-500/25",
      accentColor: "from-teal-400 via-cyan-500 to-blue-500",
    };
  }
  if (cat === "snack" || text.includes("postre") || text.includes("flan") || text.includes("cheesecake") || text.includes("dulce")) {
    return {
      label: "Postre / Snack",
      icon: "🍰",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/25",
      accentColor: "from-rose-500 via-pink-500 to-orange-400",
    };
  }

  // Comida / Almuerzo por defecto
  return {
    label: "Comida",
    icon: "🍲",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/25",
    accentColor: "from-orange-500 via-rose-500 to-amber-500",
  };
};

export const RecetasApp: React.FC<RecetasAppProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<Tab>("my_recipes");
  const [recipes, setRecipes] = useState<FitnessRecipe[]>(() => {
    const local = storageService.getSharedRecipesSync ? storageService.getSharedRecipesSync() : [];
    const existingIds = new Set(local.map((r) => r.id));
    const examplesToAdd = FITNESS_RECIPES.filter((r) => !existingIds.has(r.id));
    return [...local, ...examplesToAdd];
  });

  const [selectedRecipe, setSelectedRecipe] = useState<FitnessRecipe | null>(null);
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<FitnessRecipe | null>(null);

  // Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // Modo Cocina: Checklist interactivo de ingredientes en modal
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});

  const { currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    const loadRecipes = async () => {
      let data = await storageService.getSharedRecipes();
      const existingIds = new Set(data.map((r) => r.id));
      const examplesToAdd = FITNESS_RECIPES.filter((r) => !existingIds.has(r.id));
      data = [...data, ...examplesToAdd];
      setRecipes(data);
    };

    loadRecipes();
    const unsubscribe = storageService.onSync(() => {
      loadRecipes();
    });

    return () => unsubscribe();
  }, []);

  // Reset checklist al abrir modal
  useEffect(() => {
    if (selectedRecipe) {
      setCheckedIngredients({});
    }
  }, [selectedRecipe]);

  // AI State
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<FitnessRecipe> | null>(null);

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
        addToast("Receta guardada en tu recetario.", "success");
        setGeneratedRecipe(null);
        setActiveTab("my_recipes");
      } catch (error) {
        addToast("Error al guardar la receta.", "error");
      }
    }
  };

  // Filtrado de recetas
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients?.some((ing) => ing.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((r) => {
        const text = `${r.title} ${r.tags?.join(" ") || ""} ${r.category || ""}`.toLowerCase();
        switch (categoryFilter) {
          case "breakfast":
            return r.category === "breakfast" || text.includes("desayuno") || text.includes("avena") || text.includes("bowl");
          case "lunch":
            return r.category === "lunch" || text.includes("almuerzo") || text.includes("comida") || text.includes("arroz") || text.includes("pollo");
          case "dinner":
            return r.category === "dinner" || text.includes("cena") || text.includes("ensalada") || text.includes("salmón") || text.includes("sepia");
          case "snack":
            return r.category === "snack" || text.includes("snack") || text.includes("postre") || text.includes("flan") || text.includes("cheesecake");
          case "airfryer":
            return text.includes("freidora") || text.includes("airfryer") || text.includes("aire");
          default:
            return true;
        }
      });
    }

    return result;
  }, [recipes, searchQuery, categoryFilter]);

  const toggleIngredientCheck = (idx: number) => {
    const key = `item-${idx}`;
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="h-full flex flex-col space-y-5">
      {/* Cabecera Limpia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Recetas & Nutrición
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Descubre, guarda y crea nuevas recetas equilibradas con IA.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setRecipeToEdit(null);
              setShowAddManualModal(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Receta</span>
          </button>
          <div className="p-2.5 bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl shadow-lg shadow-orange-500/20 text-white">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Barra de Controles: Tabs + Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Selector de Pestañas */}
        <div className="flex space-x-1.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60 w-fit">
          <button
            onClick={() => setActiveTab("my_recipes")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "my_recipes"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-slate-700/40"
            }`}
          >
            <Search className="w-4 h-4 text-orange-400" />
            <span>Mi Recetario</span>
            <span className="text-xs px-1.5 py-0.5 bg-slate-900/70 text-gray-300 rounded-md font-bold ml-1">
              {recipes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ai_chef")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "ai_chef"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-slate-700/40"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Chef IA</span>
          </button>
        </div>

        {/* Buscador Compacto */}
        {activeTab === "my_recipes" && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por receta o ingrediente..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/50 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Píldoras de Categoría con estilo moderno */}
      {activeTab === "my_recipes" && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs custom-scrollbar">
          {[
            { id: "all", label: "Todas" },
            { id: "breakfast", label: "Desayunos" },
            { id: "lunch", label: "Comidas" },
            { id: "dinner", label: "Cenas" },
            { id: "snack", label: "Snacks & Postres" },
            { id: "airfryer", label: "Freidora de Aire" },
          ].map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all duration-200 border ${
                  active
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 border-transparent"
                    : "bg-slate-800/70 text-gray-400 hover:text-white hover:bg-slate-700/60 border-slate-700/60"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Recetas con Toque Visual Refinado */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-10 pr-1 custom-scrollbar">
        {activeTab === "my_recipes" ? (
          <>
            {filteredRecipes.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center max-w-sm mx-auto my-8">
                <Search className="w-8 h-8 text-gray-500 mb-3" />
                <p className="text-white font-semibold text-base mb-1">
                  No se encontraron recetas
                </p>
                <p className="text-gray-400 text-xs mb-4">
                  Prueba a buscar con otro término o categoría.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                  className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecipes.map((recipe) => {
                  const catInfo = getRecipeCategoryInfo(recipe);

                  // Cálculo proporcional de la mini-barra de macros (P / C / G)
                  const pG = Number(recipe.protein) || 0;
                  const cG = Number(recipe.carbs) || 0;
                  const fG = Number(recipe.fat) || 0;
                  const totalG = pG + cG + fG;
                  const pPct = totalG > 0 ? Math.round((pG / totalG) * 100) : 33;
                  const cPct = totalG > 0 ? Math.round((cG / totalG) * 100) : 33;
                  const fPct = totalG > 0 ? Math.max(0, 100 - pPct - cPct) : 34;

                  return (
                    <div
                      key={recipe.id}
                      className="group bg-gradient-to-b from-slate-800/95 to-slate-900/95 hover:from-slate-800 hover:to-slate-850 border border-slate-700/70 hover:border-orange-500/40 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 flex flex-col justify-between relative overflow-hidden"
                    >
                      {/* Línea sutil de acento temático superior */}
                      <div className={`h-1 w-full bg-gradient-to-r ${catInfo.accentColor}`} />

                      {/* Imagen si está disponible */}
                      {recipe.image_url && (
                        <div className="h-36 overflow-hidden relative bg-slate-900 border-b border-slate-700/60">
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent" />
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Fila Superior: Badge Categoría + Badge Calorías */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span
                              className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catInfo.color}`}
                            >
                              <span>{catInfo.icon}</span>
                              <span>{catInfo.label}</span>
                            </span>

                            <div className="flex-shrink-0 bg-orange-500/10 border border-orange-500/25 px-2.5 py-0.5 rounded-full text-xs font-bold text-orange-400 flex items-center space-x-1 shadow-sm">
                              <Flame className="w-3.5 h-3.5 text-orange-400" />
                              <span>{recipe.calories} kcal</span>
                            </div>
                          </div>

                          {/* Título de la Receta */}
                          <h3 className="font-bold text-base md:text-lg text-white leading-snug line-clamp-2 mb-2 group-hover:text-orange-300 transition-colors">
                            {recipe.title}
                          </h3>

                          {/* Metadatos: Tiempo y Dificultad */}
                          <div className="flex items-center space-x-3 text-xs text-gray-400 mb-3.5">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5 text-orange-400/80" />
                              <span className="text-gray-300">{recipe.prep_time_minutes} min</span>
                            </div>
                            {recipe.difficulty && (
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    recipe.difficulty === "Fácil"
                                      ? "bg-emerald-400"
                                      : recipe.difficulty === "Media"
                                      ? "bg-amber-400"
                                      : "bg-rose-400"
                                  }`}
                                />
                                <span className="text-gray-300">{recipe.difficulty}</span>
                              </div>
                            )}
                          </div>

                          {/* Tira Nutricional Refinada con Mini Barra Proporcional */}
                          <div className="my-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-700/60 shadow-inner">
                            {/* 3 Columnas de Macros */}
                            <div className="grid grid-cols-3 gap-1 text-center">
                              <div>
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                                  Prot
                                </span>
                                <span className="text-sm font-extrabold text-white mt-0.5 block">
                                  {recipe.protein}g
                                </span>
                              </div>
                              <div className="border-x border-slate-800">
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                                  Carbs
                                </span>
                                <span className="text-sm font-extrabold text-white mt-0.5 block">
                                  {recipe.carbs}g
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                  Grasas
                                </span>
                                <span className="text-sm font-extrabold text-white mt-0.5 block">
                                  {recipe.fat}g
                                </span>
                              </div>
                            </div>

                            {/* Mini Barra Visual de Distribución de Macros */}
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex mt-2.5">
                              <div
                                className="bg-indigo-500 h-full transition-all"
                                style={{ width: `${pPct}%` }}
                                title={`Proteína: ${pPct}%`}
                              />
                              <div
                                className="bg-emerald-500 h-full transition-all"
                                style={{ width: `${cPct}%` }}
                                title={`Carbohidratos: ${cPct}%`}
                              />
                              <div
                                className="bg-amber-500 h-full transition-all"
                                style={{ width: `${fPct}%` }}
                                title={`Grasas: ${fPct}%`}
                              />
                            </div>
                          </div>

                          {/* Etiquetas de la Receta */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {recipe.tags?.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-slate-800/80 border border-slate-700/60 rounded-md text-[11px] text-gray-300 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Botón Acción Ver Receta con Transición Glow */}
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="w-full mt-4 py-2.5 bg-slate-800/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 text-gray-200 hover:text-white rounded-xl transition-all duration-300 text-xs font-bold flex items-center justify-center space-x-2 border border-slate-700 hover:border-transparent hover:shadow-lg hover:shadow-orange-500/20"
                        >
                          <span>Ver Receta Completa</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Tarjeta Añadir Receta Manual Armónica */}
                <div
                  onClick={() => {
                    setRecipeToEdit(null);
                    setShowAddManualModal(true);
                  }}
                  className="bg-slate-800/30 border-2 border-dashed border-slate-700/80 hover:border-orange-500/60 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group min-h-[280px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
                    <Plus className="w-7 h-7 text-orange-400 group-hover:text-orange-300" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                    Añadir Receta Manual
                  </h3>
                  <p className="text-xs text-gray-400 text-center max-w-xs leading-relaxed">
                    Introduce tus propios platos y calcula automáticamente sus macronutrientes.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Chef IA Tab */
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/90 rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-purple-500/20">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Chef IA: Dime qué tienes en la nevera
                  </h2>
                  <p className="text-xs md:text-sm text-gray-400">
                    Escribe los ingredientes separados por comas y la IA creará una receta equilibrada para ti.
                  </p>
                </div>
              </div>

              {/* Sugerencias Rápidas */}
              <div className="mb-4">
                <span className="text-xs text-gray-400 block mb-2 font-medium">
                  Sugerencias rápidas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Pechuga de pollo, arroz, brócoli, salsa de soja",
                    "Huevos, aguacate, pan integral, tomate",
                    "Salmón, espárragos verdes, patata, limón",
                    "Avena, proteína en polvo, plátano, crema de cacahuete",
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIngredientsInput(sug)}
                      className="text-xs bg-slate-700/60 hover:bg-slate-700 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-600/50 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Ingredientes Disponibles
                  </label>
                  <textarea
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    placeholder="Ej. 2 pechugas de pollo, arroz, medio pimiento rojo, cebolla..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-28 text-sm"
                  />
                </div>
                <button
                  onClick={handleGenerateRecipe}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      <span>Generar Receta con IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resultado Receta IA */}
              {generatedRecipe && (
                <div className="bg-slate-900 rounded-xl p-5 border border-purple-500/30 relative">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {generatedRecipe.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-purple-400 border border-purple-500/20">
                      {generatedRecipe.category || "Fitness"}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-orange-400 border border-orange-500/20">
                      🔥 {generatedRecipe.calories} kcal
                    </span>
                    <span className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                      ⏱ {generatedRecipe.prep_time_minutes} min
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider text-gray-300">
                        Ingredientes
                      </h4>
                      <ul className="space-y-1.5 text-xs text-gray-300">
                        {generatedRecipe.ingredients?.map((ing, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="text-purple-400">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider text-gray-300">
                        Macros Estimados
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-800 p-2 rounded-lg">
                          <span className="text-[10px] text-indigo-400 font-bold block">P</span>
                          <span className="text-sm font-bold text-white">{generatedRecipe.protein}g</span>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-lg">
                          <span className="text-[10px] text-emerald-400 font-bold block">C</span>
                          <span className="text-sm font-bold text-white">{generatedRecipe.carbs}g</span>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-lg">
                          <span className="text-[10px] text-amber-400 font-bold block">G</span>
                          <span className="text-sm font-bold text-white">{generatedRecipe.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <h4 className="font-bold text-white mb-2 text-xs uppercase tracking-wider text-gray-300">
                      Instrucciones
                    </h4>
                    <ol className="space-y-2 text-xs text-gray-300">
                      {generatedRecipe.instructions?.map((inst, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-purple-400 font-bold">{idx + 1}.</span>
                          <span>{inst}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={handleSaveAiRecipe}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 text-sm shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar en Mi Recetario</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detallado de Receta */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative shadow-2xl">
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white rounded-full transition-colors z-10 border border-slate-700"
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

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-3 pr-8">
                  {selectedRecipe.title}
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1 bg-orange-500/10 rounded-full text-xs font-semibold text-orange-400 border border-orange-500/20 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{selectedRecipe.calories} kcal</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{selectedRecipe.prep_time_minutes} min</span>
                  </span>
                  {selectedRecipe.difficulty && (
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-300 border border-slate-700">
                      🎓 {selectedRecipe.difficulty}
                    </span>
                  )}
                  {selectedRecipe.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-800 rounded-full text-xs font-medium text-gray-400 border border-slate-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Macros Row en el Modal con auto-recalcular */}
              <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                    Macronutrientes
                  </h4>
                  <button
                    onClick={async () => {
                      const newMacros = estimateMacrosFromText(selectedRecipe.ingredients?.join("\n") || "");
                      const updatedRecipe = { ...selectedRecipe, ...newMacros };
                      await storageService.saveSharedRecipe(updatedRecipe, currentUser?.id);
                      setSelectedRecipe(updatedRecipe);
                      addToast("Macros recalculados y guardados", "success");
                    }}
                    className="text-xs bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 border border-orange-500/30"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Recalcular</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-xs font-bold text-indigo-400 block">Proteína</span>
                    <span className="text-lg font-bold text-white mt-0.5 block">{selectedRecipe.protein}g</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-xs font-bold text-emerald-400 block">Carbos</span>
                    <span className="text-lg font-bold text-white mt-0.5 block">{selectedRecipe.carbs}g</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/50">
                    <span className="text-xs font-bold text-amber-400 block">Grasas</span>
                    <span className="text-lg font-bold text-white mt-0.5 block">{selectedRecipe.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Ingredientes con Checklist Interactivo */}
              <div>
                <h4 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider text-gray-300">
                  Ingredientes (toca para marcar)
                </h4>
                <div className="space-y-1.5 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                  {selectedRecipe.ingredients?.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[`item-${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredientCheck(idx)}
                        className={`flex items-center space-x-2.5 p-1.5 rounded-lg cursor-pointer transition-colors text-sm select-none ${
                          isChecked
                            ? "text-gray-500 line-through"
                            : "hover:bg-slate-800/50 text-gray-200"
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        )}
                        <span>{ing}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrucciones */}
              <div>
                <h4 className="font-bold text-white mb-2.5 text-xs uppercase tracking-wider text-gray-300">
                  Instrucciones
                </h4>
                <ol className="space-y-2.5">
                  {selectedRecipe.instructions?.map((inst, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-300 flex items-start space-x-3 bg-slate-800/30 p-2.5 rounded-xl border border-slate-700/40"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-xs font-bold text-orange-400">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    setRecipeToEdit(selectedRecipe);
                    setSelectedRecipe(null);
                    setShowAddManualModal(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center space-x-2 text-xs font-semibold border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={async () => {
                    if (window.confirm("¿Estás seguro de que deseas eliminar esta receta?")) {
                      await storageService.deleteSharedRecipe(selectedRecipe.id);
                      setSelectedRecipe(null);
                      addToast("Receta eliminada correctamente", "success");
                    }
                  }}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors flex items-center space-x-2 text-xs font-semibold border border-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add / Edit Modal */}
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
