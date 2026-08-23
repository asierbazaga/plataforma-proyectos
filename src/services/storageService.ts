import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, AppPermission, AuditLog, FitnessWorkout, ExpenseItem, SavingsGoal, CategoryBudget, LibraryItem, LoreClient, LoreSavedRoute } from '../types';

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
  // Asier Bazaga: Admin Total
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'lore', can_access: true, can_edit: true },

  // Lore: Usuario
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'lore', can_access: true, can_edit: true },

  // Invitado: Solo lectura
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'fitness', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'gastos', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'libros-juegos', can_access: true, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'lore', can_access: false, can_edit: false }
];

const DEFAULT_WORKOUTS: FitnessWorkout[] = [
  { id: '1', title: 'Entrenamiento Fuerza Pecho y Tríceps', category: 'Fuerza', duration_minutes: 50, calories_burned: 420, workout_date: '2026-08-14', notes: 'Press banca 4x10, Fondos 3x12' },
  { id: '2', title: 'Carrera Continua 7K', category: 'Cardio', duration_minutes: 35, calories_burned: 380, workout_date: '2026-08-13', notes: 'Ritmo suave 5:00 min/km' }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [];

const DEFAULT_SAVINGS_GOALS: SavingsGoal[] = [];

const DEFAULT_CATEGORY_BUDGETS: CategoryBudget[] = [
  { category: 'Alimentación', monthly_limit: 400, icon: '🛒', color: '#10B981' },
  { category: 'Hogar / Alquiler', monthly_limit: 750, icon: '🏠', color: '#6366F1' },
  { category: 'Transporte / Gasolina', monthly_limit: 150, icon: '🚗', color: '#F59E0B' },
  { category: 'Ocio & Restaurantes', monthly_limit: 200, icon: '🍿', color: '#EC4899' },
  { category: 'Servicios / Suministros', monthly_limit: 120, icon: '⚡', color: '#06B6D4' },
  { category: 'Tecnología', monthly_limit: 100, icon: '💻', color: '#8B5CF6' },
  { category: 'Salud & Bienestar', monthly_limit: 80, icon: '💊', color: '#14B8A6' },
  { category: 'Otros', monthly_limit: 100, icon: '📦', color: '#64748B' }
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
    contacto_nombre: 'Dr. Carlos Mendoza',
    direccion: 'Calle Serrano 88, Madrid',
    latitud: 40.4312,
    longitud: -3.6872,
    ultima_visita_at: '2026-08-05',
    codigo: 'FAR-002',
    decil: 'D09',
    total_2025: 72000,
    total_2026: 78000,
    telefono: '913 456 789',
    provincia: 'Madrid',
    ciudad: 'Madrid',
    activo: true
  },
  {
    id: 'cli-003',
    nombre: 'Farmacia Gràcia Salud',
    tipo: 'Farmacia Estándar',
    contacto_nombre: 'Dra. Montserrat Valls',
    direccion: 'Carrer Gran de Gràcia 54, Barcelona',
    latitud: 41.4015,
    longitud: 2.1558,
    ultima_visita_at: '2026-07-28',
    codigo: 'FAR-003',
    decil: 'D08',
    total_2025: 54000,
    total_2026: 61000,
    telefono: '932 112 233',
    provincia: 'Barcelona',
    ciudad: 'Barcelona',
    activo: true
  },
  {
    id: 'cli-004',
    nombre: 'Farmacia Diagonal Forum',
    tipo: 'Farmacia VIP',
    contacto_nombre: 'Dr. Jordi Puig',
    direccion: 'Avinguda Diagonal 120, Barcelona',
    latitud: 41.4061,
    longitud: 2.1989,
    ultima_visita_at: '2026-08-02',
    codigo: 'FAR-004',
    decil: 'D10',
    total_2025: 98000,
    total_2026: 105000,
    telefono: '934 556 677',
    provincia: 'Barcelona',
    ciudad: 'Barcelona',
    activo: true
  },
  {
    id: 'cli-005',
    nombre: 'Farmacia Triana Tradición',
    tipo: 'Farmacia Estándar',
    contacto_nombre: 'Dra. Carmen Morales',
    direccion: 'Calle San Jacinto 30, Sevilla',
    latitud: 37.3831,
    longitud: -6.0042,
    ultima_visita_at: '2026-07-20',
    codigo: 'FAR-005',
    decil: 'D07',
    total_2025: 41000,
    total_2026: 44000,
    telefono: '954 223 344',
    provincia: 'Sevilla',
    ciudad: 'Sevilla',
    activo: true
  },
  {
    id: 'cli-006',
    nombre: 'Farmacia Colón Valencia',
    tipo: 'Farmacia Estándar',
    contacto_nombre: 'Dr. Vicente Navarro',
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

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 2500): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
}

