import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AppPermission, AuditLog, FitnessWorkout, ExpenseItem, SavingsGoal, LibraryItem, LoreClient, LoreSavedRoute } from '../types';

const PROFILES_VERSION = 'v2_asier_lore';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'asier.bazaga@plataforma.com',
    full_name: 'Asier Bazaga',
    role: 'admin',
    department: 'Dirección IT & Super Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'lore@plataforma.com',
    full_name: 'Lore',
    role: 'user',
    department: 'Operaciones & Gestión',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'invitado@plataforma.com',
    full_name: 'Invitado Demo',
    role: 'guest',
    department: 'Consultoría Externa',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PERMISSIONS: AppPermission[] = [
  // Asier Bazaga: Admin Total (Fitness, Gastos, Libros-Juegos, Lore)
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'lore', can_access: true, can_edit: true },

  // Lore: Usuario con acceso y edición total a las 4 aplicaciones (Sin rol admin)
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'lore', can_access: true, can_edit: true },

  // Invitado: Solo lectura a Libros & Juegos
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
  { id: '1', description: 'Servidores Cloud Vercel & Supabase', amount: 45.00, type: 'expense', category: 'Tecnología', transaction_date: '2026-08-14', account: 'abanca' },
  { id: '2', description: 'Compra Semanal Mercadona (Conjunta)', amount: 128.50, type: 'expense', category: 'Alimentación', transaction_date: '2026-08-12', account: 'ing' },
  { id: '3', description: 'Nómina / Ingreso Principal', amount: 2100.00, type: 'income', category: 'Ingresos', transaction_date: '2026-08-10', account: 'abanca' },
  { id: '4', description: 'Aportación Mensual Cuenta Común ING', amount: 400.00, type: 'income', category: 'Ahorro/Común', transaction_date: '2026-08-05', account: 'ing' }
];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'goal_1', title: 'Viaje / Vacaciones', target_amount: 2500, current_amount: 1450, account: 'ing', target_date: '2026-11-01', notes: 'Ahorro conjunto para vacaciones' },
  { id: 'goal_2', title: 'Fondo de Emergencia Personal', target_amount: 5000, current_amount: 3200, account: 'abanca', target_date: '2026-12-31', notes: 'Colchón de seguridad personal Abanca' }
];

const DEFAULT_LIBRARY: LibraryItem[] = [
  { id: '1', title: 'Clean Code (Robert C. Martin)', media_type: 'book', genre: 'Software', status: 'in_progress', rating: 5, progress_percentage: 65 },
  { id: '2', title: 'The Witcher 3: Wild Hunt', media_type: 'game', genre: 'RPG', status: 'completed', rating: 5, progress_percentage: 100 }
];

