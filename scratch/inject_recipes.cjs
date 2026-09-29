const fs = require('fs');
let f = fs.readFileSync('src/services/storageService.ts', 'utf8');

const code = `
  // ==========================================
  // SHARED RECIPES (RECETAS COMPARTIDAS)
  // ==========================================
  async getSharedRecipes(): Promise<import('../types').FitnessRecipe[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fitness_recipes').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data as import('../types').FitnessRecipe[];
        }
      } catch (e) {
        console.error('Error fetching shared recipes:', e);
      }
    }
    return this.getLocal<import('../types').FitnessRecipe[]>('shared_recipes', []);
  }

  async saveSharedRecipe(recipe: Partial<import('../types').FitnessRecipe>, userId?: string): Promise<import('../types').FitnessRecipe> {
    const newItem = {
      ...recipe,
      id: recipe.id && !recipe.id.startsWith('algo-') ? recipe.id : generateId('rec'),
      user_id: userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    } as import('../types').FitnessRecipe;

    const current = this.getLocal<import('../types').FitnessRecipe[]>('shared_recipes', []);
    const existingIndex = current.findIndex(r => r.id === newItem.id);
    if (existingIndex >= 0) {
      current[existingIndex] = newItem;
    } else {
      current.unshift(newItem);
    }
    this.setLocal('shared_recipes', current);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        const { id, ...rest } = newItem;
        await supabase.from('fitness_recipes').upsert({ id, ...rest });
      } catch (e) {
        console.error('Error saving shared recipe:', e);
      }
    }

    return newItem;
  }
`;

f = f.replace('export const storageService = new StorageService();', code + '\nexport const storageService = new StorageService();');
fs.writeFileSync('src/services/storageService.ts', f);
