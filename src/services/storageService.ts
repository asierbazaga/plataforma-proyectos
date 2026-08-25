import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  UserProfile,
  AppPermission,
  AuditLog,
  FitnessWorkout,
  FitnessProfile,
  DailyNutritionLog,
  BodyProgressEntry,
  PolarGritMetrics,
  ExpenseItem,
  SavingsGoal,
  CategoryBudget,
  LibraryItem,
  LoreClient,
  LoreSavedRoute,
  CandidateInterview
} from '../types';
import { INITIAL_CANDIDATE_SAMPLE } from '../apps/entrevistas/services/mecaluxRubrics';

const PROFILES_VERSION = 'v3_asier_entrevistas_mecalux';

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'asier.bazaga@plataforma.com',
    full_name: 'Asier Bazaga',
    role: 'admin',
    status: 'active',
    password: 'admin',
    department: 'Dirección IT & Super Admin',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    email: 'lore@plataforma.com',
    full_name: 'Lore',
    role: 'user',
    status: 'active',
    password: 'lore',
    department: 'Operaciones & Gestión',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    created_at: new Date().toISOString()
  },
  {
    id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    email: 'invitado@plataforma.com',
    full_name: 'Invitado Demo',
    role: 'guest',
    status: 'active',
    password: 'demo',
    department: 'Consultoría Externa',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PERMISSIONS: AppPermission[] = [
  // Asier Bazaga: Admin Total (Módulo Entrevistas Exclusivo para Asier)
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'lore', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'entrevistas', can_access: true, can_edit: true },

  // Lore: Usuario (Sin acceso al módulo de entrevistas de Asier)
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'lore', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'entrevistas', can_access: false, can_edit: false },

  // Invitado: Solo lectura (Sin acceso al módulo de entrevistas)
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'fitness', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'gastos', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'libros-juegos', can_access: true, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'lore', can_access: false, can_edit: false },
  { user_id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', app_id: 'entrevistas', can_access: false, can_edit: false }
];

const DEFAULT_FITNESS_PROFILE: FitnessProfile = {
  age: 28,
  gender: 'male',
  height_cm: 178,
  current_weight: 95.7,
  target_weight: 75.0,
  activity_level: 'moderate',
  goal: 'fat_loss',
  deficit_surplus_pct: -20,
  target_calories: 2150,
  target_protein: 165,
  target_carbs: 210,
  target_fat: 65,
  target_water_ml: 3000,
  target_daily_steps: 10000,
  carb_cycling_enabled: false,
  training_day_carbs: 220,
  rest_day_carbs: 150,
  onboarding_completed: true,
  updated_at: new Date().toISOString()
};

const DEFAULT_WORKOUTS: FitnessWorkout[] = [];

const DEFAULT_NUTRITION_LOGS: DailyNutritionLog[] = [];

const DEFAULT_BODY_PROGRESS: BodyProgressEntry[] = [
  {
    id: 'bp_initial_asier',
    user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    date: new Date().toISOString().split('T')[0],
    weight: 95.7,
    notes: 'Pesaje inicial del plan'
  }
];

const DEFAULT_POLAR_METRICS: PolarGritMetrics[] = [];

const DEFAULT_WALLET_CONFIG: import('../types').WalletConfig = {
  account_1_name: 'Abanca Personal',
  account_1_initial_balance: 0,
  account_2_name: 'ING Conjunta',
  account_2_initial_balance: 0,
  onboarding_completed: false
};

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

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    Promise.resolve(promiseLike),
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Network Timeout')), ms))
  ]);
}

type SyncCallback = () => void;

const CURRENT_STORAGE_VERSION = 'v5_clean_unified_sync_2026';

class StorageService {
  private syncCallbacks: Set<SyncCallback> = new Set();
  private broadcastChannel: BroadcastChannel | null = null;
  private realtimeChannel: any = null;
  private isSyncing: boolean = false;

  constructor() {
    // 0. Auto-purgado y sincronización limpia para garantizar coincidencia al 100% entre móvil y PC
    if (typeof window !== 'undefined') {
      const currentVer = localStorage.getItem('plataforma_system_version');
      if (currentVer !== CURRENT_STORAGE_VERSION) {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('plataforma_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('plataforma_system_version', CURRENT_STORAGE_VERSION);
        localStorage.setItem('plataforma_active_email', 'asier.bazaga@plataforma.com');
      }
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
    this.initRealtimeChannel();

    // 3. Listener en reconexión, foco de ventana, desbloqueo de móvil y timer de refresco
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        this.initRealtimeChannel();
        this.syncFromCloud();
      });
      window.addEventListener('online', () => {
        this.initRealtimeChannel();
        this.flushOfflineQueue();
        this.syncFromCloud();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.initRealtimeChannel();
          this.flushOfflineQueue();
          this.syncFromCloud();
        }
      });

