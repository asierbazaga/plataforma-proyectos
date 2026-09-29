const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('app_permissions').upsert({
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Dummy or admin user ID
    app_id: 'recetas',
    can_access: true,
    can_edit: true
  }, { onConflict: 'user_id,app_id' });

  console.log("Error:", error);
  console.log("Data:", data);
}
test();
