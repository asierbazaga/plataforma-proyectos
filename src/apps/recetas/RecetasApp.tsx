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
  Sparkles,
  CheckCircle2,
  Circle,
  Utensils,
  Dumbbell,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { FitnessRecipe, MealType } from "../../types";
import { FITNESS_RECIPES } from "../fitness/data/fitnessRecipes";
import { generateRecipeWithAI, estimateMacrosFromText } from "../../services/aiRecipeService";
import { useToast } from "../../context/ToastContext";
import { storageService } from "../../services/storageService";
import { useAuth } from "../../context/AuthContext";
import { AddRecipeModal } from "./components/AddRecipeModal";

type Tab = "my_recipes" | "ai_chef";
type CategoryFilter = "all" | "breakfast" | "lunch" | "dinner" | "snack" | "airfryer" | "high_protein";
type SortOption = "default" | "quickest" | "protein" | "calories_asc" | "calories_desc";

interface RecetasAppProps {
  onBack?: () => void;
}

// Helpers visuales para categorías y temas de tarjetas
const getCategoryLabel = (category?: string) => {
  switch (category) {
    case "breakfast":
      return "Desayuno";
    case "lunch":
      return "Comida";
    case "dinner":
      return "Cena";
    case "snack":
      return "Snack / Postre";
    case "post_workout":
      return "Post-Entreno";
    default:
      return "Receta Fitness";
  }
};

