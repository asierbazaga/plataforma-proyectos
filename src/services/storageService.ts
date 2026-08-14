import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AppPermission, AuditLog, AppId, FitnessWorkout, ExpenseItem, LibraryItem, LoreEntry } from '../types';

// Datos por defecto para fallback LocalStorage
const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'admin@plataforma.com',
    full_name: 'Asier Bazaga (Admin)',
    role: 'admin',
    department: 'Dirección IT',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'usuario@plataforma.com',
    full_name: 'Carlos Gómez (Usuario)',
    role: 'user',
    department: 'Operaciones',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'invitado@plataforma.com',
    full_name: 'Laura Martínez (Invitada)',
    role: 'guest',
    department: 'Consultoría',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PERMISSIONS: AppPermission[] = [
  // Admin: Acceso a las 4 Apps
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'lore', can_access: true, can_edit: true },

  // Usuario: Fitness y Gastos habilitados, Libros-Juegos y Lore denegados
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'libros-juegos', can_access: false, can_edit: false },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'lore', can_access: false, can_edit: false },

  // Invitado: Solo Libros-Juegos
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'fitness', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'gastos', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'libros-juegos', can_access: true, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'lore', can_access: false, can_edit: false }
];

const DEFAULT_WORKOUTS: FitnessWorkout[] = [
  { id: '1', title: 'Entrenamiento Fuerza Pecho y Tríceps', category: 'Fuerza', duration_minutes: 50, calories_burned: 420, workout_date: '2026-08-14', notes: 'Press banca 4x10, Fondos 3x12' },
  { id: '2', title: 'Carrera Continua 7K', category: 'Cardio', duration_minutes: 35, calories_burned: 380, workout_date: '2026-08-13', notes: 'Ritmo suave 5:00 min/km' }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: '1', description: 'Servidores Cloud Vercel & Supabase', amount: 45.00, type: 'expense', category: 'Tecnología', transaction_date: '2026-08-14' },
  { id: '2', description: 'Compra Supermercado', amount: 128.50, type: 'expense', category: 'Alimentación', transaction_date: '2026-08-12' },
  { id: '3', description: 'Cobro Proyecto Freelance', amount: 1200.00, type: 'income', category: 'Ingresos', transaction_date: '2026-08-10' }
];

const DEFAULT_LIBRARY: LibraryItem[] = [
  { id: '1', title: 'Clean Code (Robert C. Martin)', media_type: 'book', genre: 'Software', status: 'in_progress', rating: 5, progress_percentage: 65 },
  { id: '2', title: 'The Witcher 3: Wild Hunt', media_type: 'game', genre: 'RPG', status: 'completed', rating: 5, progress_percentage: 100 }
];

const DEFAULT_LORE: LoreEntry[] = [
  { id: '1', title: 'Guía de Despliegue en Vercel', category: 'Procedimientos', content: 'Instrucciones para vincular el repositorio en Vercel e ingresar las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.', tags: ['vercel', 'deploy', 'guia'], updated_at: '2026-08-14' },
  { id: '2', title: 'Arquitectura RBAC de Permisos', category: 'Arquitectura', content: 'Matriz de control de acceso por usuario y aplicación con persisitencia inmediata en la tabla app_permissions.', tags: ['rbac', 'permisos', 'seguridad'], updated_at: '2026-08-14' }
];

class StorageService {
  private getLocal<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(`plataforma_${key}`);
    if (!raw) {
      localStorage.setItem(`plataforma_${key}`, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, data: T): void {
    localStorage.setItem(`plataforma_${key}`, JSON.stringify(data));
  }

  // --- PROFILES ---
  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return this.getLocal('profiles', DEFAULT_PROFILES);
  }

  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').insert(newProfile);
    }

    const current = this.getLocal('profiles', DEFAULT_PROFILES);
    const updated = [...current, newProfile];
    this.setLocal('profiles', updated);

    // Inicializar permisos por defecto para este nuevo usuario
    const newPerms: AppPermission[] = [
      { user_id: newProfile.id, app_id: 'fitness', can_access: true, can_edit: true },
      { user_id: newProfile.id, app_id: 'gastos', can_access: true, can_edit: true },
      { user_id: newProfile.id, app_id: 'libros-juegos', can_access: false, can_edit: false },
      { user_id: newProfile.id, app_id: 'lore', can_access: false, can_edit: false }
    ];
    await this.updateUserPermissions(newProfile.id, newPerms);

    return newProfile;
  }

  // --- PERMISSIONS ---
  async getPermissions(): Promise<AppPermission[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('app_permissions').select('*');
      if (!error && data && data.length > 0) return data;
    }
    return this.getLocal('permissions', DEFAULT_PERMISSIONS);
  }

  async updateUserPermissions(userId: string, permissions: AppPermission[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      for (const p of permissions) {
        await supabase.from('app_permissions').upsert({
          user_id: userId,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' });
      }
    }

    const current = this.getLocal('permissions', DEFAULT_PERMISSIONS);
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...permissions];
    this.setLocal('permissions', updated);
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
      if (!error && data) return data;
    }
    return this.getLocal('audit_logs', []);
  }

  async logAction(userEmail: string, action: string, details?: string): Promise<void> {
    const log: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : `log_${Date.now()}`,
      user_email: userEmail,
      action,
      details,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('audit_logs').insert(log);
    }

    const logs = this.getLocal('audit_logs', []);
    this.setLocal('audit_logs', [log, ...logs]);
  }

  // --- FITNESS WORKOUTS ---
  async getWorkouts(): Promise<FitnessWorkout[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false });
      if (!error && data) return data;
    }
    return this.getLocal('workouts', DEFAULT_WORKOUTS);
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      id: crypto.randomUUID ? crypto.randomUUID() : `fit_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_workouts').insert(item);
    }
    const current = this.getLocal('workouts', DEFAULT_WORKOUTS);
    const updated = [item, ...current];
    this.setLocal('workouts', updated);
    return item;
  }

  // --- EXPENSES ---
  async getExpenses(): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('expenses').select('*').order('transaction_date', { ascending: false });
      if (!error && data) return data;
    }
    return this.getLocal('expenses', DEFAULT_EXPENSES);
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      id: crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').insert(item);
    }
    const current = this.getLocal('expenses', DEFAULT_EXPENSES);
    const updated = [item, ...current];
    this.setLocal('expenses', updated);
    return item;
  }

  // --- LIBRARY (BOOKS & GAMES) ---
  async getLibrary(): Promise<LibraryItem[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('user_library').select('*');
      if (!error && data) return data;
    }
    return this.getLocal('library', DEFAULT_LIBRARY);
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `lib_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('user_library').insert(newItem);
    }
    const current = this.getLocal('library', DEFAULT_LIBRARY);
    const updated = [newItem, ...current];
    this.setLocal('library', updated);
    return newItem;
  }

  // --- LORE ENTRIES ---
  async getLoreEntries(): Promise<LoreEntry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('lore_entries').select('*').order('updated_at', { ascending: false });
      if (!error && data) return data;
    }
    return this.getLocal('lore', DEFAULT_LORE);
  }

  async addLoreEntry(entry: Omit<LoreEntry, 'id' | 'updated_at'>): Promise<LoreEntry> {
    const newEntry: LoreEntry = {
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : `lore_${Date.now()}`,
      updated_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_entries').insert(newEntry);
    }
    const current = this.getLocal('lore', DEFAULT_LORE);
    const updated = [newEntry, ...current];
    this.setLocal('lore', updated);
    return newEntry;
  }
}

export const storageService = new StorageService();
