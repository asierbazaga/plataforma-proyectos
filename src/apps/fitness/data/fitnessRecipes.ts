import { FitnessRecipe } from '../../../types';

export const FITNESS_RECIPES: FitnessRecipe[] = [
  {
    id: 'rec-1',
    title: 'Bowl de Avena Proteica con Frutos Rojos y Crema de Cacahuete',
    category: 'breakfast',
    calories: 420,
    protein: 36,
    carbs: 48,
    fat: 10,
    prep_time_minutes: 8,
    ingredients: [
      '60g copos de avena integral',
      '30g proteína en polvo (aislado de suero o vegetal)',
      '150ml leche de almendras o desnatada',
      '50g arándanos o fresas frescas',
      '15g crema de cacahuete 100% natural',
      'Canela al gusto'
    ],
    instructions: [
      'Calienta la avena con la leche en el microondas o cazo durante 2 minutos hasta espesar.',
      'Deja templar 1 minuto y mezcla enérgicamente la proteína en polvo para evitar grumos.',
      'Decora con los frutos rojos, la crema de cacahuete y un toque de canela.'
    ],
    tags: ['Alta Proteína', 'Energía Rápida', 'Desayuno Top']
  },
  {
    id: 'rec-2',
    title: 'Pollo al Wok Teriyaki Ligero con Arroz Jazmín y Brócoli',
    category: 'lunch',
    calories: 520,
    protein: 48,
    carbs: 60,
    fat: 9,
    prep_time_minutes: 18,
    ingredients: [
      '200g pechuga de pollo cortada en tiras',
      '75g arroz jazmín o basmati en seco',
      '150g arbolitos de brócoli y zanahoria',
      '15ml salsa de soja baja en sal + 5g miel',
      '1 cucharadita de aceite de oliva virgen extra',
      'Semillas de sésamo'
    ],
    instructions: [
      'Cuece el arroz jazmín con una pizca de sal (12 min).',
      'En una sartén o wok con el aceite, saltea el pollo a fuego vivo hasta dorar.',
      'Añade el brócoli y zanahoria con 2 cucharadas de agua, tapa 3 min para cocinarse al vapor.',
      'Vierte la salsa de soja con miel, mezcla todo junto al arroz y sirve con sésamo por encima.'
    ],
    tags: ['Comida Musculación', 'Bajo en Grasa', 'Meal Prep Ideal']
  },
  {
    id: 'rec-3',
    title: 'Salmón a la Plancha con Boniato Asado y Espárragos Verdes',
    category: 'dinner',
    calories: 490,
    protein: 40,
    carbs: 38,
    fat: 18,
    prep_time_minutes: 25,
    ingredients: [
      '180g lomo de salmón fresco',
      '200g boniato cortado en dados',
      '1 manojo de espárragos verdes trigueros',
      '1 cucharadita de aceite de oliva',
      'Sal en escamas, pimienta negra y limón'
    ],
    instructions: [
      'Asa los dados de boniato en freidora de aire o al horno (190°C durante 18 min) con especias.',
      'Saltea los espárragos en sartén con una gota de aceite.',
      'Marca el lomo de salmón 3 minutos por el lado de la piel y 2 minutos por el otro lado.',
      'Emplata con unas gotas de zumo de limón y sal en escamas.'
    ],
    tags: ['Omega 3', 'Antiinflamatorio', 'Cena Ligera & Saciedad']
  },
  {
    id: 'rec-4',
    title: 'Tortilla de Claras, Pavo Braseado y Aguacate con Tostada Integral',
    category: 'breakfast',
    calories: 380,
    protein: 34,
    carbs: 26,
    fat: 14,
    prep_time_minutes: 10,
    ingredients: [
      '1 huevo entero + 150ml claras de huevo pasteurizadas',
      '60g pechuga de pavo >90% carne en taquitos',
      '40g aguacate maduro en láminas',
      '1 rebanada de pan 100% integral de masa madre',
      'Tomate rallado y orégano'
    ],
    instructions: [
      'Bate el huevo con las claras y los taquitos de pavo.',
      'Cuaja la tortilla francesa en una sartén antiadherente con una gota de aceite.',
      'Tuesta el pan integral, unta el tomate y coloca el aguacate y la tortilla encima.'
    ],
    tags: ['Rápido', 'Grasas Saludables', 'Definición']
  },
  {
    id: 'rec-5',
    title: 'Batido Anabólico Post-Entreno Polar Recovery',
    category: 'post_workout',
    calories: 310,
    protein: 35,
    carbs: 38,
    fat: 3,
    prep_time_minutes: 3,
    ingredients: [
      '35g aislado de proteína de suero (vainilla o chocolate)',
      '1 plátano maduro mediano (100g)',
      '200ml agua fría o leche desnatada',
      '1 cucharadita de canela de ceilán',
      'Hielos'
    ],
    instructions: [
      'Añade todos los ingredientes en el vaso de la batidora.',
      'Tritura a máxima potencia durante 45 segundos hasta obtener textura cremosa.',
      'Consumir en los primeros 60-90 minutos tras la sesión para recargar glucógeno y síntesis proteica.'
    ],
    tags: ['Post-Entreno', 'Glucógeno Rápido', 'Digestión Ultrarrápida']
  },
  {
    id: 'rec-6',
    title: 'Hamburguesas Caseras de Ternera Magra con Patatas al Horno',
    category: 'dinner',
    calories: 550,
    protein: 50,
    carbs: 52,
    fat: 14,
    prep_time_minutes: 20,
    ingredients: [
      '200g carne picada de ternera magra (<5% grasa)',
      '250g patatas cortadas en gajos',
      'Especias: pimentón dulce, ajo en polvo, orégano y sal',
      '1 cucharadita de aceite de oliva',
      'Hojas de rúcula y rodajas de tomate'
    ],
    instructions: [
      'Condimenta los gajos de patata con el aceite y las especias. Cocina en freidora de aire a 200°C 15 min.',
      'Forma las hamburguesas de ternera y márcalas en la sartén a fuego alto 3 min por lado.',
      'Acompaña con la rúcula, tomate y las patatas crujientes.'
    ],
    tags: ['Alto en Hierro & Zinc', 'Sabor Gourmet Fit', 'Volumen Limpio']
  }
];
