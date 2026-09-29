import { FitnessRecipe } from '../types';

// Diccionario de ingredientes comunes con sus macros estimados (por ración habitual)
// Categorías: 'protein', 'carb', 'fat', 'veg', 'other'
const ingredientDB: Record<string, { category: string; protein: number; carbs: number; fat: number; calories: number; serving: string }> = {
  pollo: { category: 'protein', protein: 30, carbs: 0, fat: 3, calories: 165, serving: '150g' },
  ternera: { category: 'protein', protein: 26, carbs: 0, fat: 15, calories: 250, serving: '150g' },
  huevo: { category: 'protein', protein: 12, carbs: 1, fat: 10, calories: 140, serving: '2 unidades' },
  huevos: { category: 'protein', protein: 12, carbs: 1, fat: 10, calories: 140, serving: '2 unidades' },
  cerdo: { category: 'protein', protein: 25, carbs: 0, fat: 14, calories: 240, serving: '150g' },
  tofu: { category: 'protein', protein: 16, carbs: 2, fat: 9, calories: 140, serving: '100g' },
  pescado: { category: 'protein', protein: 20, carbs: 0, fat: 5, calories: 130, serving: '150g' },
  salmon: { category: 'protein', protein: 30, carbs: 0, fat: 20, calories: 300, serving: '150g' },
  salmón: { category: 'protein', protein: 30, carbs: 0, fat: 20, calories: 300, serving: '150g' },
  arroz: { category: 'carb', protein: 3, carbs: 28, fat: 0, calories: 130, serving: '100g (cocido)' },
  pasta: { category: 'carb', protein: 5, carbs: 30, fat: 1, calories: 150, serving: '100g (cocido)' },
  patata: { category: 'carb', protein: 2, carbs: 17, fat: 0, calories: 77, serving: '100g' },
  patatas: { category: 'carb', protein: 2, carbs: 17, fat: 0, calories: 77, serving: '100g' },
  avena: { category: 'carb', protein: 6, carbs: 30, fat: 3, calories: 190, serving: '50g' },
  pan: { category: 'carb', protein: 4, carbs: 25, fat: 1, calories: 130, serving: '50g' },
  aguacate: { category: 'fat', protein: 2, carbs: 9, fat: 15, calories: 160, serving: '100g' },
  queso: { category: 'fat', protein: 7, carbs: 1, fat: 9, calories: 110, serving: '30g' },
  nueces: { category: 'fat', protein: 4, carbs: 4, fat: 20, calories: 200, serving: '30g' },
  aceite: { category: 'fat', protein: 0, carbs: 0, fat: 14, calories: 120, serving: '1 cucharada' },
  tomate: { category: 'veg', protein: 1, carbs: 4, fat: 0, calories: 18, serving: '100g' },
  cebolla: { category: 'veg', protein: 1, carbs: 9, fat: 0, calories: 40, serving: '100g' },
  pimiento: { category: 'veg', protein: 1, carbs: 5, fat: 0, calories: 20, serving: '100g' },
  zanahoria: { category: 'veg', protein: 1, carbs: 10, fat: 0, calories: 41, serving: '100g' },
  brocoli: { category: 'veg', protein: 3, carbs: 7, fat: 0, calories: 34, serving: '100g' },
  brócoli: { category: 'veg', protein: 3, carbs: 7, fat: 0, calories: 34, serving: '100g' },
  espinaca: { category: 'veg', protein: 3, carbs: 1, fat: 0, calories: 23, serving: '100g' },
  lechuga: { category: 'veg', protein: 1, carbs: 3, fat: 0, calories: 15, serving: '100g' },
};

