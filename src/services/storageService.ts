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
  LoreSavedRoute
} from '../types';

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

const DEFAULT_FITNESS_PROFILE: FitnessProfile = {
  age: 28,
  gender: 'male',
  height_cm: 178,
  current_weight: 78.5,
  target_weight: 74.0,
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
  training_day_carbs: 240,
  rest_day_carbs: 160,
  updated_at: new Date().toISOString()
};

const DEFAULT_WORKOUTS: FitnessWorkout[] = [
  {
    id: 'wk-1',
    title: 'Push - Pecho, Hombro y Tríceps',
    category: 'Fuerza',
    duration_minutes: 55,
    calories_burned: 440,
    workout_date: '2026-08-22',
    notes: 'Excelente congestión. Subí peso en banca a 80kg.',
    heart_rate_avg: 138,
    heart_rate_max: 164,
    cardio_zone: 'Z3 Aeróbico / Z4 Umbral',
    polar_training_load: 'Alta',
    polar_energy_carbs_pct: 68,
    polar_energy_fat_pct: 27,
    polar_energy_protein_pct: 5,
    perceived_exertion: 8,
    exercises: [
      {
        id: 'e1',
        exercise_id: 'ex-bench-press',
        name: 'Press de Banca con Barra',
        muscle_group: 'Pecho',
        equipment: 'Barra',
        sets: [
          { id: 's1', set_number: 1, type: 'warmup', reps: 12, weight_kg: 50, completed: true, rest_seconds: 90 },
          { id: 's2', set_number: 2, type: 'normal', reps: 8, weight_kg: 75, rpe: 8, rir: 2, completed: true, rest_seconds: 120 },
          { id: 's3', set_number: 3, type: 'normal', reps: 7, weight_kg: 80, rpe: 9, rir: 1, completed: true, rest_seconds: 150 },
          { id: 's4', set_number: 4, type: 'failure', reps: 6, weight_kg: 80, rpe: 10, rir: 0, completed: true, rest_seconds: 120 }
        ]
      },
      {
        id: 'e2',
        exercise_id: 'ex-db-incline-press',
        name: 'Press Inclinado con Mancuernas',
        muscle_group: 'Pecho',
        equipment: 'Mancuernas',
        sets: [
          { id: 's5', set_number: 1, type: 'normal', reps: 10, weight_kg: 28, rpe: 8, rir: 2, completed: true, rest_seconds: 90 },
          { id: 's6', set_number: 2, type: 'normal', reps: 9, weight_kg: 28, rpe: 9, rir: 1, completed: true, rest_seconds: 90 },
          { id: 's7', set_number: 3, type: 'normal', reps: 8, weight_kg: 28, rpe: 9.5, rir: 0.5, completed: true, rest_seconds: 90 }
        ]
      },
      {
        id: 'e3',
        exercise_id: 'ex-db-lateral-raises',
        name: 'Elevaciones Laterales con Mancuernas',
        muscle_group: 'Hombros',
        equipment: 'Mancuernas',
        sets: [
          { id: 's8', set_number: 1, type: 'normal', reps: 15, weight_kg: 12, rpe: 8, rir: 2, completed: true, rest_seconds: 60 },
          { id: 's9', set_number: 2, type: 'normal', reps: 14, weight_kg: 12, rpe: 9, rir: 1, completed: true, rest_seconds: 60 },
          { id: 's10', set_number: 3, type: 'drop_set', reps: 12, weight_kg: 12, rpe: 10, rir: 0, completed: true, rest_seconds: 60 }
        ]
      }
    ]
  },
  {
    id: 'wk-2',
    title: 'Cardio Polar Zona 2 + Core',
    category: 'Cardio',
    duration_minutes: 40,
    calories_burned: 360,
    workout_date: '2026-08-20',
    notes: 'Ritmo constante en zona de quema de grasa (130 ppm media).',
    heart_rate_avg: 131,
    heart_rate_max: 146,
    cardio_zone: 'Z2 Quema Grasa',
    polar_training_load: 'Media',
    polar_energy_carbs_pct: 42,
    polar_energy_fat_pct: 54,
    polar_energy_protein_pct: 4,
    perceived_exertion: 6
  }
];

const DEFAULT_NUTRITION_LOGS: DailyNutritionLog[] = [
  {
    id: 'nut-today',
    date: '2026-08-23',
    water_ml: 2250,
    meals: [
      {
        id: 'm1',
        meal_type: 'breakfast',
        name: 'Bowl de Avena con Proteína y Arándanos',
        calories: 420,
        protein: 36,
        carbs: 48,
        fat: 10,
        portion_size: '1 ración'
      },
      {
        id: 'm2',
        meal_type: 'lunch',
        name: 'Pechuga de Pollo con Arroz Jazmín y Brócoli',
        calories: 520,
        protein: 48,
        carbs: 60,
        fat: 9,
        portion_size: '1 plato grande'
      },
      {
        id: 'm3',
        meal_type: 'snack',
        name: 'Yogur Griego 0% con Nueces y Plátano',
        calories: 280,
        protein: 22,
        carbs: 32,
        fat: 8,
        portion_size: '200g yogur + 15g nueces'
      }
    ],
    notes: 'Día de entrenamiento. Muy buena energía.'
  }
];

