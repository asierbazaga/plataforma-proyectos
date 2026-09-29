const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('fitness_recipes').upsert({
    id: 'rec_123456',
    title: 'Test',
    category: 'lunch',
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 10,
    prep_time_minutes: 10,
    difficulty: 'Fácil',
    ingredients: [],
    instructions: [],
    tags: []
  });

  console.log("Error:", error);
  console.log("Data:", data);
}
test();