// Generador de Recetas Algorítmico (Simulación de IA)
export async function generateRecipeWithAI(ingredientsInput: string[]): Promise<Partial<FitnessRecipe> | null> {
  // Simulamos un pequeño tiempo de carga de "pensamiento"
  await new Promise(resolve => setTimeout(resolve, 1500));

  const normalizedInput = ingredientsInput.map(i => i.toLowerCase().trim());
  
  const foundProteins: string[] = [];
  const foundCarbs: string[] = [];
  const foundFats: string[] = [];
  const foundVegs: string[] = [];
  const unclassified: string[] = [];

  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalCalories = 0;

  const usedIngredientsList: string[] = [];

  // Analizar ingredientes dados
  normalizedInput.forEach(ing => {
    // Buscar si alguna palabra clave del ingrediente está en nuestra base de datos
    const words = ing.split(/s+/);
    let matched = false;

    for (const word of words) {
      if (ingredientDB[word]) {
        const data = ingredientDB[word];
        totalProtein += data.protein;
        totalCarbs += data.carbs;
        totalFat += data.fat;
        totalCalories += data.calories;
        usedIngredientsList.push(`${data.serving} de ${ing}`);

        if (data.category === 'protein') foundProteins.push(ing);
        else if (data.category === 'carb') foundCarbs.push(ing);
        else if (data.category === 'fat') foundFats.push(ing);
        else if (data.category === 'veg') foundVegs.push(ing);
        
        matched = true;
        break; // Solo sumamos 1 vez por ingrediente
      }
    }

    if (!matched) {
      unclassified.push(ing);
      // Asumimos macros mínimos para cosas desconocidas (especias, verduras raras, etc)
      usedIngredientsList.push(`Al gusto: ${ing}`);
      totalCalories += 10; 
    }
  });

  // Base del plato (Título)
  let title = "Plato fitness de";
  let category: "breakfast" | "lunch" | "snack" | "dinner" | "post_workout" = "lunch";
  
  if (foundProteins.includes('huevo') || foundProteins.includes('huevos') || foundCarbs.includes('avena')) {
    category = "breakfast";
    if (foundProteins.length > 0) {
      title = `Revoltillo energético de ${foundProteins[0]}`;
    } else {
      title = `Desayuno nutritivo con ${foundCarbs[0]}`;
    }
  } else if (foundCarbs.length > 0 && foundProteins.length > 0) {
    if (foundCarbs.includes('arroz')) title = `Wok de arroz con ${foundProteins[0]}`;
    else if (foundCarbs.includes('pasta')) title = `Pasta proteica con ${foundProteins[0]}`;
    else title = `Bol saludable de ${foundProteins[0]} y ${foundCarbs[0]}`;
  } else if (foundProteins.length > 0 && foundVegs.length > 0) {
    category = "dinner"; // Sin carbos suele ser cena
    title = `${foundProteins[0].charAt(0).toUpperCase() + foundProteins[0].slice(1)} a la plancha con guarnición de ${foundVegs[0]}`;
  } else if (foundProteins.length > 0) {
    title = `Sartén proteica de ${foundProteins.join(' y ')}`;
  } else {
    title = `Salteado ligero de ${ingredientsInput.slice(0, 2).join(' y ')}`;
  }

  // Si hay más cosas, las mencionamos
  if (foundVegs.length > 0 && !title.includes('guarnición')) {
    title += ` al toque de ${foundVegs[0]}`;
  }

  // Generar instrucciones
  const instructions: string[] = [];
  
  if (foundVegs.length > 0 || unclassified.length > 0) {
    instructions.push(`Lava y trocea finamente los vegetales: ${[...foundVegs, ...unclassified].join(', ')}.`);
  }
  
  if (foundCarbs.length > 0) {
    instructions.push(`Pon a cocer o preparar tu fuente de carbohidratos (${foundCarbs.join(', ')}) según las indicaciones habituales.`);
  }
  
  if (foundProteins.length > 0) {
    instructions.push(`En una sartén a fuego medio-alto con unas gotas de aceite, cocina ${foundProteins.join(', ')} hasta que quede dorado.`);
  }
  
  instructions.push(`Mezcla todos los ingredientes en la sartén o en un bol grande, añade sal, pimienta y tus especias favoritas.`);
  
  if (foundFats.length > 0) {
    instructions.push(`Sirve en un plato y corona con ${foundFats.join(', ')} para aportar grasas saludables al final.`);
  } else {
    instructions.push(`Sirve caliente y ¡a disfrutar de tu comida fit!`);
  }

  // Asegurar mínimos si no se detectó nada (por si escriben cosas muy raras)
  if (totalCalories === 0) {
    totalCalories = 250;
    totalProtein = 10;
    totalCarbs = 20;
    totalFat = 5;
  }

  return {
    id: 'algo-' + Date.now(),
    title,
    category,
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
    carbs: Math.round(totalCarbs),
    fat: Math.round(totalFat),
    prep_time_minutes: foundCarbs.length > 0 ? 20 : 12,
    difficulty: 'Fácil',
    ingredients: usedIngredientsList,
    instructions,
    tags: ['Algoritmo Chef', 'Personalizada', foundProteins.length > 0 ? 'Alta Proteína' : 'Ligera']
  };
}