const DEFAULT_BODY_PROGRESS: BodyProgressEntry[] = [
  {
    id: 'bp-1',
    date: '2026-08-01',
    weight: 80.2,
    body_fat_percentage: 18.5,
    waist_cm: 86,
    chest_cm: 104,
    arm_cm: 37.0,
    thigh_cm: 58.5,
    notes: 'Inicio de la fase de definición y recomposición.'
  },
  {
    id: 'bp-2',
    date: '2026-08-08',
    weight: 79.6,
    body_fat_percentage: 18.0,
    waist_cm: 85.5,
    chest_cm: 104,
    arm_cm: 37.0,
    thigh_cm: 58.0,
    notes: 'Buena pérdida de retención inicial.'
  },
  {
    id: 'bp-3',
    date: '2026-08-15',
    weight: 79.1,
    body_fat_percentage: 17.5,
    waist_cm: 84.8,
    chest_cm: 104.5,
    arm_cm: 37.2,
    thigh_cm: 57.8,
    notes: 'Fuerza mantenida en presses.'
  },
  {
    id: 'bp-4',
    date: '2026-08-22',
    weight: 78.5,
    body_fat_percentage: 16.9,
    waist_cm: 84.0,
    chest_cm: 104.5,
    arm_cm: 37.3,
    thigh_cm: 57.5,
    notes: 'Cintura bajando consistentemente.'
  }
];

