export type Role = 'admin' | 'user' | 'guest';

export type AppId = 'fitness' | 'gastos' | 'libros-juegos' | 'lore';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  department?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface AppPermission {
  id?: string;
  user_id: string;
  app_id: AppId;
  can_access: boolean;
  can_edit: boolean;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  details?: string;
  created_at: string;
}

export interface ApplicationInfo {
  id: AppId;
  name: string;
  description: string;
  category: string;
  iconName: string;
  badgeText: string;
  gradient: string;
  tags: string[];
}

// Sub-App Data Interfaces
export interface FitnessWorkout {
  id: string;
  user_id?: string;
  title: string;
  category: string;
  duration_minutes: number;
  calories_burned: number;
  workout_date: string;
  notes?: string;
}

export interface ExpenseItem {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  transaction_date: string;
}

export interface LibraryItem {
  id: string;
  user_id?: string;
  title: string;
  media_type: 'book' | 'game';
  genre: string;
  status: 'in_progress' | 'completed' | 'wishlist';
  rating: number;
  progress_percentage: number;
}

// Módulo Lore: Clientes y Rutas
export interface LoreClient {
  id: string;
  nombre: string;
  tipo: string; // Farmacia, Hospital, Distribuidor
  contacto_nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  ultima_visita_at: string | null;
  codigo?: string;
  decil?: string; // D10, D09, D08, D07, etc.
  total_2025?: number;
  total_2026?: number;
  telefono?: string;
  email?: string;
  provincia?: string;
  ciudad?: string;
  activo?: boolean;
}

export interface LoreSavedRoute {
  id: string;
  name: string;
  date: string;
  clientIds: string[];
  totalDistanceKm: number;
  createdAt: string;
}