      // Sincronización continua de fondo cada 20 segundos
      setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.flushOfflineQueue();
          this.syncFromCloud();
        }
      }, 20000);

      // Sincronización inicial inmediata
      setTimeout(() => {
        this.flushOfflineQueue();
        this.syncFromCloud();
      }, 100);
    }
  }

  private initRealtimeChannel() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      if (this.realtimeChannel) {
        try { supabase.removeChannel(this.realtimeChannel); } catch (e) {}
      }
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

  // --- COLA OFFLINE Y AUTO-RECUPERACIÓN ---
  private queueOfflineMutation(table: string, action: 'upsert' | 'delete', data: any, conflictTarget?: string) {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('plataforma_offline_queue') || '[]';
      const queue = JSON.parse(raw);
      queue.push({
        id: `mut_${Date.now()}_${Math.random()}`,
        table,
        action,
        data,
        conflictTarget,
        timestamp: Date.now()
      });
      localStorage.setItem('plataforma_offline_queue', JSON.stringify(queue.slice(-100)));
    } catch (e) {}
  }

  async flushOfflineQueue(): Promise<void> {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem('plataforma_offline_queue');
      if (!raw) return;
      const queue = JSON.parse(raw);
      if (!Array.isArray(queue) || queue.length === 0) return;

      const remaining: any[] = [];
      for (const item of queue) {
        try {
          if (item.action === 'upsert') {
            const opts = item.conflictTarget ? { onConflict: item.conflictTarget } : undefined;
            const res = await withTimeout(supabase.from(item.table).upsert(item.data, opts), 4000);
            if (res.error) remaining.push(item);
          } else if (item.action === 'delete') {
            const res = await withTimeout(supabase.from(item.table).delete().eq('id', item.data.id), 4000);
            if (res.error) remaining.push(item);
          }
        } catch (e) {
          remaining.push(item);
        }
      }
      localStorage.setItem('plataforma_offline_queue', JSON.stringify(remaining));
    } catch (e) {}
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
    if (!isSupabaseConfigured || !supabase || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const [goalsRes, expRes, budRes, clientsRes, wkRes, libRes, profRes, nutRes, bpRes, polRes, profilesRes, permsRes] = await Promise.allSettled([
        withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }), 5000),
        withTimeout(supabase.from('expenses').select('*').order('transaction_date', { ascending: false }), 5000),
        withTimeout(supabase.from('category_budgets').select('*'), 5000),
        withTimeout(supabase.from('lore_clients').select('*'), 5000),
        withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 5000),
        withTimeout(supabase.from('user_library').select('*'), 5000),
        withTimeout(supabase.from('fitness_profiles').select('*'), 5000),
        withTimeout(supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false }), 5000),
        withTimeout(supabase.from('fitness_body_progress').select('*').order('date', { ascending: false }), 5000),
        withTimeout(supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false }), 5000),
        withTimeout(supabase.from('profiles').select('*'), 5000),
        withTimeout(supabase.from('app_permissions').select('*'), 5000)
      ]);

      if (profilesRes.status === 'fulfilled' && !profilesRes.value.error && profilesRes.value.data && profilesRes.value.data.length > 0) {
        this.setLocal('profiles', profilesRes.value.data);
      }
      if (permsRes.status === 'fulfilled' && !permsRes.value.error && permsRes.value.data && permsRes.value.data.length > 0) {
        this.setLocal('permissions', permsRes.value.data);
      }

      if (goalsRes.status === 'fulfilled' && !goalsRes.value.error && goalsRes.value.data) {
        const goals = goalsRes.value.data as SavingsGoal[];
        this.setLocal('savings_goals', goals);
        const byUser = new Map<string, SavingsGoal[]>();
        goals.forEach(g => {
          if (g.user_id) {
            const list = byUser.get(g.user_id) || [];
            list.push(g);
            byUser.set(g.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('savings_goals', uid), list);
        });
      }

      if (expRes.status === 'fulfilled' && !expRes.value.error && expRes.value.data) {
        const expenses = expRes.value.data as ExpenseItem[];
        this.setLocal('expenses', expenses);
        const byUser = new Map<string, ExpenseItem[]>();
        expenses.forEach(e => {
          if (e.user_id) {
            const list = byUser.get(e.user_id) || [];
            list.push(e);
            byUser.set(e.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('expenses', uid), list);
        });
      }

      if (budRes.status === 'fulfilled' && !budRes.value.error && budRes.value.data && budRes.value.data.length > 0) {
        this.setLocal('category_budgets', budRes.value.data);
      }
      if (clientsRes.status === 'fulfilled' && !clientsRes.value.error && clientsRes.value.data) {
        this.setLocal('lore_clients', clientsRes.value.data);
      }

      if (wkRes.status === 'fulfilled' && !wkRes.value.error && wkRes.value.data) {
        const workouts = wkRes.value.data as FitnessWorkout[];
        this.setLocal('workouts', workouts);
        const byUser = new Map<string, FitnessWorkout[]>();
        workouts.forEach(w => {
          if (w.user_id) {
            const list = byUser.get(w.user_id) || [];
            list.push(w);
            byUser.set(w.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('workouts', uid), list);
        });
      }

      if (libRes.status === 'fulfilled' && !libRes.value.error && libRes.value.data) {
        this.setLocal('library', libRes.value.data);
      }

      if (profRes.status === 'fulfilled' && !profRes.value.error && profRes.value.data && profRes.value.data.length > 0) {
        const profiles = profRes.value.data as FitnessProfile[];
        profiles.forEach(p => {
          if (p.user_id) {
            this.setLocal(this.getUserKey('fitness_profile', p.user_id), p);
          }
          if (!p.user_id || p.user_id === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') {
            this.setLocal('fitness_profile', p);
          }
        });
      }

      if (nutRes.status === 'fulfilled' && !nutRes.value.error && nutRes.value.data) {
        const logs = nutRes.value.data as DailyNutritionLog[];
        this.setLocal('nutrition_logs', logs);
        const byUser = new Map<string, DailyNutritionLog[]>();
        logs.forEach(n => {
          if (n.user_id) {
            const list = byUser.get(n.user_id) || [];
            list.push(n);
            byUser.set(n.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('nutrition_logs', uid), list);
        });
      }

      if (bpRes.status === 'fulfilled' && !bpRes.value.error && bpRes.value.data) {
        const bodyProgress = bpRes.value.data as BodyProgressEntry[];
        this.setLocal('body_progress', bodyProgress);
        const byUser = new Map<string, BodyProgressEntry[]>();
        bodyProgress.forEach(b => {
          if (b.user_id) {
            const list = byUser.get(b.user_id) || [];
            list.push(b);
            byUser.set(b.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('body_progress', uid), list);
        });
      }

      if (polRes.status === 'fulfilled' && !polRes.value.error && polRes.value.data) {
        const polar = polRes.value.data as PolarGritMetrics[];
        this.setLocal('polar_metrics', polar);
        const byUser = new Map<string, PolarGritMetrics[]>();
        polar.forEach(p => {
          if (p.user_id) {
            const list = byUser.get(p.user_id) || [];
            list.push(p);
            byUser.set(p.user_id, list);
          }
        });
        byUser.forEach((list, uid) => {
          this.setLocal(this.getUserKey('polar_metrics', uid), list);
        });
      }

      this.notifySubscribers();
    } catch (e) {
    } finally {
      this.isSyncing = false;
    }
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

  private getPasswordMap(): Record<string, string> {
    return this.getLocal<Record<string, string>>('user_passwords', {
      'asier.bazaga@plataforma.com': 'admin',
      'asier': 'admin',
      'lore@plataforma.com': 'lore',
      'lore': 'lore',
      'invitado@plataforma.com': 'demo',
      'invitado': 'demo'
    });
  }

  private savePassword(identifier: string, pass: string): void {
    const map = this.getPasswordMap();
    const cleanId = identifier.trim().toLowerCase();
    map[cleanId] = pass.trim();
    this.setLocal('user_passwords', map);
  }

  getPasswordForUser(user: UserProfile): string {
    const map = this.getPasswordMap();
    const fromMap = map[user.email.toLowerCase()] || map[user.id] || map[user.full_name.toLowerCase()] || map[user.full_name.split(' ')[0].toLowerCase()];
    return user.password || fromMap || (user.role === 'admin' ? 'admin' : '123456');
  }

  getProfilesSync(): UserProfile[] {
    const ver = localStorage.getItem('plataforma_data_version');
    if (ver !== PROFILES_VERSION) {
      localStorage.setItem('plataforma_profiles', JSON.stringify(DEFAULT_PROFILES));
      localStorage.setItem('plataforma_permissions', JSON.stringify(DEFAULT_PERMISSIONS));
      localStorage.setItem('plataforma_data_version', PROFILES_VERSION);
      return DEFAULT_PROFILES;
    }
    const profiles = this.getLocal('profiles', DEFAULT_PROFILES);
    const map = this.getPasswordMap();
    return profiles.map(p => ({
      ...p,
      password: p.password || map[p.email.toLowerCase()] || map[p.id] || (p.role === 'admin' ? 'admin' : '123456')
    }));
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
        const res = await withTimeout(supabase.from('profiles').select('*'), 3000);
        if (!res.error && res.data && res.data.length > 0) {
          const map = this.getPasswordMap();
          const merged = (res.data as UserProfile[]).map(p => ({
            ...p,
            password: map[p.email.toLowerCase()] || map[p.id] || p.password || (p.role === 'admin' ? 'admin' : '123456')
          }));
          this.setLocal('profiles', merged);
          return merged;
        }
      } catch (e) {}
    }
    return this.getProfilesSync();
  }

  async getPermissions(): Promise<AppPermission[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('app_permissions').select('*'), 3000);
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('permissions', res.data as AppPermission[]);
          return res.data as AppPermission[];
        }
      } catch (e) {}
    }
    return this.getLocal('permissions', DEFAULT_PERMISSIONS);
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

  private getUserKey(baseKey: string, userId?: string): string {
    if (!userId) return baseKey;
    if (userId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' || userId.includes('asier')) {
      return baseKey;
    }
    return `${baseKey}_${userId}`;
  }

  // ==========================================
  // FITNESS & SALUD INTEGRAL (CAMBIO FÍSICO + POLAR)
  // ==========================================
  async getFitnessProfile(userId?: string): Promise<FitnessProfile> {
    const isAsier = !userId || userId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' || userId.includes('asier');
    const key = this.getUserKey('fitness_profile', userId);
    const defaultProfile: FitnessProfile = {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: userId,
      onboarding_completed: isAsier ? true : false,
      current_weight: isAsier ? 95.7 : 75.0
    };

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_profiles').select('*');
        if (userId && userId !== 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' && !userId.includes('asier')) {
          query = query.eq('user_id', userId);
        }
        query = query.order('updated_at', { ascending: false }).limit(1);

        const res = await withTimeout(query, 3000);
        if (!res.error && res.data && res.data.length > 0) {
          const remote = res.data[0] as FitnessProfile;
          if (isAsier) {
            remote.onboarding_completed = true;
            if (!remote.current_weight || remote.current_weight < 80) {
              remote.current_weight = 95.7;
            }
          }
          this.setLocal(key, remote);
          return remote;
        }
      } catch (e) {}
    }
    return this.getLocal(key, defaultProfile);
  }

  async updateFitnessProfile(updates: Partial<FitnessProfile>, userId?: string): Promise<FitnessProfile> {
    const current = await this.getFitnessProfile(userId);
    const key = this.getUserKey('fitness_profile', userId);
    const effectiveUserId = userId || current.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const updated: FitnessProfile & { id?: string } = {
      ...current,
      ...updates,
      user_id: effectiveUserId,
      id: (current as any).id || `prof_${effectiveUserId.slice(0, 12)}`,
      updated_at: new Date().toISOString()
    };
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_profiles').upsert(updated, { onConflict: 'user_id' }), 6000)
        .catch(() => this.queueOfflineMutation('fitness_profiles', 'upsert', updated, 'user_id'));
    }
    return updated;
  }

  async getWorkouts(userId?: string): Promise<FitnessWorkout[]> {
    const key = this.getUserKey('workouts', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as FitnessWorkout[]);
          return res.data as FitnessWorkout[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_WORKOUTS);
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>, userId?: string): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      user_id: userId || workout.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : `wk_${Date.now()}`
    };
    const key = this.getUserKey('workouts', userId);
    const current = this.getLocal(key, DEFAULT_WORKOUTS);
    const updated = [item, ...current];
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').upsert(item), 6000)
        .catch(() => this.queueOfflineMutation('fitness_workouts', 'upsert', item));
    }
    return item;
  }

  async deleteWorkout(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('workouts', userId);
    const current = this.getLocal(key, DEFAULT_WORKOUTS);
    const updated = current.filter(w => w.id !== id);
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('fitness_workouts', 'delete', { id }));
    }
  }

  // --- NUTRICIÓN & MACROS ---
  async getDailyNutritionLogs(userId?: string): Promise<DailyNutritionLog[]> {
    const key = this.getUserKey('nutrition_logs', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as DailyNutritionLog[]);
          return res.data as DailyNutritionLog[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_NUTRITION_LOGS);
  }

  async getDailyNutrition(date: string, userId?: string): Promise<DailyNutritionLog> {
    const logs = await this.getDailyNutritionLogs(userId);
    const found = logs.find(l => l.date === date);
    if (found) return found;

    const newLog: DailyNutritionLog = {
      id: `nut_${(userId || 'asier').slice(0, 8)}_${date}`,
      user_id: userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date,
      water_ml: 0,
      meals: []
    };
    return newLog;
  }

  async saveDailyNutrition(log: DailyNutritionLog, userId?: string): Promise<void> {
    const key = this.getUserKey('nutrition_logs', userId);
    const logs = this.getLocal(key, DEFAULT_NUTRITION_LOGS);
    const logWithUser: DailyNutritionLog = {
      ...log,
      user_id: userId || log.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    };
    const existingIndex = logs.findIndex(l => l.date === log.date);
    let updated: DailyNutritionLog[];
    if (existingIndex >= 0) {
      updated = logs.map((l, i) => i === existingIndex ? logWithUser : l);
    } else {
      updated = [logWithUser, ...logs];
    }
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_nutrition_logs').upsert(logWithUser, { onConflict: 'user_id,date' }), 6000)
        .catch(() => this.queueOfflineMutation('fitness_nutrition_logs', 'upsert', logWithUser, 'user_id,date'));
    }
  }

  async addFoodToDate(date: string, food: Omit<import('../types').FoodEntry, 'id'>, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const newFood: import('../types').FoodEntry = {
      ...food,
      id: crypto.randomUUID ? crypto.randomUUID() : `food_${Date.now()}`
    };
    const updatedLog: DailyNutritionLog = {
      ...log,
      meals: [...log.meals, newFood]
    };
    await this.saveDailyNutrition(updatedLog, userId);
  }

  async removeFoodFromDate(date: string, foodId: string, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const updatedLog: DailyNutritionLog = {
      ...log,
      meals: log.meals.filter(m => m.id !== foodId)
    };
    await this.saveDailyNutrition(updatedLog, userId);
  }

  async updateWater(date: string, amountMl: number, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const updatedLog: DailyNutritionLog = {
      ...log,
      water_ml: Math.max(0, amountMl)
    };
    await this.saveDailyNutrition(updatedLog, userId);
  }

  // --- CONTROL DE PESO & MEDIDAS ---
  async getBodyProgress(userId?: string): Promise<BodyProgressEntry[]> {
    const key = this.getUserKey('body_progress', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_body_progress').select('*').order('date', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as BodyProgressEntry[]);
          return res.data as BodyProgressEntry[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_BODY_PROGRESS);
  }

  async addBodyProgress(entry: Omit<BodyProgressEntry, 'id'>, userId?: string): Promise<BodyProgressEntry> {
    const item: BodyProgressEntry = {
      ...entry,
      user_id: userId || entry.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : `bp_${Date.now()}`
    };
    const key = this.getUserKey('body_progress', userId);
    const current = this.getLocal(key, DEFAULT_BODY_PROGRESS);
    const filtered = current.filter(e => e.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal(key, updated);

    // Actualizar también el peso actual en el perfil del usuario
    await this.updateFitnessProfile({ current_weight: item.weight }, userId);

    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').upsert(item, { onConflict: 'user_id,date' }), 6000)
        .catch(() => this.queueOfflineMutation('fitness_body_progress', 'upsert', item, 'user_id,date'));
    }
    return item;
  }

  async deleteBodyProgress(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('body_progress', userId);
    const current = this.getLocal(key, DEFAULT_BODY_PROGRESS);
    const updated = current.filter(e => e.id !== id);
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('fitness_body_progress', 'delete', { id }));
    }
  }

  // --- POLAR GRIT X PRO METRICS ---
  async getPolarMetrics(userId?: string): Promise<PolarGritMetrics[]> {
    const key = this.getUserKey('polar_metrics', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as PolarGritMetrics[]);
          return res.data as PolarGritMetrics[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_POLAR_METRICS);
  }

  async savePolarMetric(metric: Omit<PolarGritMetrics, 'id'>, userId?: string): Promise<PolarGritMetrics> {
    const item: PolarGritMetrics = {
      ...metric,
      user_id: userId || metric.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : `pol_${Date.now()}`
    };
    const key = this.getUserKey('polar_metrics', userId);
    const current = this.getLocal(key, DEFAULT_POLAR_METRICS);
    const filtered = current.filter(m => m.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_polar_metrics').upsert(item, { onConflict: 'user_id,date' }), 6000)
        .catch(() => this.queueOfflineMutation('fitness_polar_metrics', 'upsert', item, 'user_id,date'));
    }
    return item;
  }

  async resetFitnessData(userId?: string): Promise<void> {
    const defaultProfile: FitnessProfile = {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: userId,
      onboarding_completed: false
    };
    this.setLocal(this.getUserKey('fitness_profile', userId), defaultProfile);
    this.setLocal(this.getUserKey('workouts', userId), []);
    this.setLocal(this.getUserKey('nutrition_logs', userId), []);
    this.setLocal(this.getUserKey('body_progress', userId), []);
    this.setLocal(this.getUserKey('polar_metrics', userId), []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        let profileDel = supabase.from('fitness_profiles').delete();
        if (userId) profileDel = profileDel.eq('user_id', userId);
        await profileDel;
      } catch (e) {}
    }
  }

  // ==========================================
  // CONFIGURACIÓN DE CARTERA & BANCOS
  // ==========================================
  async getWalletConfig(userId?: string): Promise<import('../types').WalletConfig> {
    const key = this.getUserKey('wallet_config', userId);
    const isAsier = !userId || userId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' || userId.includes('asier');
    const defaultVal: import('../types').WalletConfig = isAsier ? {
      account_1_name: 'Abanca Personal',
      account_1_initial_balance: 0,
      account_2_name: 'ING Conjunta',
      account_2_initial_balance: 0,
      has_account_2: true,
      onboarding_completed: true
    } : {
      account_1_name: 'Cuenta Principal',
      account_1_initial_balance: 0,
      account_2_name: '',
      account_2_initial_balance: 0,
      has_account_2: false,
      onboarding_completed: false
    };

    return this.getLocal(key, defaultVal);
  }

  async updateWalletConfig(updates: Partial<import('../types').WalletConfig>, userId?: string): Promise<import('../types').WalletConfig> {
    const current = await this.getWalletConfig(userId);
    const key = this.getUserKey('wallet_config', userId);
    const updated: import('../types').WalletConfig = {
      ...current,
      ...updates
    };
    this.setLocal(key, updated);
    this.broadcastChange();
    return updated;
  }

  // ==========================================
  // GASTOS & MOVIMIENTOS
  // ==========================================
  async getExpenses(userId?: string): Promise<ExpenseItem[]> {
    const key = this.getUserKey('expenses', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('expenses').select('*').order('transaction_date', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as ExpenseItem[]);
          return res.data as ExpenseItem[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_EXPENSES);
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>, userId?: string): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      user_id: userId || expense.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : `exp_${Date.now()}`
    };
    const key = this.getUserKey('expenses', userId);
    const current = this.getLocal(key, DEFAULT_EXPENSES);
    const updated = [item, ...current];
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').upsert(item), 6000)
        .catch(() => this.queueOfflineMutation('expenses', 'upsert', item));
    }
    return item;
  }

  async deleteExpense(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('expenses', userId);
    const current = this.getLocal(key, DEFAULT_EXPENSES);
    const updated = current.filter(e => e.id !== id);
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('expenses', 'delete', { id }));
    }
  }

  async clearAllExpenses(userId?: string): Promise<void> {
    const key = this.getUserKey('expenses', userId);
    this.setLocal(key, []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('expenses').delete();
      if (userId) query = query.eq('user_id', userId);
      withTimeout(query, 6000).catch(() => {});
    }
  }

  // ==========================================
  // METAS DE AHORRO (SAVINGS GOALS)
  // ==========================================
  async getSavingsGoals(userId?: string): Promise<SavingsGoal[]> {
    const key = this.getUserKey('savings_goals', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data) {
          this.setLocal(key, res.data as SavingsGoal[]);
          return res.data as SavingsGoal[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_SAVINGS_GOALS);
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>, userId?: string): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      user_id: userId || goal.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : `goal_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal(key, DEFAULT_SAVINGS_GOALS);
    const updated = [item, ...current];
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').upsert(item), 6000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'upsert', item));
    }
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>, userId?: string): Promise<void> {
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal(key, DEFAULT_SAVINGS_GOALS);
    const updated = current.map(g => g.id === id ? { ...g, ...updates } : g);
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').update(updates).eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'upsert', { id, ...updates }));
    }
  }

  async deleteSavingsGoal(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal(key, DEFAULT_SAVINGS_GOALS);
    const updated = current.filter(g => g.id !== id);
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'delete', { id }));
    }
  }

  // ==========================================
  // PRESUPUESTOS POR CATEGORÍA
  // ==========================================
  async getCategoryBudgets(userId?: string): Promise<CategoryBudget[]> {
    const key = this.getUserKey('category_budgets', userId);
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('category_budgets').select('*');
        if (userId) {
          query = query.or(`user_id.eq.${userId},user_id.is.null`);
        }
        const res = await withTimeout(query, 3000);
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal(key, res.data as CategoryBudget[]);
          return res.data as CategoryBudget[];
        }
      } catch (e) {}
    }
    return this.getLocal(key, DEFAULT_CATEGORY_BUDGETS);
  }

  async updateCategoryBudget(category: string, monthlyLimit: number, userId?: string): Promise<void> {
    const current = await this.getCategoryBudgets(userId);
    const key = this.getUserKey('category_budgets', userId);
    const existing = current.find(c => c.category === category);
    let updated: CategoryBudget[];
    if (existing) {
      updated = current.map(c => c.category === category ? { ...c, monthly_limit: monthlyLimit } : c);
    } else {
      updated = [...current, { category, monthly_limit: monthlyLimit }];
    }
    this.setLocal(key, updated);

    if (isSupabaseConfigured && supabase) {
      const row = {
        category,
        monthly_limit: monthlyLimit,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      withTimeout(supabase.from('category_budgets').upsert(row, { onConflict: 'category' }), 6000)
        .catch(() => this.queueOfflineMutation('category_budgets', 'upsert', row, 'category'));
    }

    this.broadcastChange();
  }

  // ==========================================
  // BIBLIOTECA (LIBROS & JUEGOS)
  // ==========================================
  async getLibrary(): Promise<LibraryItem[]> {
    const local = this.getLocal('library', DEFAULT_LIBRARY);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').select('*'), 5000).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('library', res.data as LibraryItem[]);
          this.broadcastChange();
        }
      }).catch(() => {});
    }
    return local;
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : `lib_${Date.now()}`
    };
    const current = this.getLocal('library', DEFAULT_LIBRARY);
    const updated = [newItem, ...current];
    this.setLocal('library', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').upsert(newItem), 6000)
        .catch(() => this.queueOfflineMutation('user_library', 'upsert', newItem));
    }
    return newItem;
  }

  async updateLibraryItem(id: string, updates: Partial<LibraryItem>): Promise<void> {
    const current = this.getLocal('library', DEFAULT_LIBRARY);
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    this.setLocal('library', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').update(updates).eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('user_library', 'upsert', { id, ...updates }));
    }
  }

  // ==========================================
  // LORE CLIENTES (FARMACIAS & RUTAS)
  // ==========================================
  async getLoreClients(): Promise<LoreClient[]> {
    const local = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('lore_clients').select('*'), 3000);
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('lore_clients', res.data as LoreClient[]);
          return res.data as LoreClient[];
        }
      } catch (e) {}
    }
    return local;
  }

  async addLoreClient(client: Omit<LoreClient, 'id'>): Promise<LoreClient> {
    const item: LoreClient = {
      ...client,
      id: crypto.randomUUID ? crypto.randomUUID() : `cli-${Date.now()}`
    };
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = [item, ...current];
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').upsert(item), 6000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'upsert', item));
    }
    return item;
  }

  async updateLoreClient(id: string, updates: Partial<LoreClient>): Promise<void> {
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').update(updates).eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'upsert', { id, ...updates }));
    }
  }

  async deleteLoreClient(id: string): Promise<void> {
    const current = this.getLocal('lore_clients', DEFAULT_CLIENTS);
    const updated = current.filter(c => c.id !== id);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'delete', { id }));
    }
  }

  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    if (newProfile.password) {
      this.savePassword(newProfile.id, newProfile.password);
      this.savePassword(newProfile.email, newProfile.password);
    }

    if (isSupabaseConfigured && supabase) {
      const { password, ...supabaseProfile } = newProfile;
      withTimeout(supabase.from('profiles').upsert(supabaseProfile), 6000)
        .catch(() => this.queueOfflineMutation('profiles', 'upsert', supabaseProfile));
    }
    const current = await this.getProfiles();
    const updated = [...current, newProfile];
    this.setLocal('profiles', updated);

    // Inicializar permisos por defecto para las 5 aplicaciones
    const defaultApps: import('../types').AppId[] = ['fitness', 'gastos', 'libros-juegos', 'lore', 'entrevistas'];
    const initialPerms: AppPermission[] = defaultApps.map(appId => ({
      user_id: newProfile.id,
      app_id: appId,
      can_access: newProfile.role === 'admin' ? true : (appId === 'fitness' || appId === 'libros-juegos'),
      can_edit: newProfile.role === 'admin' ? true : appId === 'fitness'
    }));
    await this.updateUserPermissions(newProfile.id, initialPerms);

    this.broadcastChange();
    return newProfile;
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const current = await this.getProfiles();
    const existingIndex = current.findIndex(p => p.id === id);
    if (existingIndex === -1) return null;

    const updatedProfile = {
      ...current[existingIndex],
      ...updates
    };

    if (updates.password) {
      this.savePassword(id, updates.password);
      this.savePassword(updatedProfile.email, updates.password);
      if (updatedProfile.full_name) {
        this.savePassword(updatedProfile.full_name, updates.password);
        this.savePassword(updatedProfile.full_name.split(' ')[0], updates.password);
      }
    }

    const updated = [...current];
    updated[existingIndex] = updatedProfile;
    this.setLocal('profiles', updated);

    if (isSupabaseConfigured && supabase) {
      const { password, ...supabaseUpdates } = updates;
      if (Object.keys(supabaseUpdates).length > 0) {
        withTimeout(supabase.from('profiles').update(supabaseUpdates).eq('id', id), 6000)
          .catch(() => this.queueOfflineMutation('profiles', 'upsert', { id, ...supabaseUpdates }));
      }
    }

    this.broadcastChange();
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const current = await this.getProfiles();
    const updated = current.filter(p => p.id !== id);
    this.setLocal('profiles', updated);

    // Eliminar también sus permisos
    const perms = await this.getPermissions();
    const updatedPerms = perms.filter(p => p.user_id !== id);
    this.setLocal('permissions', updatedPerms);

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('profiles').delete().eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('profiles', 'delete', { id }));
      withTimeout(supabase.from('app_permissions').delete().eq('user_id', id), 6000)
        .catch(() => this.queueOfflineMutation('app_permissions', 'delete', { user_id: id }));
    }

    this.broadcastChange();
  }

  async updateUserPermissions(userId: string, newPerms: AppPermission[]): Promise<void> {
    const current = await this.getPermissions();
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...newPerms];
    this.setLocal('permissions', updated);

    if (isSupabaseConfigured && supabase) {
      newPerms.forEach(p => {
        const row = {
          user_id: p.user_id,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        };
        withTimeout(supabase.from('app_permissions').upsert(row, { onConflict: 'user_id,app_id' }), 6000)
          .catch(() => this.queueOfflineMutation('app_permissions', 'upsert', row, 'user_id,app_id'));
      });
    }
    this.broadcastChange();
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50), 3000);
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
      withTimeout(supabase.from('audit_logs').insert(log), 6000)
        .catch(() => this.queueOfflineMutation('audit_logs', 'upsert', log));
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

  // ==========================================
  // MECALUX TALENT & ENTREVISTAS (TEAM LEADER)
  // ==========================================
  async getInterviewCandidates(userId?: string): Promise<CandidateInterview[]> {
    const key = this.getUserKey('interview_candidates', userId);
    const local = this.getLocal<CandidateInterview[]>(key, [INITIAL_CANDIDATE_SAMPLE]);
    return local;
  }

  async saveInterviewCandidate(candidate: CandidateInterview, userId?: string): Promise<CandidateInterview> {
    const key = this.getUserKey('interview_candidates', userId);
    const current = await this.getInterviewCandidates(userId);
    const index = current.findIndex(c => c.id === candidate.id);
    let updated: CandidateInterview[];

    const candidateToSave: CandidateInterview = {
      ...candidate,
      user_id: userId || candidate.user_id,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      updated = current.map((c, i) => i === index ? candidateToSave : c);
    } else {
      updated = [candidateToSave, ...current];
    }

    this.setLocal(key, updated);
    this.broadcastChange();
    return candidateToSave;
  }

  async deleteInterviewCandidate(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('interview_candidates', userId);
    const current = await this.getInterviewCandidates(userId);
    const updated = current.filter(c => c.id !== id);
    this.setLocal(key, updated);
    this.broadcastChange();
  }
}

export const storageService = new StorageService();