const DEFAULT_POLAR_METRICS: PolarGritMetrics[] = [
  {
    id: 'pol-1',
    date: '2026-08-23',
    nightly_recharge_status: 'Muy Bueno',
    ans_charge: 5.8,
    sleep_score: 88,
    resting_hr: 48,
    max_hr: 186,
    vo2_max_running_index: 54,
    cardio_load_status: 'Productivo',
    cardio_load_ratio: 1.15,
    cardio_z1_z2_min: 35,
    cardio_z3_min: 20,
    cardio_z4_z5_min: 15,
    daily_steps: 11420,
    polar_calories: 2680,
    fitspark_recommendation: 'Excelente recuperación nocturna. Tu sistema nervioso está listo para un entrenamiento de Fuerza / Hipertrofia de alta intensidad o series pesadas.'
  }
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
      const [goalsRes, expRes, budRes, clientsRes, wkRes, libRes, profRes, nutRes, bpRes, polRes] = await Promise.allSettled([
        withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }), 1500),
        withTimeout(supabase.from('expenses').select('*').order('transaction_date', { ascending: false }), 1500),
        withTimeout(supabase.from('category_budgets').select('*'), 1500),
        withTimeout(supabase.from('lore_clients').select('*'), 1500),
        withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 1500),
        withTimeout(supabase.from('user_library').select('*'), 1500),
        withTimeout(supabase.from('fitness_profiles').select('*').limit(1), 1500),
        withTimeout(supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false }), 1500),
        withTimeout(supabase.from('fitness_body_progress').select('*').order('date', { ascending: false }), 1500),
        withTimeout(supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false }), 1500)
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
      if (profRes.status === 'fulfilled' && !profRes.value.error && profRes.value.data && profRes.value.data.length > 0) {
        this.setLocal('fitness_profile', profRes.value.data[0]);
      }
      if (nutRes.status === 'fulfilled' && !nutRes.value.error && nutRes.value.data) {
        this.setLocal('nutrition_logs', nutRes.value.data);
      }
      if (bpRes.status === 'fulfilled' && !bpRes.value.error && bpRes.value.data) {
        this.setLocal('body_progress', bpRes.value.data);
      }
      if (polRes.status === 'fulfilled' && !polRes.value.error && polRes.value.data) {
        this.setLocal('polar_metrics', polRes.value.data);
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

  // ==========================================
  // FITNESS & SALUD INTEGRAL (CAMBIO FÍSICO + POLAR)
  // ==========================================
  async getFitnessProfile(): Promise<FitnessProfile> {
    const local = this.getLocal('fitness_profile', DEFAULT_FITNESS_PROFILE);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_profiles').select('*').limit(1), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('fitness_profile', res.data[0] as FitnessProfile);
        }
      }).catch(() => {});
    }
    return local;
  }

  async updateFitnessProfile(updates: Partial<FitnessProfile>): Promise<FitnessProfile> {
    const current = await this.getFitnessProfile();
    const updated: FitnessProfile = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.setLocal('fitness_profile', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_profiles').upsert(updated)).catch(() => {});
    }
    return updated;
  }

  async getWorkouts(): Promise<FitnessWorkout[]> {
    const local = this.getLocal('workouts', DEFAULT_WORKOUTS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
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

  async deleteWorkout(id: string): Promise<void> {
    const current = this.getLocal('workouts', DEFAULT_WORKOUTS);
    const updated = current.filter(w => w.id !== id);
    this.setLocal('workouts', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').delete().eq('id', id)).catch(() => {});
    }
  }

  // --- NUTRICIÓN & MACROS ---
  async getDailyNutritionLogs(): Promise<DailyNutritionLog[]> {
    const local = this.getLocal('nutrition_logs', DEFAULT_NUTRITION_LOGS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('nutrition_logs', res.data as DailyNutritionLog[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async getDailyNutrition(date: string): Promise<DailyNutritionLog> {
    const logs = await this.getDailyNutritionLogs();
    const found = logs.find(l => l.date === date);
    if (found) return found;

    // Crear entrada vacía para el día
    const newLog: DailyNutritionLog = {
      id: `nut_${date}`,
      date,
      water_ml: 0,
      meals: []
    };
    return newLog;
  }

  async saveDailyNutrition(log: DailyNutritionLog): Promise<void> {
    const logs = this.getLocal('nutrition_logs', DEFAULT_NUTRITION_LOGS);
    const existingIndex = logs.findIndex(l => l.date === log.date);
    let updated: DailyNutritionLog[];
    if (existingIndex >= 0) {
      updated = logs.map((l, i) => i === existingIndex ? log : l);
    } else {
      updated = [log, ...logs];
    }
    this.setLocal('nutrition_logs', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_nutrition_logs').upsert(log)).catch(() => {});
    }
  }

  async addFoodToDate(date: string, food: Omit<import('../types').FoodEntry, 'id'>): Promise<void> {
    const log = await this.getDailyNutrition(date);
    const newFood: import('../types').FoodEntry = {
      ...food,
      id: crypto.randomUUID ? crypto.randomUUID() : `food_${Date.now()}`
    };
    const updatedLog: DailyNutritionLog = {
      ...log,
      meals: [...log.meals, newFood]
    };
    await this.saveDailyNutrition(updatedLog);
  }

  async removeFoodFromDate(date: string, foodId: string): Promise<void> {
    const log = await this.getDailyNutrition(date);
    const updatedLog: DailyNutritionLog = {
      ...log,
      meals: log.meals.filter(m => m.id !== foodId)
    };
    await this.saveDailyNutrition(updatedLog);
  }

  async updateWater(date: string, amountMl: number): Promise<void> {
    const log = await this.getDailyNutrition(date);
    const updatedLog: DailyNutritionLog = {
      ...log,
      water_ml: Math.max(0, amountMl)
    };
    await this.saveDailyNutrition(updatedLog);
  }

  // --- CONTROL DE PESO & MEDIDAS ---
  async getBodyProgress(): Promise<BodyProgressEntry[]> {
    const local = this.getLocal('body_progress', DEFAULT_BODY_PROGRESS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').select('*').order('date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('body_progress', res.data as BodyProgressEntry[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async addBodyProgress(entry: Omit<BodyProgressEntry, 'id'>): Promise<BodyProgressEntry> {
    const item: BodyProgressEntry = {
      ...entry,
      id: crypto.randomUUID ? crypto.randomUUID() : `bp_${Date.now()}`
    };
    const current = this.getLocal('body_progress', DEFAULT_BODY_PROGRESS);
    // Si ya existe registro de ese día, se actualiza
    const filtered = current.filter(e => e.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal('body_progress', updated);

    // Actualizar también el peso actual en el perfil
    const profile = await this.getFitnessProfile();
    await this.updateFitnessProfile({ current_weight: item.weight });

    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').upsert(item)).catch(() => {});
    }
    return item;
  }

  async deleteBodyProgress(id: string): Promise<void> {
    const current = this.getLocal('body_progress', DEFAULT_BODY_PROGRESS);
    const updated = current.filter(e => e.id !== id);
    this.setLocal('body_progress', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').delete().eq('id', id)).catch(() => {});
    }
  }

  // --- POLAR GRIT X PRO METRICS ---
  async getPolarMetrics(): Promise<PolarGritMetrics[]> {
    const local = this.getLocal('polar_metrics', DEFAULT_POLAR_METRICS);
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false }), 1500).then(res => {
        if (!res.error && res.data && res.data.length > 0) {
          this.setLocal('polar_metrics', res.data as PolarGritMetrics[]);
        }
      }).catch(() => {});
    }
    return local;
  }

  async savePolarMetric(metric: Omit<PolarGritMetrics, 'id'>): Promise<PolarGritMetrics> {
    const item: PolarGritMetrics = {
      ...metric,
      id: crypto.randomUUID ? crypto.randomUUID() : `pol_${Date.now()}`
    };
    const current = this.getLocal('polar_metrics', DEFAULT_POLAR_METRICS);
    const filtered = current.filter(m => m.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal('polar_metrics', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_polar_metrics').upsert(item)).catch(() => {});
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
