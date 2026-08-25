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

const STORAGE_VERSION = 'v12_clean_auth_sync';

function generateId(prefix: string = 'id'): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch (e) {}
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

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

function withTimeout<T>(promiseLike: PromiseLike<T>, ms: number = 7000): Promise<T> {
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
        this.initRealtimeChannel();
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

      // Polling activo suave cada 2 segundos en primer plano
      setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          this.notifySubscribers();
        }
      }, 2000);
    }
  }

  private initRealtimeChannel() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      if (this.realtimeChannel) {
        try { supabase.removeChannel(this.realtimeChannel); } catch (e) {}
      }
      this.realtimeChannel = supabase.channel('plataforma-realtime-global')
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
  // 1. PERFILES & AUTENTICACIÓN
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
      try {
        await supabase.from('app_permissions').upsert({
          user_id: userId,
          app_id: appId,
          can_access: canAccess,
          can_edit: canEdit,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,app_id' });
      } catch (e) {}
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
        try {
          await supabase.from('app_permissions').upsert({
            user_id: p.user_id,
            app_id: p.app_id,
            can_access: p.can_access,
            can_edit: p.can_edit,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,app_id' });
        } catch (e) {}
      }
    }
  }

  async createProfile(profile: Omit<UserProfile, 'id'>): Promise<UserProfile> {
    const newProfile: UserProfile = {
      ...profile,
      id: generateId('usr'),
      created_at: new Date().toISOString()
    };

    if (newProfile.password) {
      this.savePassword(newProfile.id, newProfile.password);
      this.savePassword(newProfile.email, newProfile.password);
    }

    const current = await this.getProfiles();
    this.setLocal('profiles', [...current, newProfile]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert(newProfile);
      } catch (e) {}
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
      try {
        await supabase.from('profiles').update(updates).eq('id', id);
      } catch (e) {}
    }
    return updatedProfile;
  }

  async deleteProfile(id: string): Promise<void> {
    const current = await this.getProfiles();
    this.setLocal('profiles', current.filter(p => p.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
        await supabase.from('app_permissions').delete().eq('user_id', id);
      } catch (e) {}
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
      id: generateId('log'),
      user_email: userEmail,
      action,
      details,
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').insert(log);
      } catch (e) {}
    }
    const current = this.getLocal<AuditLog[]>('audit_logs', []);
    this.setLocal('audit_logs', [log, ...current.slice(0, 49)]);
  }

  // ==========================================
  // 2. GASTOS & FINANZAS (GLOBAL UNIFICADO)
  // ==========================================
  async getWalletConfig(_userId?: string): Promise<WalletConfig> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('wallet_config').select('*').limit(1), 6000);
        if (!error && data && data.length > 0) {
          const raw = data[0];
          const cfg: WalletConfig = {
            account_1_name: raw.account_1_name || 'Abanca Personal',
            account_1_initial_balance: Number(raw.account_1_initial_balance) || 0,
            account_2_name: raw.account_2_name || 'ING Conjunta',
            account_2_initial_balance: Number(raw.account_2_initial_balance) || 0,
            has_account_2: Boolean(raw.has_account_2),
            onboarding_completed: Boolean(raw.onboarding_completed)
          };
          this.setLocal('wallet_config', cfg);
          return cfg;
        }
      } catch (e) {}
    }
    return this.getLocal('wallet_config', {
      account_1_name: 'Abanca Personal',
      account_1_initial_balance: 0,
      account_2_name: 'ING Conjunta',
      account_2_initial_balance: 0,
      has_account_2: true,
      onboarding_completed: true
    });
  }

  async updateWalletConfig(updates: Partial<WalletConfig>, _userId?: string): Promise<WalletConfig> {
    const current = await this.getWalletConfig();
    const updated: WalletConfig = {
      ...current,
      ...updates,
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    } as any;

    this.setLocal('wallet_config', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('wallet_config').upsert({
          user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          account_1_name: updated.account_1_name,
          account_1_initial_balance: Number(updated.account_1_initial_balance) || 0,
          account_2_name: updated.account_2_name,
          account_2_initial_balance: Number(updated.account_2_initial_balance) || 0,
          has_account_2: updated.has_account_2,
          onboarding_completed: updated.onboarding_completed,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      } catch (e) {}
    }
    return updated;
  }

  async getExpenses(_userId?: string): Promise<ExpenseItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(
          supabase.from('expenses').select('*').order('transaction_date', { ascending: false }),
          6000
        );
        if (!error && data) {
          const formatted: ExpenseItem[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            description: String(row.description || ''),
            amount: Number(row.amount) || 0,
            type: row.type === 'income' ? 'income' : 'expense',
            category: String(row.category || 'Otros'),
            account: (row.account === 'ing' ? 'ing' : 'abanca'),
            transaction_date: String(row.transaction_date || new Date().toISOString().split('T')[0]),
            created_at: row.created_at
          }));
          this.setLocal('expenses', formatted);
          return formatted;
        }
      } catch (e) {}
    }
    const local = this.getLocal<any[]>('expenses', []);
    return local.map(e => ({
      ...e,
      amount: Number(e.amount) || 0,
      account: e.account === 'ing' ? 'ing' : 'abanca'
    }));
  }

  async addExpense(expense: Omit<ExpenseItem, 'id'>, userId?: string): Promise<ExpenseItem> {
    const item: ExpenseItem = {
      ...expense,
      amount: Number(expense.amount) || 0,
      user_id: userId || expense.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: generateId('exp')
    };
    const current = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', [item, ...current.filter(e => e.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expenses').upsert({
          id: item.id,
          user_id: item.user_id,
          description: item.description,
          amount: item.amount,
          type: item.type,
          category: item.category,
          account: item.account || 'abanca',
          transaction_date: item.transaction_date || new Date().toISOString().split('T')[0]
        });
      } catch (e) {}
    }
    return item;
  }

  async deleteExpense(id: string, _userId?: string): Promise<void> {
    const current = this.getLocal<ExpenseItem[]>('expenses', []);
    this.setLocal('expenses', current.filter(e => e.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expenses').delete().eq('id', id);
      } catch (e) {}
    }
  }

  async clearAllExpenses(_userId?: string): Promise<void> {
    this.setLocal('expenses', []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('expenses').delete().neq('id', '___non_existent___');
      } catch (e) {}
    }
  }

  async getSavingsGoals(_userId?: string): Promise<SavingsGoal[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('savings_goals').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data) {
          const list: SavingsGoal[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            target_amount: Number(row.target_amount) || 0,
            current_amount: Number(row.current_amount) || 0,
            account: row.account || 'ing',
            target_date: row.target_date,
            notes: row.notes,
            created_at: row.created_at
          }));
          this.setLocal('savings_goals', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<SavingsGoal[]>('savings_goals', []);
  }

  async addSavingsGoal(goal: Omit<SavingsGoal, 'id'>, userId?: string): Promise<SavingsGoal> {
    const item: SavingsGoal = {
      ...goal,
      target_amount: Number(goal.target_amount) || 0,
      current_amount: Number(goal.current_amount) || 0,
      user_id: userId || goal.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: generateId('goal'),
      created_at: new Date().toISOString()
    };
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', [item, ...current.filter(g => g.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('savings_goals').upsert({
          id: item.id,
          user_id: item.user_id,
          title: item.title,
          target_amount: item.target_amount,
          current_amount: item.current_amount,
          account: item.account,
          target_date: item.target_date,
          notes: item.notes
        });
      } catch (e) {}
    }
    return item;
  }

  async updateSavingsGoal(id: string, updates: Partial<SavingsGoal>, _userId?: string): Promise<void> {
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', current.map(g => g.id === id ? { ...g, ...updates } : g));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('savings_goals').update(updates).eq('id', id);
      } catch (e) {}
    }
  }

  async deleteSavingsGoal(id: string, _userId?: string): Promise<void> {
    const current = this.getLocal<SavingsGoal[]>('savings_goals', []);
    this.setLocal('savings_goals', current.filter(g => g.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('savings_goals').delete().eq('id', id);
      } catch (e) {}
    }
  }

  async getCategoryBudgets(_userId?: string): Promise<CategoryBudget[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('category_budgets').select('*'), 6000);
        if (!error && data && data.length > 0) {
          const list: CategoryBudget[] = (data as any[])
            .filter(b => typeof b.category === 'string' && !b.category.startsWith('__'))
            .map(b => ({
              category: b.category,
              monthly_limit: Number(b.monthly_limit) || 0,
              icon: b.icon,
              color: b.color
            }));
          this.setLocal('category_budgets', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<CategoryBudget[]>('category_budgets', DEFAULT_CATEGORY_BUDGETS);
  }

  async updateCategoryBudget(category: string, monthlyLimit: number, _userId?: string): Promise<void> {
    const current = await this.getCategoryBudgets();
    const updated = current.map(c => c.category === category ? { ...c, monthly_limit: monthlyLimit } : c);
    this.setLocal('category_budgets', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('category_budgets').upsert({
          category,
          monthly_limit: Number(monthlyLimit) || 0,
          updated_at: new Date().toISOString()
        }, { onConflict: 'category' });
      } catch (e) {}
    }
  }

  // ==========================================
  // 3. FITNESS & SALUD INTEGRAL (GLOBAL UNIFICADO)
  // ==========================================
  async getFitnessProfile(_userId?: string): Promise<FitnessProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_profiles').select('*').limit(1), 6000);
        if (!error && data && data.length > 0) {
          const raw = data[0];
          const prof: FitnessProfile = {
            id: raw.id,
            user_id: raw.user_id,
            age: Number(raw.age) || 28,
            gender: raw.gender || 'male',
            height_cm: Number(raw.height_cm) || 178,
            current_weight: Number(raw.current_weight) || 95.7,
            target_weight: Number(raw.target_weight) || 75.0,
            activity_level: raw.activity_level || 'moderate',
            goal: raw.goal || 'fat_loss',
            deficit_surplus_pct: Number(raw.deficit_surplus_pct) || -20,
            target_calories: Number(raw.target_calories) || 2150,
            target_protein: Number(raw.target_protein) || 165,
            target_carbs: Number(raw.target_carbs) || 210,
            target_fat: Number(raw.target_fat) || 65,
            target_water_ml: Number(raw.target_water_ml) || 3000,
            target_daily_steps: Number(raw.target_daily_steps) || 10000,
            carb_cycling_enabled: Boolean(raw.carb_cycling_enabled),
            training_day_carbs: raw.training_day_carbs ? Number(raw.training_day_carbs) : undefined,
            rest_day_carbs: raw.rest_day_carbs ? Number(raw.rest_day_carbs) : undefined,
            onboarding_completed: Boolean(raw.onboarding_completed),
            updated_at: raw.updated_at
          };
          this.setLocal('fitness_profile', prof);
          return prof;
        }
      } catch (e) {}
    }
    return this.getLocal('fitness_profile', {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      onboarding_completed: true,
      current_weight: 95.7
    });
  }

  async updateFitnessProfile(updates: Partial<FitnessProfile>, _userId?: string): Promise<FitnessProfile> {
    const current = await this.getFitnessProfile();
    const updated: FitnessProfile & { id?: string } = {
      ...current,
      ...updates,
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      updated_at: new Date().toISOString()
    };
    this.setLocal('fitness_profile', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_profiles').upsert(updated, { onConflict: 'user_id' });
      } catch (e) {}
    }
    return updated;
  }

  async getWorkouts(_userId?: string): Promise<FitnessWorkout[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_workouts').select('*').order('workout_date', { ascending: false }), 6000);
        if (!error && data) {
          const list: FitnessWorkout[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            category: row.category,
            duration_minutes: Number(row.duration_minutes) || 0,
            calories_burned: Number(row.calories_burned) || 0,
            workout_date: row.workout_date,
            notes: row.notes,
            exercises: row.exercises || [],
            heart_rate_avg: row.heart_rate_avg ? Number(row.heart_rate_avg) : undefined,
            heart_rate_max: row.heart_rate_max ? Number(row.heart_rate_max) : undefined,
            cardio_zone: row.cardio_zone,
            polar_training_load: row.polar_training_load,
            polar_energy_carbs_pct: row.polar_energy_carbs_pct ? Number(row.polar_energy_carbs_pct) : undefined,
            polar_energy_fat_pct: row.polar_energy_fat_pct ? Number(row.polar_energy_fat_pct) : undefined,
            polar_energy_protein_pct: row.polar_energy_protein_pct ? Number(row.polar_energy_protein_pct) : undefined,
            perceived_exertion: row.perceived_exertion ? Number(row.perceived_exertion) : undefined
          }));
          this.setLocal('workouts', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<FitnessWorkout[]>('workouts', []);
  }

  async addWorkout(workout: Omit<FitnessWorkout, 'id'>, userId?: string): Promise<FitnessWorkout> {
    const item: FitnessWorkout = {
      ...workout,
      duration_minutes: Number(workout.duration_minutes) || 0,
      calories_burned: Number(workout.calories_burned) || 0,
      user_id: userId || workout.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: generateId('wk')
    };
    const current = this.getLocal<FitnessWorkout[]>('workouts', []);
    this.setLocal('workouts', [item, ...current.filter(w => w.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
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
      } catch (e) {}
    }
    return item;
  }

  async deleteWorkout(id: string, _userId?: string): Promise<void> {
    const current = this.getLocal<FitnessWorkout[]>('workouts', []);
    this.setLocal('workouts', current.filter(w => w.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_workouts').delete().eq('id', id);
      } catch (e) {}
    }
  }

  async getDailyNutritionLogs(_userId?: string): Promise<DailyNutritionLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_nutrition_logs').select('*').order('date', { ascending: false }), 6000);
        if (!error && data) {
          const list: DailyNutritionLog[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            date: row.date,
            water_ml: Number(row.water_ml) || 0,
            meals: row.meals || [],
            notes: row.notes
          }));
          this.setLocal('nutrition_logs', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<DailyNutritionLog[]>('nutrition_logs', []);
  }

  async getDailyNutrition(date: string, userId?: string): Promise<DailyNutritionLog> {
    const logs = await this.getDailyNutritionLogs();
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
      water_ml: Number(log.water_ml) || 0,
      user_id: userId || log.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    };
    const logs = this.getLocal<DailyNutritionLog[]>('nutrition_logs', []);
    const existingIndex = logs.findIndex(l => l.date === log.date);
    let updated: DailyNutritionLog[];
    if (existingIndex >= 0) {
      updated = logs.map((l, i) => i === existingIndex ? logWithUser : l);
    } else {
      updated = [logWithUser, ...logs];
    }
    this.setLocal('nutrition_logs', updated);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_nutrition_logs').upsert(logWithUser, { onConflict: 'user_id,date' });
      } catch (e) {}
    }
  }

  async addFoodToDate(date: string, food: Omit<import('../types').FoodEntry, 'id'>, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    const newFood: import('../types').FoodEntry = {
      ...food,
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      id: generateId('food')
    };
    await this.saveDailyNutrition({ ...log, meals: [...log.meals, newFood] }, userId);
  }

  async removeFoodFromDate(date: string, foodId: string, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    await this.saveDailyNutrition({ ...log, meals: log.meals.filter(m => m.id !== foodId) }, userId);
  }

  async updateWater(date: string, amountMl: number, userId?: string): Promise<void> {
    const log = await this.getDailyNutrition(date, userId);
    await this.saveDailyNutrition({ ...log, water_ml: Math.max(0, Number(amountMl) || 0) }, userId);
  }

  async getBodyProgress(_userId?: string): Promise<BodyProgressEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_body_progress').select('*').order('date', { ascending: false }), 6000);
        if (!error && data) {
          const list: BodyProgressEntry[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            date: row.date,
            weight: Number(row.weight) || 0,
            body_fat_percentage: row.body_fat_percentage ? Number(row.body_fat_percentage) : undefined,
            waist_cm: row.waist_cm ? Number(row.waist_cm) : undefined,
            neck_cm: row.neck_cm ? Number(row.neck_cm) : undefined,
            chest_cm: row.chest_cm ? Number(row.chest_cm) : undefined,
            arm_cm: row.arm_cm ? Number(row.arm_cm) : undefined,
            thigh_cm: row.thigh_cm ? Number(row.thigh_cm) : undefined,
            hips_cm: row.hips_cm ? Number(row.hips_cm) : undefined,
            notes: row.notes,
            photo_url: row.photo_url
          }));
          this.setLocal('body_progress', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<BodyProgressEntry[]>('body_progress', []);
  }

  async addBodyProgress(entry: Omit<BodyProgressEntry, 'id'>, userId?: string): Promise<BodyProgressEntry> {
    const item: BodyProgressEntry = {
      ...entry,
      weight: Number(entry.weight) || 0,
      user_id: userId || entry.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: generateId('bp')
    };
    const current = this.getLocal<BodyProgressEntry[]>('body_progress', []);
    this.setLocal('body_progress', [item, ...current.filter(e => e.date !== item.date)]);
    await this.updateFitnessProfile({ current_weight: item.weight });
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_body_progress').upsert(item, { onConflict: 'user_id,date' });
      } catch (e) {}
    }
    return item;
  }

  async deleteBodyProgress(id: string, _userId?: string): Promise<void> {
    const current = this.getLocal<BodyProgressEntry[]>('body_progress', []);
    this.setLocal('body_progress', current.filter(c => c.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_body_progress').delete().eq('id', id);
      } catch (e) {}
    }
  }

  async getPolarMetrics(_userId?: string): Promise<PolarGritMetrics[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('fitness_polar_metrics').select('*').order('date', { ascending: false }), 6000);
        if (!error && data) {
          const list: PolarGritMetrics[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            date: row.date,
            nightly_recharge_status: row.nightly_recharge_status || 'Bueno',
            ans_charge: Number(row.ans_charge) || 0,
            sleep_score: Number(row.sleep_score) || 80,
            resting_hr: Number(row.resting_hr) || 55,
            max_hr: Number(row.max_hr) || 180,
            vo2_max_running_index: row.vo2_max_running_index ? Number(row.vo2_max_running_index) : undefined,
            cardio_load_status: row.cardio_load_status || 'Productivo',
            cardio_load_ratio: Number(row.cardio_load_ratio) || 1.1,
            cardio_z1_z2_min: Number(row.cardio_z1_z2_min) || 0,
            cardio_z3_min: Number(row.cardio_z3_min) || 0,
            cardio_z4_z5_min: Number(row.cardio_z4_z5_min) || 0,
            daily_steps: Number(row.daily_steps) || 10000,
            polar_calories: Number(row.polar_calories) || 2200,
            fitspark_recommendation: row.fitspark_recommendation
          }));
          this.setLocal('polar_metrics', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<PolarGritMetrics[]>('polar_metrics', []);
  }

  async savePolarMetric(metric: Omit<PolarGritMetrics, 'id'>, userId?: string): Promise<PolarGritMetrics> {
    const item: PolarGritMetrics = {
      ...metric,
      ans_charge: Number(metric.ans_charge) || 0,
      sleep_score: Number(metric.sleep_score) || 0,
      resting_hr: Number(metric.resting_hr) || 0,
      max_hr: Number(metric.max_hr) || 0,
      daily_steps: Number(metric.daily_steps) || 0,
      polar_calories: Number(metric.polar_calories) || 0,
      user_id: userId || metric.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      id: generateId('pol')
    };
    const current = this.getLocal<PolarGritMetrics[]>('polar_metrics', []);
    this.setLocal('polar_metrics', [item, ...current.filter(m => m.date !== item.date)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_polar_metrics').upsert(item, { onConflict: 'user_id,date' });
      } catch (e) {}
    }
    return item;
  }

  async resetFitnessData(_userId?: string): Promise<void> {
    const defaultProfile: FitnessProfile = {
      ...DEFAULT_FITNESS_PROFILE,
      user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      onboarding_completed: false
    };
    this.setLocal('fitness_profile', defaultProfile);
    this.setLocal('workouts', []);
    this.setLocal('nutrition_logs', []);
    this.setLocal('body_progress', []);
    this.setLocal('polar_metrics', []);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('fitness_profiles').delete().neq('id', '___non_existent___');
        await supabase.from('fitness_workouts').delete().neq('id', '___non_existent___');
        await supabase.from('fitness_nutrition_logs').delete().neq('id', '___non_existent___');
        await supabase.from('fitness_body_progress').delete().neq('id', '___non_existent___');
        await supabase.from('fitness_polar_metrics').delete().neq('id', '___non_existent___');
      } catch (e) {}
    }
  }

  // ==========================================
  // 4. LIBROS & JUEGOS (GLOBAL UNIFICADO)
  // ==========================================
  async getLibrary(): Promise<LibraryItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('user_library').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data) {
          const list: LibraryItem[] = (data as any[]).map(row => ({
            id: row.id,
            user_id: row.user_id,
            title: row.title,
            media_type: row.media_type,
            genre: row.genre,
            status: row.status,
            rating: Number(row.rating) || 5,
            progress_percentage: Number(row.progress_percentage) || 0
          }));
          this.setLocal('library', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<LibraryItem[]>('library', []);
  }

  async addLibraryItem(item: Omit<LibraryItem, 'id'>): Promise<LibraryItem> {
    const newItem: LibraryItem = {
      ...item,
      rating: Number(item.rating) || 5,
      progress_percentage: Number(item.progress_percentage) || 0,
      id: generateId('lib')
    };
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', [newItem, ...current.filter(i => i.id !== newItem.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_library').upsert(newItem);
      } catch (e) {}
    }
    return newItem;
  }

  async updateLibraryItem(id: string, updates: Partial<LibraryItem>): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', current.map(i => i.id === id ? { ...i, ...updates } : i));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_library').update(updates).eq('id', id);
      } catch (e) {}
    }
  }

  async deleteLibraryItem(id: string): Promise<void> {
    const current = this.getLocal<LibraryItem[]>('library', []);
    this.setLocal('library', current.filter(i => i.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('user_library').delete().eq('id', id);
      } catch (e) {}
    }
  }

  // ==========================================
  // 5. LORE COMERCIAL & DRASANVI (GLOBAL UNIFICADO)
  // ==========================================
  async getLoreClients(): Promise<LoreClient[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_clients').select('*'), 6000);
        if (!error && data) {
          const list: LoreClient[] = (data as any[]).map(row => ({
            id: row.id,
            nombre: row.nombre,
            tipo: row.tipo || 'Farmacia',
            contacto_nombre: row.contacto_nombre || '',
            direccion: row.direccion || '',
            latitud: Number(row.latitud) || 0,
            longitud: Number(row.longitud) || 0,
            ultima_visita_at: row.ultima_visita_at,
            codigo: row.codigo,
            decil: row.decil,
            total_2025: Number(row.total_2025) || 0,
            total_2026: Number(row.total_2026) || 0,
            telefono: row.telefono,
            email: row.email,
            provincia: row.provincia,
            ciudad: row.ciudad,
            activo: row.activo !== false
          }));
          this.setLocal('lore_clients', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<LoreClient[]>('lore_clients', []);
  }

  async addLoreClient(client: Omit<LoreClient, 'id'>): Promise<LoreClient> {
    const item: LoreClient = {
      ...client,
      id: generateId('cli')
    };
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', [item, ...current.filter(c => c.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lore_clients').upsert(item);
      } catch (e) {}
    }
    return item;
  }

  async updateLoreClient(id: string, updates: Partial<LoreClient>): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', current.map(c => c.id === id ? { ...c, ...updates } : c));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lore_clients').update(updates).eq('id', id);
      } catch (e) {}
    }
  }

  async deleteLoreClient(id: string): Promise<void> {
    const current = this.getLocal<LoreClient[]>('lore_clients', []);
    this.setLocal('lore_clients', current.filter(c => c.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lore_clients').delete().eq('id', id);
      } catch (e) {}
    }
  }

  async getLoreCRMItems(): Promise<PharmacyCRMItem[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_crm_pharmacies').select('*'), 6000);
        if (!error && data && data.length > 0) {
          const list: PharmacyCRMItem[] = (data as any[]).map(row => ({
            id: row.id,
            category_type: row.category_type || 'cliente',
            provincia: row.provincia || '',
            ciudad: row.ciudad || '',
            farmacia_nombre: row.farmacia_nombre || '',
            contacto: row.contacto || '',
            telefono: row.telefono || '',
            decil: row.decil || 'D05',
            ventas_anuales: Number(row.ventas_anuales) || 0,
            frecuencia_visita: row.frecuencia_visita || '15 días',
            ultima_visita: row.ultima_visita || '',
            proxima_accion: row.proxima_accion || '',
            fecha_proxima_accion: row.fecha_proxima_accion || '',
            le_interesa: row.le_interesa || '',
            no_le_interesa: row.no_le_interesa || '',
            marcas_competencia: row.marcas_competencia || '',
            detalles_competencia: row.detalles_competencia || '',
            estado_cliente: row.estado_cliente || 'Activo',
            estado_prospeccion: row.estado_prospeccion || 'Sin contactar',
            tendencia_compra: row.tendencia_compra || 'Estable',
            prioridad: row.prioridad || 'Media',
            accion_completada: Boolean(row.accion_completada),
            notas: row.notas || '',
            updated_at: row.updated_at
          }));
          this.setLocal('lore_crm_items', list);
          return list;
        }
      } catch (e) {}
    }
    return this.getLocal<PharmacyCRMItem[]>('lore_crm_items', []);
  }

  async setLoreCRMItems(items: PharmacyCRMItem[]): Promise<void> {
    this.setLocal('lore_crm_items', items);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase && items.length > 0) {
      try {
        await supabase.from('lore_crm_pharmacies').upsert(items);
      } catch (e) {}
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
      try {
        await supabase.from('lore_crm_pharmacies').delete().eq('id', id);
      } catch (e) {}
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
      try {
        await supabase.from('lore_goals').upsert({
          id: 'current_goals',
          objetivo_mensual: Number(updated.objetivoMensual) || 0,
          venta_acumulada: Number(updated.ventaAcumulada) || 0,
          dias_laborables_restantes: Number(updated.diasLaborablesRestantes) || 21,
          incentive_image: updated.incentiveImage,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (e) {}
    }
    return updated;
  }

  async getSavedRoutes(): Promise<LoreSavedRoute[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('lore_saved_routes').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data) {
          const list: LoreSavedRoute[] = (data as any[]).map(r => ({
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
        id: generateId('route'),
        name: nameOrObj,
        date: new Date().toISOString().split('T')[0],
        clientIds: clientIds || [],
        totalDistanceKm: Number(totalDistanceKm) || 0,
        createdAt: new Date().toISOString()
      };
    } else {
      item = {
        ...nameOrObj,
        totalDistanceKm: Number(nameOrObj.totalDistanceKm) || 0,
        id: generateId('route'),
        createdAt: new Date().toISOString()
      };
    }
    const current = this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
    this.setLocal('lore_saved_routes', [item, ...current.filter(r => r.id !== item.id)]);
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lore_saved_routes').upsert({
          id: item.id,
          name: item.name,
          date: item.date,
          client_ids: item.clientIds,
          total_distance_km: item.totalDistanceKm,
          created_at: item.createdAt
        });
      } catch (e) {}
    }
    return item;
  }

  async deleteLoreRoute(id: string): Promise<void> {
    const current = this.getLocal<LoreSavedRoute[]>('lore_saved_routes', []);
    this.setLocal('lore_saved_routes', current.filter(r => r.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('lore_saved_routes').delete().eq('id', id);
      } catch (e) {}
    }
  }

  // ==========================================
  // 6. MECALUX TALENT & ENTREVISTAS (GLOBAL UNIFICADO)
  // ==========================================
  async getInterviewCandidates(_userId?: string): Promise<CandidateInterview[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await withTimeout(supabase.from('interview_candidates').select('*').order('created_at', { ascending: false }), 6000);
        if (!error && data && data.length > 0) {
          const list: CandidateInterview[] = (data as any[]).map(c => ({
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
            noticePeriodWeeks: c.notice_period_weeks ? Number(c.notice_period_weeks) : undefined,
            englishLevel: c.english_level,
            location: c.location,
            linkedinUrl: c.linkedin_url,
            status: c.status,
            interviewDate: c.interview_date,
            durationMinutes: Number(c.duration_minutes) || 60,
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
    return this.getLocal<CandidateInterview[]>('interview_candidates', [INITIAL_CANDIDATE_SAMPLE]);
  }

  async saveInterviewCandidate(candidate: CandidateInterview, userId?: string): Promise<CandidateInterview> {
    const current = await this.getInterviewCandidates();
    const candidateToSave: CandidateInterview = {
      ...candidate,
      user_id: userId || candidate.user_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
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
      try {
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
      } catch (e) {}
    }
    return candidateToSave;
  }

  async deleteInterviewCandidate(id: string, _userId?: string): Promise<void> {
    const current = await this.getInterviewCandidates();
    this.setLocal('interview_candidates', current.filter(c => c.id !== id));
    this.broadcastChange();

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('interview_candidates').delete().eq('id', id);
      } catch (e) {}
    }
  }

  // --- BORRAR TODOS LOS DATOS LOCALES PARA RESET TOTAL ---
  resetLocalData(): void {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('plataforma_') || k.startsWith('lore_') || k.startsWith('sb-') || k.startsWith('supabase.'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    this.notifySubscribers();
  }
}

export const storageService = new StorageService();