type SyncCallback = () => void;

class StorageService {
  private syncCallbacks: Set<SyncCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: any = null;

  constructor() {
    // 0. Limpieza única de objetivos de prueba para empezar de cero limpio
    if (typeof window !== 'undefined' && !localStorage.getItem('plataforma_goals_reset_clean_v2')) {
      localStorage.setItem('plataforma_savings_goals', JSON.stringify([]));
      localStorage.setItem('plataforma_goals_reset_clean_v2', 'true');
    }

    // 1. BroadcastChannel entre pestañas locales del mismo navegador
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('plataforma_sync_channel');
        this.broadcastChannel.onmessage = () => {
          this.notifySubscribers();
        };
      } catch (e) {}
    }

    // 2. Supabase Realtime (WebSockets) para sincronizar Móvil <-> Web en milisegundos
    if (isSupabaseConfigured && supabase) {
      try {
        this.realtimeChannel = supabase.channel('plataforma-live-sync')
          .on('postgres_changes', { event: '*', schema: 'public' }, () => {
            this.syncFromCloud().then(() => this.notifySubscribers());
          })
          .on('broadcast', { event: 'data_changed' }, () => {
            this.syncFromCloud().then(() => this.notifySubscribers());
          })
          .subscribe();
      } catch (e) {}
    }

    // 3. Listener en reconexión, foco de ventana y desbloqueo de móvil
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => this.syncFromCloud());
      window.addEventListener('online', () => this.syncFromCloud());
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.syncFromCloud();
        }
      });
    }
  }

  // Suscribirse a cambios en tiempo real
  onSync(cb: SyncCallback): () => void {
    this.syncCallbacks.add(cb);
    return () => {
      this.syncCallbacks.delete(cb);
    };
  }

  private notifySubscribers() {
    this.syncCallbacks.forEach(cb => {
      try {
        cb();
      } catch (e) {}
    });
  }

  // Difundir cambio a todos los dispositivos móviles y web
  private broadcastChange() {
    this.notifySubscribers();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ timestamp: Date.now() });
      } catch (e) {}
    }
    if (this.realtimeChannel) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'data_changed',
          payload: { timestamp: Date.now() }
        });
      } catch (e) {}
    }
  }

  // Sincronizar todos los módulos automáticamente desde Supabase a LocalStorage en paralelo
  async syncFromCloud(): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      const [goalsRes, expRes, budRes, clientsRes, wkRes, libRes] = await Promise.allSettled([
        withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }), 1500),
        withTimeout(supabase.from('expenses').select('*').order('transaction_date', { ascending: false }), 1500),
        withTimeout(supabase.from('category_budgets').select('*'), 1500),
        withTimeout(supabase.from('lore_clients').select('*'), 1500),
        withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 1500),
        withTimeout(supabase.from('user_library').select('*'), 1500)
      ]);

      if (goalsRes.status === 'fulfilled' && !goalsRes.value.error && goalsRes.value.data) {
        this.setLocal('savings_goals', goalsRes.value.data);
      }
      if (expRes.status === 'fulfilled' && !expRes.value.error && expRes.value.data) {
        this.setLocal('expenses', expRes.value.data);
      }
      if (budRes.status === 'fulfilled' && !budRes.value.error && budRes.value.data) {
        this.setLocal('category_budgets', budRes.value.data);
      }
      if (clientsRes.status === 'fulfilled' && !clientsRes.value.error && clientsRes.value.data) {
        this.setLocal('lore_clients', clientsRes.value.data);
      }
      if (wkRes.status === 'fulfilled' && !wkRes.value.error && wkRes.value.data) {
        this.setLocal('workouts', wkRes.value.data);
      }
      if (libRes.status === 'fulfilled' && !libRes.value.error && libRes.value.data) {
        this.setLocal('library', libRes.value.data);
      }

      this.notifySubscribers();
    } catch (e) {}
  }

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
    const local = this.getLocal('profiles', DEFAULT_PROFILES);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('profiles').select('*'), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('profiles', res.data as UserProfile[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async getPermissions(): Promise<AppPermission[]> {
    const local = this.getLocal('permissions', DEFAULT_PERMISSIONS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('app_permissions').select('*'), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('permissions', res.data as AppPermission[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async updatePermission(userId: string, appId: string, canAccess: boolean, canEdit: boolean): Promise<void> {
    const current = await this.getPermissions();
    const existingIndex = current.findIndex(p => p.user_id === userId && p.app_id === appId);
    let updated: AppPermission[];

    if (existingIndex >= 0) {
      updated = current.map((p, idx) => 
        idx === existingIndex ? { ...p, can_access: canAccess, can_edit: canEdit } : p
      );
    } else {
      updated = [...current, { user_id: userId, app_id: appId as any, can_access: canAccess, can_edit: canEdit }];
    }

    this.setLocal('permissions', updated);

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('app_permissions').upsert({
        user_id: userId,
        app_id: appId,
        can_access: canAccess,
        can_edit: canEdit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' })).catch(() => {});
    }

    this.broadcastChange();
  }

  async getWorkouts(): Promise<FitnessWorkout[]> {
    const local = this.getLocal('workouts', DEFAULT_WORKOUTS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data) {
          this.setLocal('workouts', res.data as FitnessWorkout[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      id: crypto.randomUUID ? crypto.randomUUID() : `wk_${Date.now()}`
    };
    const current = this.getLocal('workouts', DEFAULT_WORKOUTS);
    const updated = [item, ...current];
    this.setLocal('workouts', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').insert(item)).catch(() => {});
    }
    return item;
  }

  // ==========================================
  // GASTOS & MOVIMIENTOS
  // ==========================================
  async getExpenses(): Promise<ExpenseItem[]> {
    const local = this.getLocal('expenses', DEFAULT_EXPENSES);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').select('*').order('transaction_date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data) {
          this.setLocal('expenses', res.data as ExpenseItem[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      id: crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}`
    };
    const current = this.getLocal('expenses', DEFAULT_EXPENSES);
    const updated = [item, ...current];
    this.setLocal('expenses', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').insert(item)).catch(() => {});
    }
    return item;
  }

  async deleteExpense(id: string): Promise<void> {
    const current = this.getLocal('expenses', DEFAULT_EXPENSES);
    const updated = current.filter(e => e.id !== id);
    this.setLocal('expenses', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').delete().eq('id', id)).catch(() => {});
    }
  }

  async clearAllExpenses(): Promise<void> {
    this.setLocal('expenses', []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').delete().neq('id', '0')).catch(() => {});
    }
  }

  // ==========================================
  // METAS DE AHORRO (SAVINGS GOALS)
  // ==========================================
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const local = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('savings_goals', res.data as SavingsGoal[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID ? crypto.randomUUID() : `goal_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = [item, ...current];
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').insert(item)).catch(() => {});
    }
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>): Promise<void> {
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = current.map(g => g.id === id ? { ...g, ...updates } : g);
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').update(updates).eq('id', id)).catch(() => {});
    }
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    const current = this.getLocal('savings_goals', DEFAULT_SAVINGS_GOALS);
    const updated = current.filter(g => g.id !== id);
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').delete().eq('id', id)).catch(() => {});
    }
  }

  // ==========================================
  // PRESUPUESTOS POR CATEGORÍA
  // ==========================================
  async getCategoryBudgets(): Promise<CategoryBudget[]> {
    const local = this.getLocal('category_budgets', DEFAULT_CATEGORY_BUDGETS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('category_budgets').select('*'), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('category_budgets', res.data as CategoryBudget[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async updateCategoryBudget(category: string, monthlyLimit: number): Promise<void> {
    const current = await this.getCategoryBudgets();
    const existing = current.find(c => c.category === category);
    let updated: CategoryBudget[];
    if (existing) {
      updated = current.map(c => c.category === category ? { ...c, monthly_limit: monthlyLimit } : c);
    } else {
      updated = [...current, { category, monthly_limit: monthlyLimit }];
    }
    this.setLocal('category_budgets', updated);

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('category_budgets').upsert({
        category,
        monthly_limit: monthlyLimit,
        updated_at: new Date().toISOString()
      })).catch(() => {});
    }

    this.broadcastChange();
  }

  // ==========================================
  // BIBLIOTECA (LIBROS & JUEGOS)
  // ==========================================
  async getLibrary(): Promise<LibraryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('user_library').select('*'));
        if (!res.error && res.data) {
          this.setLocal('library', res.data as LibraryItem[]);
          return res.data as LibraryItem[];
        }
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
    this.broadcastChange();
    return newItem;
  }

  async updateLibraryItem(id: string, updates: Partial<LibraryItem>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').update(updates).eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('library', DEFAULT_LIBRARY);
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    this.setLocal('library', updated);
    this.broadcastChange();
  }

  // ==========================================
  // LORE CLIENTES (FARMACIAS & RUTAS)
  // ==========================================
  async getLoreClients(): Promise<LoreClient[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('lore_clients').select('*'));
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('lore_clients', res.data as LoreClient[]);
          return res.data as LoreClient[];
        }
      } catch (e) {}
    }
    return this.getLocal('lore_clients', DEFAULT_CLIENTS);
  }

  async addLoreClient(client: Omit<LoreClient, 'id'>): Promise<LoreClient> {
    const item: LoreClient = {
      ...client,
      id: crypto.randomUUID ? crypto.randomUUID() : `cli-${Date.now()}`
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').insert(item)).catch(() => {});
    }
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = [item, ...current];
    this.setLocal('lore_clients', updated);
    this.broadcastChange();
    return item;
  }

  async updateLoreClient(id: string, updates: Partial<LoreClient>): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').update(updates).eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();
  }

  async deleteLoreClient(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').delete().eq('id', id)).catch(() => {});
    }
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = current.filter(c => c.id !== id);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();
  }

  async createProfile(profile: Omit<UserProfile, 'id' | 'created_at'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('profiles').insert(newProfile)).catch(() => {});
    }
    const current = await this.getProfiles();
    const updated = [...current, newProfile];
    this.setLocal('profiles', updated);
    this.broadcastChange();
    return newProfile;
  }

  async updateUserPermissions(userId: string, newPerms: AppPermission[]): Promise<void> {
    const current = await this.getPermissions();
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...newPerms];
    this.setLocal('permissions', updated);

    if (isSupabaseConfigured && supabase) {
      newPerms.forEach(p => {
        withTimeout(supabase.from('app_permissions').upsert({
          user_id: p.user_id,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' })).catch(() => {});
      });
    }
    this.broadcastChange();
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50));
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
    const current = this.getLocal('audit_logs', []);
    const updated = [log, ...current.slice(0, 49)];
    this.setLocal('audit_logs', updated);
  }

  async getSavedRoutes(): Promise<LoreSavedRoute[]> {
    return this.getLocal('lore_saved_routes', []);
  }

  async saveRoute(nameOrObj: string | Omit<LoreSavedRoute, 'id' | 'createdAt'>, clientIds?: string[], totalDistanceKm?: number): Promise<LoreSavedRoute> {
    let item: LoreSavedRoute;
    if (typeof nameOrObj === 'string') {
      item = {
        id: crypto.randomUUID ? crypto.randomUUID() : `route_${Date.now()}`,
        name: nameOrObj,
        date: new Date().toISOString().split('T')[0],
        clientIds: clientIds || [],
        totalDistanceKm: totalDistanceKm || 0,
        createdAt: new Date().toISOString()
      };
    } else {
      item = {
        ...nameOrObj,
        id: crypto.randomUUID ? crypto.randomUUID() : `route_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
    }
    const current = this.getLocal('lore_saved_routes', []);
    const updated = [item, ...current];
    this.setLocal('lore_saved_routes', updated);
    this.broadcastChange();
    return item;
  }

  async deleteLoreRoute(id: string): Promise<void> {
    const current = this.getLocal('lore_saved_routes', []);
    const updated = current.filter(r => r.id !== id);
    this.setLocal('lore_saved_routes', updated);
    this.broadcastChange();
  }
}

export const storageService = new StorageService();