const getRecipeVisualTheme = (recipe: FitnessRecipe) => {
  const text = `${recipe.title} ${recipe.tags?.join(" ") || ""} ${recipe.category || ""}`.toLowerCase();

  if (text.includes("freidora") || text.includes("airfryer") || text.includes("flan") || text.includes("cheesecake")) {
    return {
      gradient: "from-amber-600/30 via-orange-500/20 to-transparent",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      accentBorder: "group-hover:border-amber-500/50",
      emoji: "🥧",
      tagLabel: "Airfryer / Dulce"
    };
  }
  if (text.includes("ensalada") || text.includes("pepino") || text.includes("vegetal") || text.includes("verde")) {
    return {
      gradient: "from-emerald-600/30 via-teal-500/20 to-transparent",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      accentBorder: "group-hover:border-emerald-500/50",
      emoji: "🥗",
      tagLabel: "Fresco & Verde"
    };
  }
  if (text.includes("salmón") || text.includes("salmon") || text.includes("sepia") || text.includes("atún") || text.includes("pescado")) {
    return {
      gradient: "from-cyan-600/30 via-blue-500/20 to-transparent",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      accentBorder: "group-hover:border-cyan-500/50",
      emoji: "🐟",
      tagLabel: "Pescado & Mar"
    };
  }
  if (text.includes("pollo") || text.includes("panceta") || text.includes("carne") || text.includes("wok") || text.includes("ternera")) {
    return {
      gradient: "from-orange-600/30 via-rose-500/20 to-transparent",
      badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
      accentBorder: "group-hover:border-orange-500/50",
      emoji: "🍗",
      tagLabel: "Proteína / Caliente"
    };
  }
  if (text.includes("avena") || text.includes("bowl") || text.includes("tortita") || text.includes("breakfast") || recipe.category === "breakfast") {
    return {
      gradient: "from-indigo-600/30 via-purple-500/20 to-transparent",
      badgeColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
      accentBorder: "group-hover:border-indigo-500/50",
      emoji: "🥣",
      tagLabel: "Desayuno & Energía"
    };
  }

  return {
    gradient: "from-orange-600/25 via-slate-700/20 to-transparent",
    badgeColor: "text-orange-400 bg-orange-500/10 border-orange-500/30",
    accentBorder: "group-hover:border-orange-500/50",
    emoji: "🍳",
    tagLabel: getCategoryLabel(recipe.category)
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

  // Estados de Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  // Modo Cocina: Checklist interactivo de ingredientes
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

  // Reset checklist al abrir una nueva receta
  useEffect(() => {
    if (selectedRecipe) {
      setCheckedIngredients({});
    }
  }, [selectedRecipe]);

  // AI State
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Partial<FitnessRecipe> | null>(null);

  const handleGenerateRecipe = async (customPrompt?: string) => {
    const textToUse = customPrompt || ingredientsInput;
    if (!textToUse.trim()) {
      addToast("Por favor, introduce al menos un ingrediente.", "warning");
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);
    try {
      const ingredientsList = textToUse
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);
      const newRecipe = await generateRecipeWithAI(ingredientsList);
      setGeneratedRecipe(newRecipe);
      addToast("¡Receta mágica generada con éxito!", "success");
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

  // Cálculo de estadísticas globales
  const stats = useMemo(() => {
    const total = recipes.length;
    const quickRecipes = recipes.filter((r) => (r.prep_time_minutes || 0) <= 20).length;
    const highProtein = recipes.filter((r) => (r.protein || 0) >= 30).length;
    const avgCalories = total > 0 ? Math.round(recipes.reduce((acc, r) => acc + (r.calories || 0), 0) / total) : 0;
    return { total, quickRecipes, highProtein, avgCalories };
  }, [recipes]);

  // Filtrado y ordenación dinámica de recetas
  const filteredRecipes = useMemo(() => {
    let result = [...recipes];

    // Búsqueda por texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.ingredients?.some((ing) => ing.toLowerCase().includes(q)) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filtro por categoría o tag
    if (categoryFilter !== "all") {
      result = result.filter((r) => {
        const text = `${r.title} ${r.tags?.join(" ") || ""} ${r.category || ""}`.toLowerCase();
        switch (categoryFilter) {
          case "breakfast":
            return r.category === "breakfast" || text.includes("desayuno") || text.includes("avena") || text.includes("bowl");
          case "lunch":
            return r.category === "lunch" || text.includes("almuerzo") || text.includes("comida") || text.includes("wok");
          case "dinner":
            return r.category === "dinner" || text.includes("cena") || text.includes("ensalada") || text.includes("salmón");
          case "snack":
            return r.category === "snack" || text.includes("snack") || text.includes("postre") || text.includes("flan") || text.includes("cheesecake");
          case "airfryer":
            return text.includes("freidora") || text.includes("airfryer") || text.includes("aire");
          case "high_protein":
            return (r.protein || 0) >= 30;
          default:
            return true;
        }
      });
    }

    // Ordenación
    switch (sortBy) {
      case "quickest":
        result.sort((a, b) => (a.prep_time_minutes || 0) - (b.prep_time_minutes || 0));
        break;
      case "protein":
        result.sort((a, b) => (b.protein || 0) - (a.protein || 0));
        break;
      case "calories_asc":
        result.sort((a, b) => (a.calories || 0) - (b.calories || 0));
        break;
      case "calories_desc":
        result.sort((a, b) => (b.calories || 0) - (a.calories || 0));
        break;
      default:
        break;
    }

    return result;
  }, [recipes, searchQuery, categoryFilter, sortBy]);

  // Alternar ingrediente en el modo cocina
  const toggleIngredientCheck = (idx: number) => {
    const key = `item-${idx}`;
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/15 via-rose-500/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nutrición & Cocina Inteligente</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Recetas & Nutrición
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mt-1.5">
              Descubre platos saludables, controla tus macronutrientes al gramo y crea recetas a medida con el Chef IA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setRecipeToEdit(null);
                setShowAddManualModal(true);
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Receta</span>
            </button>
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-orange-400 shadow-md">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Barra de Estadísticas Rápidas */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg text-orange-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xl font-bold text-white">{stats.total}</span>
              <span className="text-[11px] text-slate-400 font-medium">Recetas en Recetario</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xl font-bold text-white">{stats.quickRecipes}</span>
              <span className="text-[11px] text-slate-400 font-medium">Rápidas (≤ 20 min)</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xl font-bold text-white">{stats.highProtein}</span>
              <span className="text-[11px] text-slate-400 font-medium">Alta Proteína (≥30g)</span>
            </div>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center space-x-3">
            <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="block text-xl font-bold text-white">{stats.avgCalories} <span className="text-xs font-normal text-slate-400">kcal</span></span>
              <span className="text-[11px] text-slate-400 font-medium">Promedio por Plato</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de Pestañas Principales */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab("my_recipes")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2.5 ${
              activeTab === "my_recipes"
                ? "bg-slate-800 text-white shadow-lg border border-slate-700"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Utensils className="w-4 h-4 text-orange-400" />
            <span>Mi Recetario</span>
            <span className="ml-1.5 px-2 py-0.5 text-xs bg-slate-900 text-slate-300 rounded-full font-bold">
              {recipes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("ai_chef")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center space-x-2.5 ${
              activeTab === "ai_chef"
                ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>Chef IA</span>
            <span className="px-2 py-0.5 text-[10px] bg-rose-950/60 border border-rose-500/30 text-rose-300 rounded-full uppercase tracking-wider font-bold">
              Generador
            </span>
          </button>
        </div>
      </div>

      {/* Controles de Búsqueda, Filtros y Orden (Solo en Mi Recetario) */}
      {activeTab === "my_recipes" && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Buscador */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por receta, ingrediente (pollo, avena, aguacate...)"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Ordenación */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-300">
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden md:inline font-medium text-slate-400">Ordenar:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  <option value="default" className="bg-slate-900 text-white">Por defecto</option>
                  <option value="quickest" className="bg-slate-900 text-white">⏱ Más rápidas</option>
                  <option value="protein" className="bg-slate-900 text-white">💪 Más proteínas</option>
                  <option value="calories_asc" className="bg-slate-900 text-white">🔥 Menos calorías</option>
                  <option value="calories_desc" className="bg-slate-900 text-white">🔥 Más calorías</option>
                </select>
              </div>
            </div>
          </div>

          {/* Chips de Categorías */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: "all", label: "Todas las Recetas", icon: "🍽️" },
              { id: "breakfast", label: "Desayunos", icon: "🥞" },
              { id: "lunch", label: "Comidas", icon: "🍲" },
              { id: "dinner", label: "Cenas", icon: "🥗" },
              { id: "snack", label: "Snacks & Postres", icon: "🍰" },
              { id: "airfryer", label: "Freidora de Aire", icon: "💨" },
              { id: "high_protein", label: "Alta Proteína (≥30g)", icon: "💪" },
            ].map((cat) => {
              const active = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 border ${
                    active
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-12 pr-1 custom-scrollbar">
        {activeTab === "my_recipes" ? (
          <>
            {filteredRecipes.length === 0 ? (
              <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl mb-4 text-orange-400">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  No se encontraron recetas
                </h3>
                <p className="text-sm text-slate-400 mb-5">
                  Ningún plato coincide con tu búsqueda o filtros seleccionados.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                  <span>Restablecer Filtros</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => {
                  const theme = getRecipeVisualTheme(recipe);
                  const isHighProtein = (recipe.protein || 0) >= 30;

                  return (
                    <div
                      key={recipe.id}
                      className={`group relative bg-gradient-to-b from-slate-800/90 to-slate-900/95 rounded-2xl border border-slate-700/70 ${theme.accentBorder} transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
                    >
                      {/* Banner Superior Estilizado */}
                      <div className="relative h-28 w-full overflow-hidden bg-slate-900 flex items-center justify-between p-4">
                        {recipe.image_url ? (
                          <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-90`}
                          >
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

                        {/* Badges superiores sobre el banner */}
                        <div className="relative z-10 self-start">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-md flex items-center space-x-1 ${theme.badgeColor}`}
                          >
                            <span>{theme.emoji}</span>
                            <span>{theme.tagLabel}</span>
                          </span>
                        </div>

                        <div className="relative z-10 self-start">
                          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-orange-400 border border-orange-500/30 flex items-center space-x-1.5 shadow-md shadow-black/40">
                            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" />
                            <span>{recipe.calories} kcal</span>
                          </div>
                        </div>

                        {/* Botones de acción rápida discretos en esquina inferior del banner */}
                        <div className="absolute bottom-2 right-3 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            title="Editar receta"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRecipeToEdit(recipe);
                              setShowAddManualModal(true);
                            }}
                            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700/60 backdrop-blur-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="Eliminar receta"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Eliminar "${recipe.title}"?`)) {
                                await storageService.deleteSharedRecipe(recipe.id);
                                addToast("Receta eliminada correctamente", "success");
                              }
                            }}
                            className="p-1.5 bg-slate-900/80 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded-lg border border-slate-700/60 backdrop-blur-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Cuerpo de la Tarjeta */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-base md:text-lg text-white mb-2 line-clamp-2 group-hover:text-orange-300 transition-colors">
                            {recipe.title}
                          </h3>

                          {/* Metadatos: Tiempo & Dificultad */}
                          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 mb-4">
                            <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-md border border-slate-700/50">
                              <Clock className="w-3.5 h-3.5 text-orange-400" />
                              <span className="font-medium text-slate-300">{recipe.prep_time_minutes} min</span>
                            </div>
                            {recipe.difficulty && (
                              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    recipe.difficulty === "Fácil"
                                      ? "bg-emerald-400"
                                      : recipe.difficulty === "Media"
                                      ? "bg-amber-400"
                                      : "bg-rose-400"
                                  }`}
                                />
                                <span className="font-medium text-slate-300">{recipe.difficulty}</span>
                              </div>
                            )}
                            {isHighProtein && (
                              <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                💪 Alta Prot
                              </span>
                            )}
                          </div>

                          {/* Cápsulas de Macronutrientes (P / C / G) con barras de progreso */}
                          <div className="grid grid-cols-3 gap-2 text-center mb-4">
                            {/* Proteína */}
                            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-2.5 flex flex-col justify-between">
                              <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                                Prot (P)
                              </span>
                              <span className="text-base font-extrabold text-white my-0.5">
                                {recipe.protein}g
                              </span>
                              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div
                                  className="bg-indigo-500 h-full rounded-full"
                                  style={{ width: `${Math.min(100, ((recipe.protein || 0) / 60) * 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Carbohidratos */}
                            <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-2.5 flex flex-col justify-between">
                              <span className="block text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                Carbs (C)
                              </span>
                              <span className="text-base font-extrabold text-white my-0.5">
                                {recipe.carbs}g
                              </span>
                              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div
                                  className="bg-emerald-500 h-full rounded-full"
                                  style={{ width: `${Math.min(100, ((recipe.carbs || 0) / 80) * 100)}%` }}
                                />
                              </div>
                            </div>

                            {/* Grasas */}
                            <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2.5 flex flex-col justify-between">
                              <span className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                Grasa (G)
                              </span>
                              <span className="text-base font-extrabold text-white my-0.5">
                                {recipe.fat}g
                              </span>
                              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                <div
                                  className="bg-amber-500 h-full rounded-full"
                                  style={{ width: `${Math.min(100, ((recipe.fat || 0) / 40) * 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Etiquetas de la Receta */}
                          <div className="flex flex-wrap gap-1.5">
                            {recipe.tags?.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-slate-800/90 border border-slate-700/60 rounded-md text-[10px] text-slate-300 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {(recipe.tags?.length || 0) > 3 && (
                              <span className="px-1.5 py-0.5 text-[10px] text-slate-500 font-medium">
                                +{(recipe.tags?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botón CTA Ver Receta */}
                        <button
                          onClick={() => setSelectedRecipe(recipe)}
                          className="w-full mt-5 py-2.5 bg-slate-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-rose-500 text-slate-200 hover:text-white rounded-xl transition-all duration-300 text-xs font-bold border border-slate-700/80 hover:border-transparent flex items-center justify-center space-x-2 shadow-sm group-hover:shadow-md"
                        >
                          <span>Ver Receta Completa</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Tarjeta Visual: Añadir Receta Manual */}
                <div
                  onClick={() => {
                    setRecipeToEdit(null);
                    setShowAddManualModal(true);
                  }}
                  className="bg-slate-900/40 border-2 border-dashed border-slate-700/80 hover:border-orange-500/60 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 cursor-pointer group min-h-[360px] hover:bg-slate-800/20"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
                    <Plus className="w-8 h-8 text-orange-400 group-hover:text-orange-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-300 transition-colors">
                    Añadir Receta Manual
                  </h3>
                  <p className="text-xs text-slate-400 text-center max-w-xs">
                    Introduce tus propios platos, auto-calcula sus macros y consérvalos en tu recetario para siempre.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Chef IA Tab Facelift */
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-6 md:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/25 text-white">
                  <Wand2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">
                    Chef IA: Dime qué tienes en la nevera
                  </h2>
                  <p className="text-sm text-slate-400">
                    Escribe los ingredientes disponibles y la IA creará una receta equilibrada con sus macros calculados.
                  </p>
                </div>
              </div>

              {/* Sugerencias Rápidas */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Ideas rápidas para probar:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "🍗 Pollo, arroz basmati, brócoli, salsa de soja",
                    "🥑 Huevos, aguacate, pan integral, tomate",
                    "🐟 Salmón fresco, patata, espárragos verdes, limón",
                    "🥣 Avena, proteína en polvo, plátano, crema de cacahuete",
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setIngredientsInput(sug)}
                      className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/60 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Ingredientes Disponibles
                  </label>
                  <textarea
                    value={ingredientsInput}
                    onChange={(e) => setIngredientsInput(e.target.value)}
                    placeholder="Ej. 2 pechugas de pollo, arroz, medio pimiento rojo, cebolla..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-32 text-sm"
                  />
                </div>
                <button
                  onClick={() => handleGenerateRecipe()}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      <span>Generar Receta Mágica con IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* Resultado Receta IA */}
              {generatedRecipe && (
                <div className="bg-slate-900/90 rounded-2xl p-6 border border-purple-500/30 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                  <h3 className="text-2xl font-bold text-white mb-2">
                    {generatedRecipe.title}
                  </h3>
                  <div className="flex flex-wrap gap-2.5 mb-6">
                    <span className="px-3 py-1 bg-purple-500/10 rounded-full text-xs font-bold text-purple-400 border border-purple-500/20">
                      {generatedRecipe.category || "Fitness"}
                    </span>
                    <span className="px-3 py-1 bg-orange-500/10 rounded-full text-xs font-bold text-orange-400 border border-orange-500/20">
                      🔥 {generatedRecipe.calories} kcal
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                      ⏱ {generatedRecipe.prep_time_minutes} min
                    </span>
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-slate-700">
                      🎓 {generatedRecipe.difficulty || "Media"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <h4 className="font-bold text-white mb-3 flex items-center space-x-2 text-sm">
                        <span>🥘</span>
                        <span>Ingredientes</span>
                      </h4>
                      <ul className="space-y-2">
                        {generatedRecipe.ingredients?.map((ing, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-300 flex items-start space-x-2"
                          >
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-3 flex items-center space-x-2 text-sm">
                        <span>📊</span>
                        <span>Macros Estimados</span>
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-500/30 text-center">
                          <span className="text-xs text-indigo-400 font-bold block">Proteína</span>
                          <span className="text-lg font-extrabold text-white">{generatedRecipe.protein}g</span>
                        </div>
                        <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-center">
                          <span className="text-xs text-emerald-400 font-bold block">Carbos</span>
                          <span className="text-lg font-extrabold text-white">{generatedRecipe.carbs}g</span>
                        </div>
                        <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30 text-center">
                          <span className="text-xs text-amber-400 font-bold block">Grasas</span>
                          <span className="text-lg font-extrabold text-white">{generatedRecipe.fat}g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-bold text-white mb-3 flex items-center space-x-2 text-sm">
                      <span>👨‍🍳</span>
                      <span>Instrucciones</span>
                    </h4>
                    <ol className="space-y-3">
                      {generatedRecipe.instructions?.map((inst, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-slate-300 flex items-start space-x-3"
                        >
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-purple-400">
                            {idx + 1}
                          </span>
                          <span className="pt-0.5">{inst}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button
                    onClick={handleSaveAiRecipe}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
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

      {/* Modal Detallado de Receta (Modo Cocina con Checklist y Macros Proporcionales) */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto custom-scrollbar relative shadow-2xl flex flex-col">
            {/* Cabecera / Imagen */}
            <div className="relative">
              {selectedRecipe.image_url ? (
                <div className="w-full h-56 bg-slate-800 relative">
                  <img
                    src={selectedRecipe.image_url}
                    alt={selectedRecipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40" />
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 relative border-b border-slate-800 flex items-center justify-between px-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">{getRecipeVisualTheme(selectedRecipe).emoji}</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                        {getCategoryLabel(selectedRecipe.category)}
                      </span>
                      <h4 className="text-sm text-slate-400 font-medium">Modo Cocina</h4>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full transition-colors z-10 border border-slate-700/60 backdrop-blur-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedRecipe.title}
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1 bg-orange-500/10 rounded-full text-xs font-bold text-orange-400 border border-orange-500/20 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{selectedRecipe.calories} kcal</span>
                  </span>
                  <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedRecipe.prep_time_minutes} min</span>
                  </span>
                  {selectedRecipe.difficulty && (
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          selectedRecipe.difficulty === "Fácil"
                            ? "bg-emerald-400"
                            : selectedRecipe.difficulty === "Media"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span>{selectedRecipe.difficulty}</span>
                    </span>
                  )}
                  {selectedRecipe.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-800/80 rounded-full text-xs font-medium text-slate-400 border border-slate-700/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distribución Calórica Visual */}
              {(() => {
                const pCal = (selectedRecipe.protein || 0) * 4;
                const cCal = (selectedRecipe.carbs || 0) * 4;
                const fCal = (selectedRecipe.fat || 0) * 9;
                const totalCal = pCal + cCal + fCal || 1;
                const pPct = Math.round((pCal / totalCal) * 100);
                const cPct = Math.round((cCal / totalCal) * 100);
                const fPct = Math.max(0, 100 - pPct - cPct);

                return (
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                        <span>Distribución de Macronutrientes</span>
                      </span>
                      <button
                        onClick={async () => {
                          const newMacros = estimateMacrosFromText(selectedRecipe.ingredients?.join("\n") || "");
                          const updatedRecipe = { ...selectedRecipe, ...newMacros };
                          await storageService.saveSharedRecipe(updatedRecipe, currentUser?.id);
                          setSelectedRecipe(updatedRecipe);
                          addToast("Macros recalculados y guardados con éxito", "success");
                        }}
                        className="text-xs bg-orange-500/15 text-orange-400 hover:bg-orange-500/25 px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 border border-orange-500/30"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Auto-Recalcular</span>
                      </button>
                    </div>

                    {/* Barra apilada proporcional */}
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex mb-3">
                      <div className="bg-indigo-500 h-full transition-all" style={{ width: `${pPct}%` }} title={`Proteína: ${pPct}%`} />
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${cPct}%` }} title={`Carbos: ${cPct}%`} />
                      <div className="bg-amber-500 h-full transition-all" style={{ width: `${fPct}%` }} title={`Grasas: ${fPct}%`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-indigo-950/30 border border-indigo-500/20 p-2 rounded-lg">
                        <span className="text-[11px] text-indigo-400 font-bold block">Proteína ({pPct}%)</span>
                        <span className="text-base font-extrabold text-white">{selectedRecipe.protein}g</span>
                      </div>
                      <div className="bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-lg">
                        <span className="text-[11px] text-emerald-400 font-bold block">Carbos ({cPct}%)</span>
                        <span className="text-base font-extrabold text-white">{selectedRecipe.carbs}g</span>
                      </div>
                      <div className="bg-amber-950/30 border border-amber-500/20 p-2 rounded-lg">
                        <span className="text-[11px] text-amber-400 font-bold block">Grasas ({fPct}%)</span>
                        <span className="text-base font-extrabold text-white">{selectedRecipe.fat}g</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Ingredientes con Modo Checklist Interactivo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white flex items-center space-x-2 text-sm">
                    <span>🥘</span>
                    <span>Ingredientes (Haz clic para marcar lo que uses)</span>
                  </h4>
                  <span className="text-xs text-slate-400">
                    {Object.values(checkedIngredients).filter(Boolean).length} de {selectedRecipe.ingredients?.length || 0} listos
                  </span>
                </div>
                <div className="space-y-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                  {selectedRecipe.ingredients?.map((ing, idx) => {
                    const isChecked = !!checkedIngredients[`item-${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleIngredientCheck(idx)}
                        className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors text-sm select-none ${
                          isChecked
                            ? "bg-slate-900/90 text-slate-500 line-through"
                            : "hover:bg-slate-900 text-slate-200"
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        )}
                        <span>{ing}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instrucciones de preparación */}
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center space-x-2 text-sm">
                  <span>👨‍🍳</span>
                  <span>Pasos de Preparación</span>
                </h4>
                <ol className="space-y-3">
                  {selectedRecipe.instructions?.map((inst, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-slate-300 flex items-start space-x-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/60"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-orange-400">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Acciones en Modal */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
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

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setRecipeToEdit(selectedRecipe);
                      setSelectedRecipe(null);
                      setShowAddManualModal(true);
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors flex items-center space-x-2 text-xs font-semibold border border-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Receta</span>
                  </button>
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors text-xs font-semibold shadow-lg shadow-orange-600/20"
                  >
                    Listo
                  </button>
                </div>
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
