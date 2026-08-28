const fs = require('fs');
const dotenv = null; // Removed
const { createClient } = require('@supabase/supabase-js');

// Leer archivo de entorno
let envStr = fs.readFileSync('.env', 'utf8');
const env = {};
envStr.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key.trim()] = val.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL || 'https://xmxrywztdmjzffgdknpd.supabase.co';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.log('No supabase key found.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  const tables = [
    { name: 'wallet_config', key: 'user_id' },
    { name: 'expenses', key: 'id' },
    { name: 'savings_goals', key: 'id' },
    { name: 'category_budgets', key: 'category' },
    { name: 'fitness_profiles', key: 'id' },
    { name: 'fitness_workouts', key: 'id' },
    { name: 'fitness_nutrition_logs', key: 'id' },
    { name: 'fitness_body_progress', key: 'id' },
    { name: 'fitness_polar_metrics', key: 'id' },
    { name: 'user_library', key: 'id' },
    { name: 'lore_clients', key: 'id' },
    { name: 'lore_saved_routes', key: 'id' },
    { name: 'lore_crm_pharmacies', key: 'id' },
    { name: 'lore_goals', key: 'id' }
  ];

  for (const table of tables) {
    console.log(`Deleting from ${table.name}...`);
    const { error } = await supabase.from(table.name).delete().neq(table.key, '___NON_EXISTENT_ID___');
    if (error) {
       console.error(`Failed to delete ${table.name}: `, error);
    } else {
       console.log(`Successfully cleared ${table.name}`);
    }
  }
}

clearData();