const DEFAULT_CLIENTS: LoreClient[] = [
  {
    id: 'cli-001',
    nombre: 'Farmacia Central Gran Vía',
    tipo: 'Farmacia VIP',
    contacto_nombre: 'Dra. Elena Ruiz',
    direccion: 'Gran Vía 42, Madrid',
    latitud: 40.4203,
    longitud: -3.7058,
    ultima_visita_at: '2026-08-01',
    codigo: 'FAR-001',
    decil: 'D10',
    total_2025: 85000,
    total_2026: 92000,
    telefono: '912 345 678',
    provincia: 'Madrid',
    ciudad: 'Madrid',
    activo: true
  },
  {
    id: 'cli-002',
    nombre: 'Farmacia Salamanca 24h',
    tipo: 'Farmacia VIP',
    contacto_nombre: 'Dr. Javier Ortega',
    direccion: 'Calle Serrano 88, Madrid',
    latitud: 40.4320,
    longitud: -3.6870,
    ultima_visita_at: '2026-07-28',
    codigo: 'FAR-002',
    decil: 'D10',
    total_2025: 78000,
    total_2026: 84000,
    telefono: '913 888 999',
    provincia: 'Madrid',
    ciudad: 'Madrid',
    activo: true
  },
  {
    id: 'cli-003',
    nombre: 'Farmacia Bilbao Moyua',
    tipo: 'Farmacia',
    contacto_nombre: 'Dra. Maite Alonso',
    direccion: 'Plaza Moyúa 3, Bilbao',
    latitud: 43.2630,
    longitud: -2.9350,
    ultima_visita_at: '2026-08-05',
    codigo: 'FAR-003',
    decil: 'D09',
    total_2025: 62000,
    total_2026: 69000,
    telefono: '944 112 233',
    provincia: 'Bizkaia',
    ciudad: 'Bilbao',
    activo: true
  },
  {
    id: 'cli-004',
    nombre: 'Farmacia Paseo de Gracia',
    tipo: 'Farmacia VIP',
    contacto_nombre: 'Dra. Carme Pujol',
    direccion: 'Passeig de Gràcia 55, Barcelona',
    latitud: 41.3917,
    longitud: 2.1649,
    ultima_visita_at: '2026-07-20',
    codigo: 'FAR-004',
    decil: 'D09',
    total_2025: 59000,
    total_2026: 64000,
    telefono: '932 445 566',
    provincia: 'Barcelona',
    ciudad: 'Barcelona',
    activo: true
  },
  {
    id: 'cli-005',
    nombre: 'Farmacia Atocha Estación',
    tipo: 'Farmacia',
    contacto_nombre: 'Dr. Roberto Blanco',
    direccion: 'Plaza de Emperador Carlos V, Madrid',
    latitud: 40.4068,
    longitud: -3.6896,
    ultima_visita_at: '2026-08-10',
    codigo: 'FAR-005',
    decil: 'D08',
    total_2025: 41000,
    total_2026: 46000,
    telefono: '915 223 344',
    provincia: 'Madrid',
    ciudad: 'Madrid',
    activo: true
  },
  {
    id: 'cli-006',
    nombre: 'Farmacia Valencia Centro',
    tipo: 'Farmacia',
    contacto_nombre: 'Dra. Isabel Soriano',
    direccion: 'Calle Xàtiva 15, Valencia',
    latitud: 39.4667,
    longitud: -0.3770,
    ultima_visita_at: '2026-07-15',
    codigo: 'FAR-006',
    decil: 'D07',
    total_2025: 32000,
    total_2026: 35000,
    telefono: '963 998 877',
    provincia: 'Valencia',
    ciudad: 'Valencia',
    activo: true
  }
];

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 1200): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
}

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

  getProfilesSync(): UserProfile[] {
    const ver = localStorage.getItem('plataforma_data_version');
    if (ver !== PROFILES_VERSION) {
      localStorage.setItem('plataforma_profiles', JSON.stringify(DEFAULT_PROFILES));
      localStorage.setItem('plataforma_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
      localStorage.setItem('plataforma_data_version', PROFILES_VERSION);
      return DEFAULT_PROFILES;
    }
    return this.getLocal('profiles', DEFAULT_PROFILES);
  }

  getPermissionsSync(): AppPermission[] {
    const ver = localStorage.getItem('plataforma_data_version');
    if (ver !== PROFILES_VERSION) {
      localStorage.setItem('plataforma_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
      return DEFAULT_PERMISSIONS;
    }
    return this.getLocal('permissions', DEFAULT_PERMISSIONS);
  }

  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('profiles').select('*'));
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('profiles', res.data as UserProfile[]);
          return res.data as UserProfile[];
        }
      } catch (e) {}
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
      withTimeout(supabase.from('profiles').insert(newProfile)).catch(() => {});
    }

    const current = this.getLocal('profiles', DEFAULT_PROFILES);
    const updated = [...current, newProfile];
    this.setLocal('profiles', updated);
    return newProfile;
  }

  async getPermissions(): Promise<AppPermission[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('app_permissions').select('*'));
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('permissions', res.data as AppPermission[]);
          return res.data as AppPermission[];
        }
      } catch (e) {}
    }
    return this.getLocal('permissions', DEFAULT_PERMISSIONS);
  }

  async updateUserPermissions(userId: string, permissions: AppPermission[]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      for (const p of permissions) {
        withTimeout(supabase.from('app_permissions').upsert({
          user_id: userId,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' })).catch(() => {});
      }
    }

    const current = this.getLocal('permissions', DEFAULT_PERMISSIONS);
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...permissions];
    this.setLocal('permissions', updated);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }));
        if (!res.error && res.data) return res.data as AuditLog[];
      } catch (e) {}
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
      withTimeout(supabase.from('audit_logs').insert(log)).catch(() => {});
    }

    const logs = this.getLocal('audit_logs', []);
    this.setLocal('audit_logs', [log, ...logs]);
  }

  async getWorkouts(): Promise<FitnessWorkout[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }));
        if (!res.error && res.data) return res.data as FitnessWorkout[];
      } catch (e) {}
    }
    return this.getLocal('workouts', DEFAULT_WORKOUTS);
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      id: crypto.randomUUID ? crypto.randomUUID() : `fit_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').insert(item)).catch(() => {});
    }
    const current = this.getLocal('workouts', DEFAULT_WORKOUTS);
    const updated = [item, ...current];
    this.setLocal('workouts', updated);
    return item;
  }

  async getExpenses(): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('expenses').select('*').order('transaction_date', { ascending: false }));
        if (!res.error && res.data) return res.data as ExpenseItem[];
      } catch (e) {}
    }
    return this.getLocal('expenses', DEFAULT_EXPENSES);
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      id: crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').insert(item)).catch(() => {});
    }
    const current = this.getLocal('expenses', DEFAULT_EXPENSES);
    const updated = [item, ...current];
    this.setLocal('expenses', updated);
    return item;
  }

  async deleteExpense(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').delete().eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('expenses', DEFAULT_EXPENSES);
    const updated = current.filter(e => e.id !== id);
    this.setLocal('expenses', updated);
  }

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }));
        if (!res.error && res.data) return res.data as SavingsGoal[];
      } catch (e) {}
    }
    return this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID ? crypto.randomUUID() : `goal_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').insert(item)).catch(() => {});
    }
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = [item, ...current];
    this.setLocal('savings_goals', updated);
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').update(updates).eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = current.map(g => g.id === id ? { ...g, ...updates } : g);
    this.setLocal('savings_goals', updated);
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').delete().eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = current.filter(g => g.id !== id);
    this.setLocal('savings_goals', updated);
  }

  async getLibrary(): Promise<LibraryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('user_library').select('*'));
        if (!res.error && res.data) return res.data as LibraryItem[];
      } catch (e) {}
    }
    return this.getLocal('library', DEFAULT_LIBRARY);
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `lib_${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').insert(newItem)).catch(() => {});
    }
    const current = this.getLocal('library', DEFAULT_LIBRARY);
    const updated = [newItem, ...current];
    this.setLocal('library', updated);
    return newItem;
  }

  async getLoreClients(): Promise<LoreClient[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('lore_clients').select('*'));
        if (!res.error && res.data && res.data.length > 0) return res.data as LoreClient[];
      } catch (e) {}
    }
    return this.getLocal('lore_clients', DEFAULT_CLIENTS);
  }

  async getSavedRoutes(): Promise<LoreSavedRoute[]> {
    return this.getLocal('lore_saved_routes', []);
  }

  async saveRoute(name: string, clientIds: string[], totalDistanceKm: number): Promise<LoreSavedRoute> {
    const route: LoreSavedRoute = {
      id: `route_${Date.now()}`,
      name,
      date: new Date().toISOString().split('T')[0],
      clientIds,
      totalDistanceKm,
      createdAt: new Date().toISOString()
    };
    const current = this.getLocal('lore_saved_routes', []);
    const updated = [route, ...current];
    this.setLocal('lore_saved_routes', updated);
    return route;
  }
}

export const storageService = new StorageService();
