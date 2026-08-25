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
  CandidateInterview,
  PharmacyCRMItem,
  LoreGoalsConfig,
  WalletConfig
} from '../types';
import { INITIAL_CANDIDATE_SAMPLE } from '../apps/entrevistas/services/mecaluxRubrics';

const STORAGE_VERSION = 'v5_clean_prod_2026';

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
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'lore', can_access: true, can_edit: true },
  { user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', app_id: 'entrevistas', can_access: true, can_edit: true },

  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'fitness', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'gastos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'libros-juegos', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'lore', can_access: true, can_edit: true },
  { user_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', app_id: 'entrevistas', can_access: false, can_edit: false },

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

const DEFAULT_LORE_GOALS: LoreGoalsConfig = {
  objetivoMensual: 15000,
  ventaAcumulada: 0,
  diasLaborablesRestantes: 21,
  incentiveImage: '/tabla-incentivos.png'
};

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 6000): Promise<T> {
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
  private isSyncing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const ver = localStorage.getItem('plataforma_storage_version');
      if (ver !== STORAGE_VERSION) {
        localStorage.setItem('plataforma_storage_version', STORAGE_VERSION);
      }

      if ('BroadcastChannel' in window) {
        try {
          this.broadcastChannel = new BroadcastChannel('plataforma_sync_channel');
          this.broadcastChannel.onmessage = () => {
            this.notifySubscribers();
          };
        } catch (e) {}
      }

      this.initRealtimeChannel();

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

      setInterval(() => {
        if (document.visibilityState === 'visible') {
          this.syncFromCloud();
        }
      }, 8000);

      setTimeout(() => {
        this.flushOfflineQueue();
        this.syncFromCloud();
      }, 50);
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

  private queueOfflineMutation(table: string, action: 'upsert' | 'delete', data: any, conflictTarget?: string) {
    if (typeof window === 'undefined') return;
    const queue = this.getLocal<Array<{ id: string; table: string; action: 'upsert' | 'delete'; data: any; conflictTarget?: string; timestamp: number }>>('offline_mutation_queue', []);
    queue.push({
      id: String(Date.now()) + '_' + Math.random().toString(36).substring(2, 7),
      table,
      action,
      data,
      conflictTarget,
      timestamp: Date.now()
    });
    this.setLocal('offline_mutation_queue', queue);
  }

  async flushOfflineQueue(): Promise<void> {
    if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') return;
    const queue = this.getLocal<Array<{ id: string; table: string; action: 'upsert' | 'delete'; data: any; conflictTarget?: string; timestamp: number }>>('offline_mutation_queue', []);
    if (queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      try {
        if (item.action === 'upsert') {
          const opts = item.conflictTarget ? { onConflict: item.conflictTarget } : undefined;
          const { error } = await supabase.from(item.table).upsert(item.data, opts);
          if (error) remaining.push(item);
        } else if (item.action === 'delete') {
          const key = item.data.id ? 'id' : Object.keys(item.data)[0];
          const { error } = await supabase.from(item.table).delete().eq(key, item.data[key]);
          if (error) remaining.push(item);
        }
      } catch (e) {
        remaining.push(item);
      }
    }
    this.setLocal('offline_mutation_queue', remaining);
  }

  private getUserKey(baseKey: string, userId?: string): string {
    if (!userId) return baseKey;
    return baseKey + '_' + userId;
  }

  onSync(callback: SyncCallback): () => void {
    this.syncCallbacks.add(callback);
    return () => {
      this.syncCallbacks.delete(callback);
    };
  }

  private notifySubscribers() {
    this.syncCallbacks.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Error in sync callback:', e);
      }
    });
  }

  private broadcastChange() {
    this.notifySubscribers();
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ type: 'SYNC_UPDATE', timestamp: Date.now() });
      } catch (e) {}
    }
    if (isSupabaseConfigured && supabase && this.realtimeChannel) {
      try {
        this.realtimeChannel.send({
          type: 'broadcast',
          event: 'data_changed',
          payload: { timestamp: Date.now() }
        });
      } catch (e) {}
    }
  }

  private async saveCloudMeta(metaKey: string, value: any): Promise<void> {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const row = {
        category: '__sys_' + metaKey,
        monthly_limit: 0,
        icon: JSON.stringify(value),
        color: 'system_meta',
        updated_at: new Date().toISOString()
      };
      await withTimeout(supabase.from('category_budgets').upsert(row, { onConflict: 'category' }), 5000);
    } catch (e) {
      this.queueOfflineMutation('category_budgets', 'upsert', {
        category: '__sys_' + metaKey,
        monthly_limit: 0,
        icon: JSON.stringify(value),
        color: 'system_meta',
        updated_at: new Date().toISOString()
      }, 'category');
    }
  }

  // --- SERIALIZACIÓN DE WORKOUTS PARA ALTA COMPATIBILIDAD CON SUPABASE ---
  private serializeWorkoutForSupabase(w: FitnessWorkout): any {
    const metaPayload = {
      _meta: true,
      userNotes: w.notes || '',
      exercises: w.exercises || [],
      heart_rate_avg: w.heart_rate_avg,
      heart_rate_max: w.heart_rate_max,
      cardio_zone: w.cardio_zone,
      polar_training_load: w.polar_training_load,
      polar_energy_carbs_pct: w.polar_energy_carbs_pct,
      polar_energy_fat_pct: w.polar_energy_fat_pct,
      polar_energy_protein_pct: w.polar_energy_protein_pct,
      perceived_exertion: w.perceived_exertion
    };

    return {
      id: w.id,
      user_id: w.user_id,
      title: w.title,
      category: w.category,
      duration_minutes: w.duration_minutes,
      calories_burned: w.calories_burned,
      workout_date: w.workout_date,
      exercises: w.exercises || [],
      heart_rate_avg: w.heart_rate_avg,
      heart_rate_max: w.heart_rate_max,
      cardio_zone: w.cardio_zone,
      polar_training_load: w.polar_training_load,
      polar_energy_carbs_pct: w.polar_energy_carbs_pct,
      polar_energy_fat_pct: w.polar_energy_fat_pct,
      polar_energy_protein_pct: w.polar_energy_protein_pct,
      perceived_exertion: w.perceived_exertion,
      notes: JSON.stringify(metaPayload)
    };
  }

  private parseWorkoutFromSupabase(row: any): FitnessWorkout {
    let notes = row.notes;
    let exercises = row.exercises || [];
    let heart_rate_avg = row.heart_rate_avg;
    let heart_rate_max = row.heart_rate_max;
    let cardio_zone = row.cardio_zone;
    let polar_training_load = row.polar_training_load;
    let polar_energy_carbs_pct = row.polar_energy_carbs_pct;
    let polar_energy_fat_pct = row.polar_energy_fat_pct;
    let polar_energy_protein_pct = row.polar_energy_protein_pct;
    let perceived_exertion = row.perceived_exertion;

    if (row.notes && typeof row.notes === 'string' && row.notes.startsWith('{') && row.notes.includes('_meta')) {
      try {
        const parsed = JSON.parse(row.notes);
        if (parsed._meta) {
          notes = parsed.userNotes;
          exercises = (parsed.exercises && parsed.exercises.length > 0) ? parsed.exercises : exercises;
          heart_rate_avg = parsed.heart_rate_avg !== undefined ? parsed.heart_rate_avg : heart_rate_avg;
          heart_rate_max = parsed.heart_rate_max !== undefined ? parsed.heart_rate_max : heart_rate_max;
          cardio_zone = parsed.cardio_zone !== undefined ? parsed.cardio_zone : cardio_zone;
          polar_training_load = parsed.polar_training_load !== undefined ? parsed.polar_training_load : polar_training_load;
          polar_energy_carbs_pct = parsed.polar_energy_carbs_pct !== undefined ? parsed.polar_energy_carbs_pct : polar_energy_carbs_pct;
          polar_energy_fat_pct = parsed.polar_energy_fat_pct !== undefined ? parsed.polar_energy_fat_pct : polar_energy_fat_pct;
          polar_energy_protein_pct = parsed.polar_energy_protein_pct !== undefined ? parsed.polar_energy_protein_pct : polar_energy_protein_pct;
          perceived_exertion = parsed.perceived_exertion !== undefined ? parsed.perceived_exertion : perceived_exertion;
        }
      } catch (e) {}
    }

    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      category: row.category,
      duration_minutes: row.duration_minutes,
      calories_burned: row.calories_burned,
      workout_date: row.workout_date,
      notes,
      exercises,
      heart_rate_avg,
      heart_rate_max,
      cardio_zone,
      polar_training_load,
      polar_energy_carbs_pct,
      polar_energy_fat_pct,
      polar_energy_protein_pct,
      perceived_exertion
    };
  }

  // ==========================================================================
  // SINCRONIZACIÓN CENTRAL DESDE LA NUBE (TODAS LAS TABLAS)
  // ==========================================================================
  async syncFromCloud(): Promise<void> {
    if (!isSupabaseConfigured || !supabase || this.isSyncing) return;
    this.isSyncing = true;

    try {
      const [
        goalsRes,
        expRes,
        budRes,
        clientsRes,
        wkRes,
        libRes,
        profRes,
        nutRes,
        bpRes,
        polRes,
        profilesRes,
        permsRes,
        walletRes,
        routesRes,
        crmRes,
        loreGoalsRes,
        candRes
      ] = await Promise.allSettled([
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
        withTimeout(supabase.from('app_permissions').select('*'), 5000),
        withTimeout(supabase.from('wallet_config').select('*'), 5000),
        withTimeout(supabase.from('lore_saved_routes').select('*').order('created_at', { ascending: false }), 5000),
        withTimeout(supabase.from('lore_crm_pharmacies').select('*'), 5000),
        withTimeout(supabase.from('lore_goals').select('*'), 5000),
        withTimeout(supabase.from('interview_candidates').select('*').order('created_at', { ascending: false }), 5000)
      ]);

      const allUserIds = new Set<string>([
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'
      ]);

      // 1. Profiles & Passwords
      if (profilesRes.status === 'fulfilled' && !profilesRes.value.error && profilesRes.value.data) {
        this.setLocal('profiles', profilesRes.value.data);
        const passMap = this.getPasswordMap();
        profilesRes.value.data.forEach((p: any) => {
          if (p.id) allUserIds.add(p.id);
          if (p.password) {
            passMap[p.email.toLowerCase()] = p.password;
            passMap[p.id] = p.password;
          }
        });
        this.setLocal('user_passwords', passMap);
      }

      // 2. Permissions
      if (permsRes.status === 'fulfilled' && !permsRes.value.error && permsRes.value.data) {
        this.setLocal('permissions', permsRes.value.data);
      }

      // 3. Expenses
      if (expRes.status === 'fulfilled' && !expRes.value.error && expRes.value.data) {
        const expenses = expRes.value.data as ExpenseItem[];
        this.setLocal('expenses', expenses);
        allUserIds.forEach(uid => {
          const userExp = expenses.filter(e => e.user_id === uid);
          this.setLocal(this.getUserKey('expenses', uid), userExp);
        });
      }

      // 4. Savings Goals
      if (goalsRes.status === 'fulfilled' && !goalsRes.value.error && goalsRes.value.data) {
        const goals = goalsRes.value.data as SavingsGoal[];
        this.setLocal('savings_goals', goals);
        allUserIds.forEach(uid => {
          const userGoals = goals.filter(g => g.user_id === uid);
          this.setLocal(this.getUserKey('savings_goals', uid), userGoals);
        });
      }

      // 5. Workouts
      if (wkRes.status === 'fulfilled' && !wkRes.value.error && wkRes.value.data) {
        const workouts = (wkRes.value.data as any[]).map(row => this.parseWorkoutFromSupabase(row));
        this.setLocal('workouts', workouts);
        allUserIds.forEach(uid => {
          const userWk = workouts.filter(w => w.user_id === uid);
          this.setLocal(this.getUserKey('workouts', uid), userWk);
        });
      }

      // 6. Nutrition
      if (nutRes.status === 'fulfilled' && !nutRes.value.error && nutRes.value.data) {
        const logs = nutRes.value.data as DailyNutritionLog[];
        this.setLocal('nutrition_logs', logs);
        allUserIds.forEach(uid => {
          const userLogs = logs.filter(l => l.user_id === uid);
          this.setLocal(this.getUserKey('nutrition_logs', uid), userLogs);
        });
      }

      // 7. Body Progress
      if (bpRes.status === 'fulfilled' && !bpRes.value.error && bpRes.value.data) {
        const bodyProgress = bpRes.value.data as BodyProgressEntry[];
        this.setLocal('body_progress', bodyProgress);
        allUserIds.forEach(uid => {
          const userBp = bodyProgress.filter(b => b.user_id === uid);
          this.setLocal(this.getUserKey('body_progress', uid), userBp);
        });
      }

      // 8. Polar Metrics
      if (polRes.status === 'fulfilled' && !polRes.value.error && polRes.value.data) {
        const polar = polRes.value.data as PolarGritMetrics[];
        this.setLocal('polar_metrics', polar);
        allUserIds.forEach(uid => {
          const userPol = polar.filter(p => p.user_id === uid);
          this.setLocal(this.getUserKey('polar_metrics', uid), userPol);
        });
      }

      // 9. Lore Clients
      if (clientsRes.status === 'fulfilled' && !clientsRes.value.error && clientsRes.value.data) {
        this.setLocal('lore_clients', clientsRes.value.data);
      }

      // 10. User Library
      if (libRes.status === 'fulfilled' && !libRes.value.error && libRes.value.data) {
        this.setLocal('library', libRes.value.data);
      }

      // 11. Fitness Profiles
      if (profRes.status === 'fulfilled' && !profRes.value.error && profRes.value.data) {
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

      // 12. Wallet Configs
      if (walletRes.status === 'fulfilled' && !walletRes.value.error && walletRes.value.data) {
        const configs = walletRes.value.data as any[];
        configs.forEach(cfg => {
          if (cfg.user_id) {
            this.setLocal(this.getUserKey('wallet_config', cfg.user_id), cfg);
          }
        });
      }

      // 13. Lore Saved Routes
      if (routesRes.status === 'fulfilled' && !routesRes.value.error && routesRes.value.data) {
        const routes = (routesRes.value.data as any[]).map(r => ({
          id: r.id,
          name: r.name,
          date: r.date,
          clientIds: r.client_ids || [],
          totalDistanceKm: Number(r.total_distance_km) || 0,
          createdAt: r.created_at
        }));
        this.setLocal('lore_saved_routes', routes);
      }

      // 14. Lore CRM Pharmacies
      if (crmRes.status === 'fulfilled' && !crmRes.value.error && crmRes.value.data && crmRes.value.data.length > 0) {
        this.setLocal('lore_full_crm_data_v2', crmRes.value.data);
      }

      // 15. Lore Goals
      if (loreGoalsRes.status === 'fulfilled' && !loreGoalsRes.value.error && loreGoalsRes.value.data && loreGoalsRes.value.data.length > 0) {
        const g = loreGoalsRes.value.data[0];
        const goalsCfg: LoreGoalsConfig = {
          objetivoMensual: Number(g.objetivo_mensual) || 15000,
          ventaAcumulada: Number(g.venta_acumulada) || 0,
          diasLaborablesRestantes: Number(g.dias_laborables_restantes) || 21,
          incentiveImage: g.incentive_image || '/tabla-incentivos.png',
          updated_at: g.updated_at
        };
        this.setLocal('lore_goals_config', goalsCfg);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lore_goal_objetivo', String(goalsCfg.objetivoMensual));
          localStorage.setItem('lore_goal_venta', String(goalsCfg.ventaAcumulada));
          localStorage.setItem('lore_goal_dias', String(goalsCfg.diasLaborablesRestantes));
          if (goalsCfg.incentiveImage) localStorage.setItem('lore_goal_custom_image', goalsCfg.incentiveImage);
        }
      }

      // 16. Interview Candidates (Mecalux)
      if (candRes.status === 'fulfilled' && !candRes.value.error && candRes.value.data && candRes.value.data.length > 0) {
        const candidates = (candRes.value.data as any[]).map(c => ({
          id: c.id,
          user_id: c.user_id,
          fullName: c.full_name,
          email: c.email,
          phone: c.phone,
          role: c.role,
          seniority: c.seniority,
          currentCompany: c.current_company,
          currentSalaryEur: c.current_salary_eur ? Number(c.current_salary_eur) : undefined,
          expectedSalaryEur: c.expected_salary_eur ? Number(c.expected_salary_eur) : undefined,
          noticePeriodWeeks: c.notice_period_weeks,
          englishLevel: c.english_level,
          location: c.location,
          linkedinUrl: c.linkedin_url,
          status: c.status,
          interviewDate: c.interview_date,
          durationMinutes: c.duration_minutes,
          cvText: c.cv_text,
          cvFileName: c.cv_file_name,
          parsedSkills: c.parsed_skills || [],
          evaluations: c.evaluations || {},
          resultadoFinal: c.resultado_final || {},
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        this.setLocal('interview_candidates', candidates);
        allUserIds.forEach(uid => {
          const userCands = candidates.filter(c => c.user_id === uid);
          if (userCands.length > 0) this.setLocal(this.getUserKey('interview_candidates', uid), userCands);
        });
      }

      // 17. Category Budgets & Metadata Sync Fallback
      if (budRes.status === 'fulfilled' && !budRes.value.error && budRes.value.data) {
        const rows = budRes.value.data as any[];
        const standardBudgets: CategoryBudget[] = [];

        rows.forEach(r => {
          if (typeof r.category === 'string' && (r.category.startsWith('__sys_') || r.category.startsWith('__meta_'))) {
            try {
              const metaKey = r.category.replace(/^__sys_|^__meta_/, '');
              const parsed = JSON.parse(r.icon);

              if (metaKey.startsWith('wallet_')) {
                this.setLocal(metaKey, parsed);
              } else if (metaKey === 'lore_crm_v2' || metaKey === 'lore_crm') {
                const currentCRM = this.getLocal('lore_full_crm_data_v2', []);
                if (currentCRM.length === 0) this.setLocal('lore_full_crm_data_v2', parsed);
              } else if (metaKey === 'lore_goals') {
                const currentGoals = this.getLocal<LoreGoalsConfig>('lore_goals_config', DEFAULT_LORE_GOALS);
                if (!currentGoals || currentGoals.ventaAcumulada === 0) {
                  this.setLocal('lore_goals_config', parsed);
                  if (parsed.objetivoMensual && typeof window !== 'undefined') localStorage.setItem('lore_goal_objetivo', String(parsed.objetivoMensual));
                  if (parsed.ventaAcumulada !== undefined && typeof window !== 'undefined') localStorage.setItem('lore_goal_venta', String(parsed.ventaAcumulada));
                  if (parsed.diasLaborablesRestantes && typeof window !== 'undefined') localStorage.setItem('lore_goal_dias', String(parsed.diasLaborablesRestantes));
                  if (parsed.incentiveImage && typeof window !== 'undefined') localStorage.setItem('lore_goal_custom_image', parsed.incentiveImage);
                }
              } else if (metaKey === 'lore_routes') {
                const currentRoutes = this.getLocal('lore_saved_routes', []);
                if (currentRoutes.length === 0) this.setLocal('lore_saved_routes', parsed);
              } else if (metaKey.startsWith('interview_candidates')) {
                const currentCands = this.getLocal('interview_candidates', []);
                if (currentCands.length === 0) {
                  this.setLocal(metaKey, parsed);
                  this.setLocal('interview_candidates', parsed);
                }
              } else if (metaKey === 'user_passwords') {
                const currentMap = this.getPasswordMap();
                this.setLocal('user_passwords', { ...currentMap, ...parsed });
              } else if (metaKey === 'app_permissions_all') {
                this.setLocal('permissions', parsed);
              }
            } catch (e) {}
          } else {
            standardBudgets.push({
              category: r.category,
              monthly_limit: Number(r.monthly_limit) || 0,
              icon: r.icon,
              color: r.color
            });
          }
        });

        if (standardBudgets.length > 0) {
          this.setLocal('category_budgets', standardBudgets);
        }
      }

      this.notifySubscribers();
    } catch (e) {
    } finally {
      this.isSyncing = false;
    }
  }

  private getLocal<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem('plataforma_' + key);
    if (!raw) {
      localStorage.setItem('plataforma_' + key, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('plataforma_' + key, JSON.stringify(data));
  }

  getPasswordMap(): Record<string, string> {
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
    this.saveCloudMeta('user_passwords', map);
  }

  getPasswordForUser(user: UserProfile): string {
    const map = this.getPasswordMap();
    const fromMap = map[user.email.toLowerCase()] || map[user.id] || map[user.full_name.toLowerCase()] || map[user.full_name.split(' ')[0].toLowerCase()];
    return user.password || fromMap || (user.role === 'admin' ? 'admin' : '123456');
  }

  getProfilesSync(): UserProfile[] {
    const profiles = this.getLocal('profiles', DEFAULT_PROFILES);
    const map = this.getPasswordMap();
    return profiles.map(p => ({
      ...p,
      password: p.password || map[p.email.toLowerCase()] || map[p.id] || (p.role === 'admin' ? 'admin' : '123456')
    }));
  }

  getPermissionsSync(): AppPermission[] {
    return this.getLocal('permissions', DEFAULT_PERMISSIONS);
  }

  async getProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('profiles').select('*'), 4000);
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
        const res = await withTimeout(supabase.from('app_permissions').select('*'), 4000);
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
    this.saveCloudMeta('app_permissions_all', updated);

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('app_permissions').upsert({
        user_id: userId,
        app_id: appId,
        can_access: canAccess,
        can_edit: canEdit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' }), 4000).catch(() => {});
    }

    this.broadcastChange();
  }

  async updateUserPermissions(userId: string, newPerms: AppPermission[]): Promise<void> {
    const current = await this.getPermissions();
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...newPerms];
    this.setLocal('permissions', updated);
    this.saveCloudMeta('app_permissions_all', updated);

    if (isSupabaseConfigured && supabase) {
      for (const p of newPerms) {
        const row = {
          user_id: p.user_id,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        };
        withTimeout(supabase.from('app_permissions').upsert(row, { onConflict: 'user_id,app_id' }), 5000)
          .catch(() => {});
      }
    }
    this.broadcastChange();
  }

  // ==========================================
  // FITNESS & SALUD INTEGRAL (CAMBIO FÍSICO + POLAR)
  // ==========================================
  async getFitnessProfile(userId?: string): Promise<FitnessProfile> {
    const key = this.getUserKey('fitness_profile', userId);
    const defaultProfile: FitnessProfile = {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: userId,
      onboarding_completed: true,
      current_weight: 95.7
    };
    return this.getLocal(key, this.getLocal('fitness_profile', defaultProfile));
  }

  async updateFitnessProfile(updates: Partial<FitnessProfile>, userId?: string): Promise<FitnessProfile> {
    const current = await this.getFitnessProfile(userId);
    const key = this.getUserKey('fitness_profile', userId);
    const effectiveUserId = userId || current.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const updated: FitnessProfile & { id?: string } = {
      ...current,
      ...updates,
      user_id: effectiveUserId,
      id: (current as any).id || ('prof_' + effectiveUserId.slice(0, 12)),
      updated_at: new Date().toISOString()
    };
    this.setLocal(key, updated);
    this.setLocal('fitness_profile', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_profiles').upsert(updated, { onConflict: 'user_id' }), 5000)
        .catch(() => this.queueOfflineMutation('fitness_profiles', 'upsert', updated, 'user_id'));
    }
    return updated;
  }

  async getWorkouts(userId?: string): Promise<FitnessWorkout[]> {
    const key = this.getUserKey('workouts', userId);
    return this.getLocal(key, this.getLocal('workouts', []));
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>, userId?: string): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      user_id: userId || workout.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('wk_' + Date.now())
    };
    const key = this.getUserKey('workouts', userId);
    const current = this.getLocal<FitnessWorkout[]>(key, []);
    const updated = [item, ...current.filter(w => w.id !== item.id)];
    this.setLocal(key, updated);
    this.setLocal('workouts', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      const supabaseItem = this.serializeWorkoutForSupabase(item);
      withTimeout(supabase.from('fitness_workouts').upsert(supabaseItem), 5000)
        .catch(() => this.queueOfflineMutation('fitness_workouts', 'upsert', supabaseItem));
    }
    return item;
  }

  async deleteWorkout(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('workouts', userId);
    const current = this.getLocal<FitnessWorkout[]>(key, []);
    const updated = current.filter(w => w.id !== id);
    this.setLocal(key, updated);
    this.setLocal('workouts', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_workouts').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('fitness_workouts', 'delete', { id }));
    }
  }

  // --- NUTRICIÓN & MACROS ---
  async getDailyNutritionLogs(userId?: string): Promise<DailyNutritionLog[]> {
    const key = this.getUserKey('nutrition_logs', userId);
    return this.getLocal(key, this.getLocal('nutrition_logs', []));
  }

  async getDailyNutrition(date: string, userId?: string): Promise<DailyNutritionLog> {
    const logs = await this.getDailyNutritionLogs(userId);
    const found = logs.find(l => l.date === date);
    if (found) return found;

    const newLog: DailyNutritionLog = {
      id: 'nut_' + (userId || 'asier').slice(0, 8) + '_' + date,
      user_id: userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date,
      water_ml: 0,
      meals: []
    };
    return newLog;
  }

  async saveDailyNutrition(log: DailyNutritionLog, userId?: string): Promise<void> {
    const key = this.getUserKey('nutrition_logs', userId);
    const logs = this.getLocal<DailyNutritionLog[]>(key, []);
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
    this.setLocal('nutrition_logs', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_nutrition_logs').upsert(logWithUser, { onConflict: 'user_id,date' }), 5000)
        .catch(() => this.queueOfflineMutation('fitness_nutrition_logs', 'upsert', logWithUser, 'user_id,date'));
    }
  }

  async addFoodToDate(date: string, food: Omit<import('../types').FoodEntry, 'id'>, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const newFood: import('../types').FoodEntry = {
      ...food,
      id: crypto.randomUUID ? crypto.randomUUID() : ('food_' + Date.now())
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
    return this.getLocal(key, this.getLocal('body_progress', []));
  }

  async addBodyProgress(entry: Omit<BodyProgressEntry, 'id'>, userId?: string): Promise<BodyProgressEntry> {
    const item: BodyProgressEntry = {
      ...entry,
      user_id: userId || entry.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('bp_' + Date.now())
    };
    const key = this.getUserKey('body_progress', userId);
    const current = this.getLocal<BodyProgressEntry[]>(key, []);
    const filtered = current.filter(e => e.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal(key, updated);
    this.setLocal('body_progress', updated);

    await this.updateFitnessProfile({ current_weight: item.weight }, userId);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').upsert(item, { onConflict: 'user_id,date' }), 5000)
        .catch(() => this.queueOfflineMutation('fitness_body_progress', 'upsert', item, 'user_id,date'));
    }
    return item;
  }

  async deleteBodyProgress(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('body_progress', userId);
    const current = this.getLocal<BodyProgressEntry[]>(key, []);
    const updated = current.filter(e => e.id !== id);
    this.setLocal(key, updated);
    this.setLocal('body_progress', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_body_progress').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('fitness_body_progress', 'delete', { id }));
    }
  }

  // --- POLAR GRIT X PRO METRICS ---
  async getPolarMetrics(userId?: string): Promise<PolarGritMetrics[]> {
    const key = this.getUserKey('polar_metrics', userId);
    return this.getLocal(key, this.getLocal('polar_metrics', []));
  }

  async savePolarMetric(metric: Omit<PolarGritMetrics, 'id'>, userId?: string): Promise<PolarGritMetrics> {
    const item: PolarGritMetrics = {
      ...metric,
      user_id: userId || metric.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('pol_' + Date.now())
    };
    const key = this.getUserKey('polar_metrics', userId);
    const current = this.getLocal<PolarGritMetrics[]>(key, []);
    const filtered = current.filter(m => m.date !== item.date);
    const updated = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    this.setLocal(key, updated);
    this.setLocal('polar_metrics', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('fitness_polar_metrics').upsert(item, { onConflict: 'user_id,date' }), 5000)
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
  async getWalletConfig(userId?: string): Promise<WalletConfig> {
    const key = this.getUserKey('wallet_config', userId);
    const isAsier = !userId || userId === 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' || userId.includes('asier');
    const defaultVal: WalletConfig = isAsier ? {
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

  async updateWalletConfig(updates: Partial<WalletConfig>, userId?: string): Promise<WalletConfig> {
    const current = await this.getWalletConfig(userId);
    const effectiveUserId = userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const key = this.getUserKey('wallet_config', userId);
    const updated: WalletConfig = {
      ...current,
      ...updates
    };
    this.setLocal(key, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      const row = {
        user_id: effectiveUserId,
        account_1_name: updated.account_1_name,
        account_1_initial_balance: updated.account_1_initial_balance,
        account_2_name: updated.account_2_name,
        account_2_initial_balance: updated.account_2_initial_balance,
        has_account_2: updated.has_account_2,
        onboarding_completed: updated.onboarding_completed,
        updated_at: new Date().toISOString()
      };
      withTimeout(supabase.from('wallet_config').upsert(row, { onConflict: 'user_id' }), 5000)
        .catch(() => this.saveCloudMeta(key, updated));
    }
    return updated;
  }

  // ==========================================
  // GASTOS & MOVIMIENTOS
  // ==========================================
  async getExpenses(userId?: string): Promise<ExpenseItem[]> {
    const key = this.getUserKey('expenses', userId);
    return this.getLocal(key, this.getLocal('expenses', []));
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>, userId?: string): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      user_id: userId || expense.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('exp_' + Date.now())
    };
    const key = this.getUserKey('expenses', userId);
    const current = this.getLocal<ExpenseItem[]>(key, []);
    const updated = [item, ...current.filter(e => e.id !== item.id)];
    this.setLocal(key, updated);

    const allExpenses = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', [item, ...allExpenses.filter(e => e.id !== item.id)]);

    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').upsert(item), 5000)
        .catch(() => this.queueOfflineMutation('expenses', 'upsert', item));
    }
    return item;
  }

  async deleteExpense(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('expenses', userId);
    const current = this.getLocal<ExpenseItem[]>(key, []);
    const updated = current.filter(e => e.id !== id);
    this.setLocal(key, updated);

    const allExpenses = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', allExpenses.filter(e => e.id !== id));

    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('expenses').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('expenses', 'delete', { id }));
    }
  }

  async clearAllExpenses(userId?: string): Promise<void> {
    const key = this.getUserKey('expenses', userId);
    this.setLocal(key, []);

    if (!userId) {
      this.setLocal('expenses', []);
    } else {
      const allExpenses = this.getLocal<ExpenseItem[]>('expenses', []);
      this.setLocal('expenses', allExpenses.filter(e => e.user_id !== userId));
    }

    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('expenses').delete();
      if (userId) query = query.eq('user_id', userId);
      withTimeout(query, 5000).catch(() => {});
    }
  }

  // ==========================================
  // METAS DE AHORRO (SAVINGS GOALS)
  // ==========================================
  async getSavingsGoals(userId?: string): Promise<SavingsGoal[]> {
    const key = this.getUserKey('savings_goals', userId);
    return this.getLocal(key, this.getLocal('savings_goals', []));
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>, userId?: string): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      user_id: userId || goal.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('goal_' + Date.now()),
      created_at: new Date().toISOString()
    };
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal<SavingsGoal[]>(key, []);
    const updated = [item, ...current.filter(g => g.id !== item.id)];
    this.setLocal(key, updated);
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').upsert(item), 5000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'upsert', item));
    }
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>, userId?: string): Promise<void> {
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal<SavingsGoal[]>(key, []);
    const updated = current.map(g => g.id === id ? { ...g, ...updates } : g);
    this.setLocal(key, updated);
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').update(updates).eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'upsert', { id, ...updates }));
    }
  }

  async deleteSavingsGoal(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('savings_goals', userId);
    const current = this.getLocal<SavingsGoal[]>(key, []);
    const updated = current.filter(g => g.id !== id);
    this.setLocal(key, updated);
    this.setLocal('savings_goals', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('savings_goals').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('savings_goals', 'delete', { id }));
    }
  }

  // ==========================================
  // PRESUPUESTOS POR CATEGORÍA
  // ==========================================
  async getCategoryBudgets(userId?: string): Promise<CategoryBudget[]> {
    const key = this.getUserKey('category_budgets', userId);
    const budgets = this.getLocal<CategoryBudget[]>(key, DEFAULT_CATEGORY_BUDGETS);
    return budgets.filter(b => typeof b.category === 'string' && !b.category.startsWith('__sys_') && !b.category.startsWith('__meta_'));
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
    this.setLocal('category_budgets', updated);

    if (isSupabaseConfigured && supabase) {
      const row = {
        category,
        monthly_limit: monthlyLimit,
        user_id: userId,
        updated_at: new Date().toISOString()
      };
      withTimeout(supabase.from('category_budgets').upsert(row, { onConflict: 'category' }), 5000)
        .catch(() => this.queueOfflineMutation('category_budgets', 'upsert', row, 'category'));
    }

    this.broadcastChange();
  }

  // ==========================================
  // BIBLIOTECA (LIBROS & JUEGOS)
  // ==========================================
  async getLibrary(): Promise<LibraryItem[]> {
    return this.getLocal('library', []);
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : ('lib_' + Date.now())
    };
    const current = this.getLocal<LibraryItem[]>('library', []);
    const updated = [newItem, ...current.filter(i => i.id !== newItem.id)];
    this.setLocal('library', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').upsert(newItem), 5000)
        .catch(() => this.queueOfflineMutation('user_library', 'upsert', newItem));
    }
    return newItem;
  }

  async updateLibraryItem(id: string, updates: Partial<LibraryItem>): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    const updated = current.map(item => item.id === id ? { ...item, ...updates } : item);
    this.setLocal('library', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').update(updates).eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('user_library', 'upsert', { id, ...updates }));
    }
  }

  async deleteLibraryItem(id: string): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    const updated = current.filter(item => item.id !== id);
    this.setLocal('library', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('user_library').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('user_library', 'delete', { id }));
    }
  }

  // ==========================================
  // LORE CLIENTES (FARMACIAS & MAPA)
  // ==========================================
  async getLoreClients(): Promise<LoreClient[]> {
    return this.getLocal('lore_clients', []);
  }

  async addLoreClient(client: Omit<LoreClient, 'id'>): Promise<LoreClient> {
    const item: LoreClient = {
      ...client,
      id: crypto.randomUUID ? crypto.randomUUID() : ('cli-' + Date.now())
    };
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    const updated = [item, ...current.filter(c => c.id !== item.id)];
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').upsert(item), 5000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'upsert', item));
    }
    return item;
  }

  async updateLoreClient(id: string, updates: Partial<LoreClient>): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').update(updates).eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'upsert', { id, ...updates }));
    }
  }

  async deleteLoreClient(id: string): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    const updated = current.filter(c => c.id !== id);
    this.setLocal('lore_clients', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_clients').delete().eq('id', id), 5000)
        .catch(() => this.queueOfflineMutation('lore_clients', 'delete', { id }));
    }
  }

  // ==========================================
  // LORE CRM FARMACIAS (SEGUIMIENTO Y PROSPECCIÓN)
  // ==========================================
  async getLoreCRMItems(): Promise<PharmacyCRMItem[]> {
    return this.getLocal('lore_full_crm_data_v2', []);
  }

  async setLoreCRMItems(items: PharmacyCRMItem[]): Promise<void> {
    this.setLocal('lore_full_crm_data_v2', items);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      if (items.length > 0) {
        withTimeout(supabase.from('lore_crm_pharmacies').upsert(items), 5000)
          .catch(() => this.saveCloudMeta('lore_crm_v2', items));
      }
    }
  }

  async saveLoreCRMItem(item: PharmacyCRMItem): Promise<PharmacyCRMItem> {
    const current = await this.getLoreCRMItems();
    const index = current.findIndex(i => i.id === item.id);
    let updated: PharmacyCRMItem[];
    if (index >= 0) {
      updated = current.map((i, idx) => idx === index ? { ...item, updated_at: new Date().toISOString() } : i);
    } else {
      updated = [{ ...item, updated_at: new Date().toISOString() }, ...current];
    }
    await this.setLoreCRMItems(updated);
    return item;
  }

  async updateLoreCRMField(id: string, field: keyof PharmacyCRMItem, value: any): Promise<void> {
    const current = await this.getLoreCRMItems();
    const updated = current.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value, updated_at: new Date().toISOString() };
      }
      return item;
    });
    await this.setLoreCRMItems(updated);
  }

  async deleteLoreCRMItem(id: string): Promise<void> {
    const current = await this.getLoreCRMItems();
    const updated = current.filter(i => i.id !== id);
    this.setLocal('lore_full_crm_data_v2', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_crm_pharmacies').delete().eq('id', id), 5000)
        .catch(() => this.saveCloudMeta('lore_crm_v2', updated));
    }
  }

  // ==========================================
  // LORE OBJETIVOS & DRASANVI CUADRO DE MANDOS
  // ==========================================
  async getLoreGoalsConfig(): Promise<LoreGoalsConfig> {
    const local = this.getLocal('lore_goals_config', DEFAULT_LORE_GOALS);
    const obj = typeof window !== 'undefined' ? localStorage.getItem('lore_goal_objetivo') : null;
    const ven = typeof window !== 'undefined' ? localStorage.getItem('lore_goal_venta') : null;
    const dias = typeof window !== 'undefined' ? localStorage.getItem('lore_goal_dias') : null;
    const img = typeof window !== 'undefined' ? localStorage.getItem('lore_goal_custom_image') : null;

    return {
      objetivoMensual: obj ? Number(obj) : local.objetivoMensual,
      ventaAcumulada: ven ? Number(ven) : local.ventaAcumulada,
      diasLaborablesRestantes: dias ? Number(dias) : local.diasLaborablesRestantes,
      incentiveImage: img || local.incentiveImage || '/tabla-incentivos.png',
      updated_at: local.updated_at
    };
  }

  async saveLoreGoalsConfig(config: Partial<LoreGoalsConfig>): Promise<LoreGoalsConfig> {
    const current = await this.getLoreGoalsConfig();
    const updated: LoreGoalsConfig = {
      ...current,
      ...config,
      updated_at: new Date().toISOString()
    };
    this.setLocal('lore_goals_config', updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lore_goal_objetivo', String(updated.objetivoMensual));
      localStorage.setItem('lore_goal_venta', String(updated.ventaAcumulada));
      localStorage.setItem('lore_goal_dias', String(updated.diasLaborablesRestantes));
      if (updated.incentiveImage) localStorage.setItem('lore_goal_custom_image', updated.incentiveImage);
    }
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      const row = {
        id: 'current_goals',
        objetivo_mensual: updated.objetivoMensual,
        venta_acumulada: updated.ventaAcumulada,
        dias_laborables_restantes: updated.diasLaborablesRestantes,
        incentive_image: updated.incentiveImage,
        updated_at: new Date().toISOString()
      };
      withTimeout(supabase.from('lore_goals').upsert(row, { onConflict: 'id' }), 5000)
        .catch(() => this.saveCloudMeta('lore_goals', updated));
    }
    return updated;
  }

  // ==========================================
  // RUTAS GUARDADAS (LORE GPS)
  // ==========================================
  async getSavedRoutes(): Promise<LoreSavedRoute[]> {
    return this.getLocal('lore_saved_routes', []);
  }

  async saveRoute(nameOrObj: string | Omit<LoreSavedRoute, 'id' | 'createdAt'>, clientIds?: string[], totalDistanceKm?: number): Promise<LoreSavedRoute> {
    let item: LoreSavedRoute;
    if (typeof nameOrObj === 'string') {
      item = {
        id: crypto.randomUUID ? crypto.randomUUID() : ('route_' + Date.now()),
        name: nameOrObj,
        date: new Date().toISOString().split('T')[0],
        clientIds: clientIds || [],
        totalDistanceKm: totalDistanceKm || 0,
        createdAt: new Date().toISOString()
      };
    } else {
      item = {
        ...nameOrObj,
        id: crypto.randomUUID ? crypto.randomUUID() : ('route_' + Date.now()),
        createdAt: new Date().toISOString()
      };
    }
    const current = this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
    const updated = [item, ...current.filter(r => r.id !== item.id)];
    this.setLocal('lore_saved_routes', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      const row = {
        id: item.id,
        name: item.name,
        date: item.date,
        client_ids: item.clientIds,
        total_distance_km: item.totalDistanceKm,
        created_at: item.createdAt
      };
      withTimeout(supabase.from('lore_saved_routes').upsert(row), 5000)
        .catch(() => this.saveCloudMeta('lore_routes', updated));
    }
    return item;
  }

  async deleteLoreRoute(id: string): Promise<void> {
    const current = this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
    const updated = current.filter(r => r.id !== id);
    this.setLocal('lore_saved_routes', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('lore_saved_routes').delete().eq('id', id), 5000)
        .catch(() => this.saveCloudMeta('lore_routes', updated));
    }
  }

  // ==========================================
  // MECALUX TALENT & ENTREVISTAS (TEAM LEADER)
  // ==========================================
  async getInterviewCandidates(userId?: string): Promise<CandidateInterview[]> {
    const key = this.getUserKey('interview_candidates', userId);
    return this.getLocal<CandidateInterview[]>(key, this.getLocal('interview_candidates', [INITIAL_CANDIDATE_SAMPLE]));
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
    this.setLocal('interview_candidates', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      const row = {
        id: candidateToSave.id,
        user_id: candidateToSave.user_id,
        full_name: candidateToSave.fullName,
        email: candidateToSave.email,
        phone: candidateToSave.phone,
        role: candidateToSave.role,
        seniority: candidateToSave.seniority,
        current_company: candidateToSave.currentCompany,
        current_salary_eur: candidateToSave.currentSalaryEur,
        expected_salary_eur: candidateToSave.expectedSalaryEur,
        notice_period_weeks: candidateToSave.noticePeriodWeeks,
        english_level: candidateToSave.englishLevel,
        location: candidateToSave.location,
        linkedin_url: candidateToSave.linkedinUrl,
        status: candidateToSave.status,
        interview_date: candidateToSave.interviewDate,
        duration_minutes: candidateToSave.durationMinutes,
        cv_text: candidateToSave.cvText,
        cv_file_name: candidateToSave.cvFileName,
        parsed_skills: candidateToSave.parsedSkills || [],
        evaluations: candidateToSave.evaluations || {},
        resultado_final: candidateToSave.resultadoFinal || {},
        created_at: candidateToSave.createdAt,
        updated_at: candidateToSave.updatedAt
      };
      withTimeout(supabase.from('interview_candidates').upsert(row), 5000)
        .catch(() => this.saveCloudMeta(key, updated));
    }
    return candidateToSave;
  }

  async deleteInterviewCandidate(id: string, userId?: string): Promise<void> {
    const key = this.getUserKey('interview_candidates', userId);
    const current = await this.getInterviewCandidates(userId);
    const updated = current.filter(c => c.id !== id);
    this.setLocal(key, updated);
    this.setLocal('interview_candidates', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('interview_candidates').delete().eq('id', id), 5000)
        .catch(() => this.saveCloudMeta(key, updated));
    }
  }

  // ==========================================
  // GESTIÓN DE PERFILES Y USUARIOS
  // ==========================================
  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: crypto.randomUUID ? crypto.randomUUID() : ('usr_' + Date.now()),
      created_at: new Date().toISOString()
    };

    if (newProfile.password) {
      this.savePassword(newProfile.id, newProfile.password);
      this.savePassword(newProfile.email, newProfile.password);
    }

    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('profiles').upsert(newProfile), 6000)
        .catch(() => this.queueOfflineMutation('profiles', 'upsert', newProfile));
    }
    const current = await this.getProfiles();
    const updated = [...current.filter(p => p.id !== newProfile.id), newProfile];
    this.setLocal('profiles', updated);

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
      withTimeout(supabase.from('profiles').update(updates).eq('id', id), 6000)
        .catch(() => this.queueOfflineMutation('profiles', 'upsert', { id, ...updates }));
    }

    this.broadcastChange();
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const current = await this.getProfiles();
    const updated = current.filter(p => p.id !== id);
    this.setLocal('profiles', updated);

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

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const res = await withTimeout(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50), 4000);
        if (!res.error && res.data) return res.data as AuditLog[];
      } catch (e) {}
    }
    return this.getLocal('audit_logs', []);
  }

  async logAction(userEmail: string, action: string, details?: string): Promise<void> {
    const log: AuditLog = {
      id: crypto.randomUUID ? crypto.randomUUID() : ('log_' + Date.now()),
      user_email: userEmail,
      action,
      details,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      withTimeout(supabase.from('audit_logs').insert(log), 6000)
        .catch(() => this.queueOfflineMutation('audit_logs', 'upsert', log));
    }
    const current = this.getLocal<AuditLog[]>('audit_logs', []);
    const updated = [log, ...current.slice(0, 49)];
    this.setLocal('audit_logs', updated);
  }

  // --- BORRAR TODOS LOS DATOS LOCALES PARA RESET TOTAL ---
  resetLocalData(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('plataforma_') || k.startsWith('lore_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    this.notifySubscribers();
  }
}

export const storageService = new StorageService();
