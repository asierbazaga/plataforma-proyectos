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

const STORAGE_VERSION = 'v7_direct_cloud_sync';

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

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 8000): Promise<T> {
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
    if (typeof window !== 'undefined') {
      const ver = localStorage.getItem('plataforma_storage_ver');
      if (ver !== STORAGE_VERSION) {
        this.resetLocalData();
        localStorage.setItem('plataforma_storage_ver', STORAGE_VERSION);
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
        this.notifySubscribers();
      });
      window.addEventListener('online', () => {
        this.initRealtimeChannel();
        this.notifySubscribers();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.initRealtimeChannel();
          this.notifySubscribers();
        }
      });
    }
  }

  private initRealtimeChannel() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      if (this.realtimeChannel) {
        try { supabase.removeChannel(this.realtimeChannel); } catch (e) {}
      }
      this.realtimeChannel = supabase.channel('plataforma-realtime-room')
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          this.notifySubscribers();
        })
        .on('broadcast', { event: 'data_changed' }, () => {
          this.notifySubscribers();
        })
        .subscribe();
    } catch (e) {}
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

  async syncFromCloud(): Promise<void> {
    this.notifySubscribers();
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

  // ==========================================
  // PERFILES & AUTENTICACIÓN
  // ==========================================
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
    map[identifier.trim().toLowerCase()] = pass.trim();
    this.setLocal('user_passwords', map);
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
        const { data, error } = await withTimeout(supabase.from('profiles').select('*'), 6000);
        if (!error && data && data.length > 0) {
          const map = this.getPasswordMap();
          const merged = (data as UserProfile[]).map(p => ({
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
        const { data, error } = await withTimeout(supabase.from('app_permissions').select('*'), 6000);
        if (!error && data && data.length > 0) {
          this.setLocal('permissions', data as AppPermission[]);
          return data as AppPermission[];
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
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('app_permissions').upsert({
        user_id: userId,
        app_id: appId,
        can_access: canAccess,
        can_edit: canEdit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,app_id' });
    }
  }

  async updateUserPermissions(userId: string, newPerms: AppPermission[]): Promise<void> {
    const current = await this.getPermissions();
    const filtered = current.filter(p => p.user_id !== userId);
    const updated = [...filtered, ...newPerms];
    this.setLocal('permissions', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      for (const p of newPerms) {
        await supabase.from('app_permissions').upsert({
          user_id: p.user_id,
          app_id: p.app_id,
          can_access: p.can_access,
          can_edit: p.can_edit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' });
      }
    }
  }

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

    const current = await this.getProfiles();
    this.setLocal('profiles', [...current, newProfile]);

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').upsert(newProfile);
    }

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

    const updatedProfile = { ...current[existingIndex], ...updates };

    if (updates.password) {
      this.savePassword(id, updates.password);
      this.savePassword(updatedProfile.email, updates.password);
    }

    const updated = [...current];
    updated[existingIndex] = updatedProfile;
    this.setLocal('profiles', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').update(updates).eq('id', id);
    }
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const current = await this.getProfiles();
    this.setLocal('profiles', current.filter(p => p.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('profiles').delete().eq('id', id);
      await supabase.from('app_permissions').delete().eq('user_id', id);
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50), 6000);
        if (!error && data) return data as AuditLog[];
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
      await supabase.from('audit_logs').insert(log);
    }
    const current = this.getLocal<AuditLog[]>('audit_logs', []);
    this.setLocal('audit_logs', [log, ...current.slice(0, 49)]);
  }

  // ==========================================
  // GASTOS, CARTERA & METAS DE AHORRO
  // ==========================================
  async getWalletConfig(userId?: string): Promise<WalletConfig> {
    const effectiveUserId = userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('wallet_config').select('*').eq('user_id', effectiveUserId).limit(1), 6000);
        if (!error && data && data.length > 0) {
          const cfg = data[0] as WalletConfig;
          this.setLocal('wallet_config_' + effectiveUserId, cfg);
          return cfg;
        }
      } catch (e) {}
    }
    return this.getLocal('wallet_config_' + effectiveUserId, {
      account_1_name: 'Abanca Personal',
      account_1_initial_balance: 0,
      account_2_name: 'ING Conjunta',
      account_2_initial_balance: 0,
      has_account_2: true,
      onboarding_completed: true
    });
  }

  async updateWalletConfig(updates: Partial<WalletConfig>, userId?: string): Promise<WalletConfig> {
    const effectiveUserId = userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const current = await this.getWalletConfig(effectiveUserId);
    const updated: WalletConfig = { ...current, ...updates, user_id: effectiveUserId } as any;

    this.setLocal('wallet_config_' + effectiveUserId, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('wallet_config').upsert({
        user_id: effectiveUserId,
        account_1_name: updated.account_1_name,
        account_1_initial_balance: updated.account_1_initial_balance,
        account_2_name: updated.account_2_name,
        account_2_initial_balance: updated.account_2_initial_balance,
        has_account_2: updated.has_account_2,
        onboarding_completed: updated.onboarding_completed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
    return updated;
  }

  async getExpenses(userId?: string): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('expenses').select('*').order('transaction_date', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          this.setLocal('expenses', data as ExpenseItem[]);
          return data as ExpenseItem[];
        }
      } catch (e) {}
    }
    const all = this.getLocal<ExpenseItem[]>('expenses', []);
    return userId ? all.filter(e => !e.user_id || e.user_id === userId) : all;
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>, userId?: string): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      user_id: userId || expense.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('exp_' + Date.now())
    };
    const current = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', [item, ...current.filter(e => e.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').upsert(item);
    }
    return item;
  }

  async deleteExpense(id: string, userId?: string): Promise<void> {
    const current = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', current.filter(e => e.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
  }

  async clearAllExpenses(userId?: string): Promise<void> {
    this.setLocal('expenses', []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('expenses').delete();
      if (userId) query = query.eq('user_id', userId);
      await query;
    }
  }

  async getSavingsGoals(userId?: string): Promise<SavingsGoal[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          this.setLocal('savings_goals', data as SavingsGoal[]);
          return data as SavingsGoal[];
        }
      } catch (e) {}
    }
    const all = this.getLocal<SavingsGoal[]>('savings_goals', []);
    return userId ? all.filter(g => !g.user_id || g.user_id === userId) : all;
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>, userId?: string): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      user_id: userId || goal.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('goal_' + Date.now()),
      created_at: new Date().toISOString()
    };
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', [item, ...current.filter(g => g.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('savings_goals').upsert(item);
    }
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>, userId?: string): Promise<void> {
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', current.map(g => g.id === id ? { ...g, ...updates } : g));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('savings_goals').update(updates).eq('id', id);
    }
  }

  async deleteSavingsGoal(id: string, userId?: string): Promise<void> {
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', current.filter(g => g.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('savings_goals').delete().eq('id', id);
    }
  }

  async getCategoryBudgets(userId?: string): Promise<CategoryBudget[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('category_budgets').select('*'), 6000);
        if (!error && data && data.length > 0) {
          const list = (data as CategoryBudget[]).filter(b => typeof b.category === 'string' && !b.category.startsWith('__'));
          this.setLocal('category_budgets', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<CategoryBudget[]>('category_budgets', DEFAULT_CATEGORY_BUDGETS);
  }

  async updateCategoryBudget(category: string, monthlyLimit: number, userId?: string): Promise<void> {
    const current = await this.getCategoryBudgets(userId);
    const updated = current.map(c => c.category === category ? { ...c, monthly_limit: monthlyLimit } : c);
    this.setLocal('category_budgets', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('category_budgets').upsert({
        category,
        monthly_limit: monthlyLimit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'category' });
    }
  }

  // ==========================================
  // FITNESS & SALUD INTEGRAL
  // ==========================================
  async getFitnessProfile(userId?: string): Promise<FitnessProfile> {
    const effectiveUserId = userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_profiles').select('*').eq('user_id', effectiveUserId).limit(1), 6000);
        if (!error && data && data.length > 0) {
          const prof = data[0] as FitnessProfile;
          this.setLocal('fitness_profile_' + effectiveUserId, prof);
          return prof;
        }
      } catch (e) {}
    }
    return this.getLocal('fitness_profile_' + effectiveUserId, {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: effectiveUserId,
      onboarding_completed: true,
      current_weight: 95.7
    });
  }

  async updateFitnessProfile(updates: Partial<FitnessProfile>, userId?: string): Promise<FitnessProfile> {
    const effectiveUserId = userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const current = await this.getFitnessProfile(effectiveUserId);
    const updated: FitnessProfile & { id?: string } = {
      ...current,
      ...updates,
      user_id: effectiveUserId,
      id: (current as any).id || ('prof_' + effectiveUserId.slice(0, 12)),
      updated_at: new Date().toISOString()
    };
    this.setLocal('fitness_profile_' + effectiveUserId, updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_profiles').upsert(updated, { onConflict: 'user_id' });
    }
    return updated;
  }

  async getWorkouts(userId?: string): Promise<FitnessWorkout[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          const list = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            category: row.category,
            duration_minutes: row.duration_minutes,
            calories_burned: row.calories_burned,
            workout_date: row.workout_date,
            notes: row.notes,
            exercises: row.exercises || [],
            heart_rate_avg: row.heart_rate_avg,
            heart_rate_max: row.heart_rate_max,
            cardio_zone: row.cardio_zone,
            polar_training_load: row.polar_training_load,
            polar_energy_carbs_pct: row.polar_energy_carbs_pct,
            polar_energy_fat_pct: row.polar_energy_fat_pct,
            polar_energy_protein_pct: row.polar_energy_protein_pct,
            perceived_exertion: row.perceived_exertion
          }));
          this.setLocal('workouts', list);
          return list;
        }
      } catch (e) {}
    }
    const all = this.getLocal<FitnessWorkout[]>('workouts', []);
    return userId ? all.filter(w => !w.user_id || w.user_id === userId) : all;
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>, userId?: string): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      user_id: userId || workout.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('wk_' + Date.now())
    };
    const current = this.getLocal<FitnessWorkout[]>('workouts', []);
    this.setLocal('workouts', [item, ...current.filter(w => w.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_workouts').upsert({
        id: item.id,
        user_id: item.user_id,
        title: item.title,
        category: item.category,
        duration_minutes: item.duration_minutes,
        calories_burned: item.calories_burned,
        workout_date: item.workout_date,
        exercises: item.exercises || [],
        heart_rate_avg: item.heart_rate_avg,
        heart_rate_max: item.heart_rate_max,
        cardio_zone: item.cardio_zone,
        polar_training_load: item.polar_training_load,
        polar_energy_carbs_pct: item.polar_energy_carbs_pct,
        polar_energy_fat_pct: item.polar_energy_fat_pct,
        polar_energy_protein_pct: item.polar_energy_protein_pct,
        perceived_exertion: item.perceived_exertion,
        notes: item.notes || ''
      });
    }
    return item;
  }

  async deleteWorkout(id: string, userId?: string): Promise<void> {
    const current = this.getLocal<FitnessWorkout[]>('workouts', []);
    this.setLocal('workouts', current.filter(w => w.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_workouts').delete().eq('id', id);
    }
  }

  async getDailyNutritionLogs(userId?: string): Promise<DailyNutritionLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          this.setLocal('nutrition_logs', data as DailyNutritionLog[]);
          return data as DailyNutritionLog[];
        }
      } catch (e) {}
    }
    const all = this.getLocal<DailyNutritionLog[]>('nutrition_logs', []);
    return userId ? all.filter(l => !l.user_id || l.user_id === userId) : all;
  }

  async getDailyNutrition(date: string, userId?: string): Promise<DailyNutritionLog> {
    const logs = await this.getDailyNutritionLogs(userId);
    const found = logs.find(l => l.date === date);
    if (found) return found;

    return {
      id: 'nut_' + (userId || 'asier').slice(0, 8) + '_' + date,
      user_id: userId || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      date,
      water_ml: 0,
      meals: []
    };
  }

  async saveDailyNutrition(log: DailyNutritionLog, userId?: string): Promise<void> {
    const logWithUser: DailyNutritionLog = {
      ...log,
      user_id: userId || log.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    };
    const logs = this.getLocal<DailyNutritionLog[]>('nutrition_logs', []);
    const existingIndex = logs.findIndex(l => l.date === log.date && l.user_id === logWithUser.user_id);
    let updated: DailyNutritionLog[];
    if (existingIndex >= 0) {
      updated = logs.map((l, i) => i === existingIndex ? logWithUser : l);
    } else {
      updated = [logWithUser, ...logs];
    }
    this.setLocal('nutrition_logs', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_nutrition_logs').upsert(logWithUser, { onConflict: 'user_id,date' });
    }
  }

  async addFoodToDate(date: string, food: Omit<import('../types').FoodEntry, 'id'>, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const newFood: import('../types').FoodEntry = {
      ...food,
      id: crypto.randomUUID ? crypto.randomUUID() : ('food_' + Date.now())
    };
    await this.saveDailyNutrition({ ...log, meals: [...log.meals, newFood] }, userId);
  }

  async removeFoodFromDate(date: string, foodId: string, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    await this.saveDailyNutrition({ ...log, meals: log.meals.filter(m => m.id !== foodId) }, userId);
  }

  async updateWater(date: string, amountMl: number, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    await this.saveDailyNutrition({ ...log, water_ml: Math.max(0, amountMl) }, userId);
  }

  async getBodyProgress(userId?: string): Promise<BodyProgressEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_body_progress').select('*').order('date', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          this.setLocal('body_progress', data as BodyProgressEntry[]);
          return data as BodyProgressEntry[];
        }
      } catch (e) {}
    }
    const all = this.getLocal<BodyProgressEntry[]>('body_progress', []);
    return userId ? all.filter(b => !b.user_id || b.user_id === userId) : all;
  }

  async addBodyProgress(entry: Omit<BodyProgressEntry, 'id'>, userId?: string): Promise<BodyProgressEntry> {
    const item: BodyProgressEntry = {
      ...entry,
      user_id: userId || entry.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('bp_' + Date.now())
    };
    const current = this.getLocal<BodyProgressEntry[]>('body_progress', []);
    this.setLocal('body_progress', [item, ...current.filter(e => !(e.date === item.date && e.user_id === item.user_id))]);
    await this.updateFitnessProfile({ current_weight: item.weight }, userId);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_body_progress').upsert(item, { onConflict: 'user_id,date' });
    }
    return item;
  }

  async deleteBodyProgress(id: string, userId?: string): Promise<void> {
    const current = this.getLocal<BodyProgressEntry[]>('body_progress', []);
    this.setLocal('body_progress', current.filter(e => e.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_body_progress').delete().eq('id', id);
    }
  }

  async getPolarMetrics(userId?: string): Promise<PolarGritMetrics[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data) {
          this.setLocal('polar_metrics', data as PolarGritMetrics[]);
          return data as PolarGritMetrics[];
        }
      } catch (e) {}
    }
    const all = this.getLocal<PolarGritMetrics[]>('polar_metrics', []);
    return userId ? all.filter(p => !p.user_id || p.user_id === userId) : all;
  }

  async savePolarMetric(metric: Omit<PolarGritMetrics, 'id'>, userId?: string): Promise<PolarGritMetrics> {
    const item: PolarGritMetrics = {
      ...metric,
      user_id: userId || metric.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: crypto.randomUUID ? crypto.randomUUID() : ('pol_' + Date.now())
    };
    const current = this.getLocal<PolarGritMetrics[]>('polar_metrics', []);
    this.setLocal('polar_metrics', [item, ...current.filter(m => !(m.date === item.date && m.user_id === item.user_id))]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('fitness_polar_metrics').upsert(item, { onConflict: 'user_id,date' });
    }
    return item;
  }

  async resetFitnessData(userId?: string): Promise<void> {
    const defaultProfile: FitnessProfile = {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: userId,
      onboarding_completed: false
    };
    this.setLocal('fitness_profile_' + userId, defaultProfile);
    this.setLocal('workouts', []);
    this.setLocal('nutrition_logs', []);
    this.setLocal('body_progress', []);
    this.setLocal('polar_metrics', []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      let profileDel = supabase.from('fitness_profiles').delete();
      if (userId) profileDel = profileDel.eq('user_id', userId);
      await profileDel;
    }
  }

  // ==========================================
  // LIBROS & JUEGOS
  // ==========================================
  async getLibrary(): Promise<LibraryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('user_library').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data) {
          this.setLocal('library', data as LibraryItem[]);
          return data as LibraryItem[];
        }
      } catch (e) {}
    }
    return this.getLocal<LibraryItem[]>('library', []);
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : ('lib_' + Date.now())
    };
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', [newItem, ...current.filter(i => i.id !== newItem.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('user_library').upsert(newItem);
    }
    return newItem;
  }

  async updateLibraryItem(id: string, updates: Partial<LibraryItem>): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', current.map(i => i.id === id ? { ...i, ...updates } : i));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('user_library').update(updates).eq('id', id);
    }
  }

  async deleteLibraryItem(id: string): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', current.filter(i => i.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('user_library').delete().eq('id', id);
    }
  }

  // ==========================================
  // LORE COMERCIAL & OBJETIVOS DRASANVI
  // ==========================================
  async getLoreClients(): Promise<LoreClient[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_clients').select('*'), 6000);
        if (!error && data) {
          this.setLocal('lore_clients', data as LoreClient[]);
          return data as LoreClient[];
        }
      } catch (e) {}
    }
    return this.getLocal<LoreClient[]>('lore_clients', []);
  }

  async addLoreClient(client: Omit<LoreClient, 'id'>): Promise<LoreClient> {
    const item: LoreClient = {
      ...client,
      id: crypto.randomUUID ? crypto.randomUUID() : ('cli-' + Date.now())
    };
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', [item, ...current.filter(c => c.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_clients').upsert(item);
    }
    return item;
  }

  async updateLoreClient(id: string, updates: Partial<LoreClient>): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', current.map(c => c.id === id ? { ...c, ...updates } : c));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_clients').update(updates).eq('id', id);
    }
  }

  async deleteLoreClient(id: string): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', current.filter(c => c.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_clients').delete().eq('id', id);
    }
  }

  async getLoreCRMItems(): Promise<PharmacyCRMItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_crm_pharmacies').select('*'), 6000);
        if (!error && data) {
          this.setLocal('lore_crm_items', data as PharmacyCRMItem[]);
          return data as PharmacyCRMItem[];
        }
      } catch (e) {}
    }
    return this.getLocal<PharmacyCRMItem[]>('lore_crm_items', []);
  }

  async setLoreCRMItems(items: PharmacyCRMItem[]): Promise<void> {
    this.setLocal('lore_crm_items', items);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase && items.length > 0) {
      await supabase.from('lore_crm_pharmacies').upsert(items);
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
    this.setLocal('lore_crm_items', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_crm_pharmacies').delete().eq('id', id);
    }
  }

  async getLoreGoalsConfig(): Promise<LoreGoalsConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_goals').select('*').limit(1), 6000);
        if (!error && data && data.length > 0) {
          const g = data[0];
          const cfg: LoreGoalsConfig = {
            objetivoMensual: Number(g.objetivo_mensual) || 15000,
            ventaAcumulada: Number(g.venta_acumulada) || 0,
            diasLaborablesRestantes: Number(g.dias_laborables_restantes) || 21,
            incentiveImage: g.incentive_image || '/tabla-incentivos.png',
            updated_at: g.updated_at
          };
          this.setLocal('lore_goals_config', cfg);
          return cfg;
        }
      } catch (e) {}
    }
    return this.getLocal<LoreGoalsConfig>('lore_goals_config', DEFAULT_LORE_GOALS);
  }

  async saveLoreGoalsConfig(config: Partial<LoreGoalsConfig>): Promise<LoreGoalsConfig> {
    const current = await this.getLoreGoalsConfig();
    const updated: LoreGoalsConfig = {
      ...current,
      ...config,
      updated_at: new Date().toISOString()
    };
    this.setLocal('lore_goals_config', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_goals').upsert({
        id: 'current_goals',
        objetivo_mensual: updated.objetivoMensual,
        venta_acumulada: updated.ventaAcumulada,
        dias_laborables_restantes: updated.diasLaborablesRestantes,
        incentive_image: updated.incentiveImage,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
    return updated;
  }

  async getSavedRoutes(): Promise<LoreSavedRoute[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_saved_routes').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data) {
          const list = (data as any[]).map(r => ({
            id: r.id,
            name: r.name,
            date: r.date,
            clientIds: r.client_ids || [],
            totalDistanceKm: Number(r.total_distance_km) || 0,
            createdAt: r.created_at
          }));
          this.setLocal('lore_saved_routes', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
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
    this.setLocal('lore_saved_routes', [item, ...current.filter(r => r.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_saved_routes').upsert({
        id: item.id,
        name: item.name,
        date: item.date,
        client_ids: item.clientIds,
        total_distance_km: item.totalDistanceKm,
        created_at: item.createdAt
      });
    }
    return item;
  }

  async deleteLoreRoute(id: string): Promise<void> {
    const current = this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
    this.setLocal('lore_saved_routes', current.filter(r => r.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('lore_saved_routes').delete().eq('id', id);
    }
  }

  // ==========================================
  // MECALUX TALENT & ENTREVISTAS
  // ==========================================
  async getInterviewCandidates(userId?: string): Promise<CandidateInterview[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('interview_candidates').select('*').order('created_at', { ascending: false });
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await withTimeout(query, 6000);
        if (!error && data && data.length > 0) {
          const list = (data as any[]).map(c => ({
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
          this.setLocal('interview_candidates', list);
          return list;
        }
      } catch (e) {}
    }
    const all = this.getLocal<CandidateInterview[]>('interview_candidates', [INITIAL_CANDIDATE_SAMPLE]);
    return userId ? all.filter(c => !c.user_id || c.user_id === userId) : all;
  }

  async saveInterviewCandidate(candidate: CandidateInterview, userId?: string): Promise<CandidateInterview> {
    const current = await this.getInterviewCandidates();
    const candidateToSave: CandidateInterview = {
      ...candidate,
      user_id: userId || candidate.user_id,
      updatedAt: new Date().toISOString()
    };
    const index = current.findIndex(c => c.id === candidate.id);
    let updated: CandidateInterview[];
    if (index >= 0) {
      updated = current.map((c, i) => i === index ? candidateToSave : c);
    } else {
      updated = [candidateToSave, ...current];
    }
    this.setLocal('interview_candidates', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('interview_candidates').upsert({
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
      });
    }
    return candidateToSave;
  }

  async deleteInterviewCandidate(id: string, userId?: string): Promise<void> {
    const current = await this.getInterviewCandidates();
    this.setLocal('interview_candidates', current.filter(c => c.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      await supabase.from('interview_candidates').delete().eq('id', id);
    }
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
