export type Role = 'admin' | 'user' | 'guest';

export type UserStatus = 'active' | 'pending' | 'suspended';

export type AppId = 'fitness' | 'gastos' | 'libros-juegos' | 'lore' | 'entrevistas';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  status?: UserStatus;
  password?: string;
  department?: string;
  avatar_url?: string;
  created_at?: string;
  last_login?: string;
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

// ============================================================================
// FITNESS & CAMBIO FÍSICO INTEGRAL (CON SOPORTE POLAR GRIT X PRO)
// ============================================================================

export type FitnessGoal = 'fat_loss' | 'muscle_gain' | 'recomp' | 'maintenance';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type Gender = 'male' | 'female';
export type SetType = 'normal' | 'warmup' | 'failure' | 'drop_set';

export interface FitnessProfile {
  id?: string;
  user_id?: string;
  age: number;
  gender: Gender;
  height_cm: number;
  current_weight: number;
  target_weight: number;
  activity_level: ActivityLevel;
  goal: FitnessGoal;
  deficit_surplus_pct: number; // e.g. -20 for 20% deficit, +10 for 10% surplus
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_water_ml: number;
  target_daily_steps: number;
  // Opciones avanzadas de ciclado
  carb_cycling_enabled?: boolean;
  training_day_carbs?: number;
  rest_day_carbs?: number;
  onboarding_completed?: boolean;
  preferred_split?: string;
  updated_at?: string;
}

export interface WorkoutSet {
  id: string;
  set_number: number;
  type: SetType;
  reps: number;
  weight_kg: number;
  rpe?: number; // Rate of Perceived Exertion (6-10)
  rir?: number; // Reps in Reserve (0-4)
  completed: boolean;
  rest_seconds?: number;
}

export interface WorkoutExerciseItem {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface FitnessWorkout {
  id: string;
  user_id?: string;
  title: string;
  category: 'Fuerza' | 'Cardio' | 'HIIT' | 'Funcional' | 'Movilidad';
  duration_minutes: number;
  calories_burned: number;
  workout_date: string;
  notes?: string;
  exercises?: WorkoutExerciseItem[];
  // Polar Specific session metrics
  heart_rate_avg?: number;
  heart_rate_max?: number;
  cardio_zone?: string;
  polar_training_load?: 'Baja' | 'Media' | 'Alta' | 'Muy Alta';
  polar_energy_carbs_pct?: number;
  polar_energy_fat_pct?: number;
  polar_energy_protein_pct?: number;
  perceived_exertion?: number; // 1-10 RPE
}

export interface WorkoutRoutineTemplate {
  id: string;
  name: string;
  category: 'Fuerza' | 'Hipertrofia' | 'Pérdida Grasa' | 'Polar Híbrido';
  split_type: 'PPL' | 'Torso_Pierna' | 'FullBody' | 'Arnold' | 'Cardio_Fuerza';
  description: string;
  frequency_days: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  exercises: {
    name: string;
    muscle_group: string;
    default_sets: number;
    default_reps: string;
    notes?: string;
  }[];
}

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'post_workout';

export interface FoodEntry {
  id: string;
  meal_type: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  portion_size?: string;
}

export interface DailyNutritionLog {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  water_ml: number;
  meals: FoodEntry[];
  notes?: string;
}

export interface FitnessRecipe {
  id: string;
  title: string;
  category: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep_time_minutes: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
  image_url?: string;
}

export interface BodyProgressEntry {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  weight: number;
  body_fat_percentage?: number;
  waist_cm?: number;
  neck_cm?: number;
  chest_cm?: number;
  arm_cm?: number;
  thigh_cm?: number;
  hips_cm?: number;
  notes?: string;
  photo_url?: string;
}

export interface PolarGritMetrics {
  id: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  nightly_recharge_status: 'Muy Bueno' | 'Bueno' | 'Comprometido' | 'Pobre';
  ans_charge: number; // -10.0 to +10.0
  sleep_score: number; // 0 to 100
  resting_hr: number; // ppm
  max_hr: number; // ppm
  vo2_max_running_index?: number;
  cardio_load_status: 'Sobrecarga' | 'Productivo' | 'Mantenimiento' | 'Desentrenamiento';
  cardio_load_ratio: number; // Carga / Tolerancia
  cardio_z1_z2_min: number; // Minutos en Zona 1 y 2 (Grasas / Base)
  cardio_z3_min: number;    // Minutos en Zona 3 (Aeróbico)
  cardio_z4_z5_min: number; // Minutos en Zona 4 y 5 (Anaeróbico)
  daily_steps: number;
  polar_calories: number;
  fitspark_recommendation?: string;
}

export interface MacroCalculationResult {
  bmr: number;
  tdee: number;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  training_day_carbs?: number;
  rest_day_carbs?: number;
  protein_ratio_g_per_kg: number;
  fat_ratio_g_per_kg: number;
}

export type WalletAccount = 'abanca' | 'ing';

export interface WalletConfig {
  account_1_name: string;
  account_1_initial_balance: number;
  account_2_name?: string;
  account_2_initial_balance?: number;
  has_account_2?: boolean;
  onboarding_completed: boolean;
}

export interface ExpenseItem {
  id: string;
  user_id?: string;
  description: string;
  amount: number;
  type: 'expense' | 'income';
  category: string;
  transaction_date: string;
  account?: WalletAccount;
  created_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id?: string;
  title: string;
  target_amount: number;
  current_amount: number;
  account: 'abanca' | 'ing' | 'global';
  target_date?: string;
  notes?: string;
  created_at?: string;
}

export interface CategoryBudget {
  category: string;
  monthly_limit: number;
  icon?: string;
  color?: string;
}

export type MediaType = 'book' | 'game' | 'movie' | 'series';
export type MediaStatus = 'in_progress' | 'completed' | 'wishlist' | 'abandoned';

export interface LibraryItem {
  id: string;
  user_id?: string;
  title: string;
  media_type: MediaType;
  genre: string;
  status: MediaStatus;
  rating: number;
  progress_percentage: number;
  author_creator?: string;
  cover_url?: string;
  year?: number;
  user_review?: string;
  tags?: string[];
  total_units?: number;
  current_unit?: number;
  completed_date?: string;
  started_date?: string;
  created_at?: string;
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

export type PurchaseTrend = 'En crecimiento' | 'Estable' | 'Dejando de comprar' | 'Potencial de subida';
export type ProspectStatus = 'Sin contactar' | 'Contactado' | 'Visita realizada' | 'Interesado' | 'Cliente cerrado';
export type ClientCategory = 'cliente' | 'prospeccion';

export interface PharmacyCRMItem {
  id: string;
  category_type: ClientCategory;
  provincia: string;
  ciudad: string;
  farmacia_nombre: string;
  contacto: string;
  telefono: string;
  decil: string;
  ventas_anuales: number;
  frecuencia_visita: string;
  ultima_visita: string;
  proxima_accion: string;
  fecha_proxima_accion: string;
  le_interesa: string;
  no_le_interesa: string;
  marcas_competencia: string;
  detalles_competencia: string;
  estado_cliente: 'Activo' | 'Inactivo' | 'Pendiente';
  estado_prospeccion: ProspectStatus;
  tendencia_compra: PurchaseTrend;
  prioridad: 'Alta' | 'Media' | 'Baja';
  accion_completada: boolean;
  notas: string;
  updated_at?: string;
}

export interface LoreGoalsConfig {
  objetivoMensual: number;
  ventaAcumulada: number;
  diasLaborablesRestantes: number;
  incentiveImage?: string;
  updated_at?: string;
}

// ============================================================================
// MECALUX TALENT & ENTREVISTAS (TEAM LEADER)
// ============================================================================

export type MecaluxEvaluationLevel = 'Inexistente' | 'Pobre' | 'Bueno' | 'Fuerte';
export type MecaluxCompetencySection = 'Competencias Profesionales' | 'Softskills' | 'Preguntas Dinámicas';

export interface MecaluxCompetencyRubric {
  id: string;
  section: MecaluxCompetencySection;
  nombre: string;
  criterios: {
    inexistente: string;
    pobre: string;
    bueno: string;
    fuerte: string;
  };
  disparadores: string[];
  defaultWeight?: number;
}

export interface CompetencyEvaluation {
  competencyId: string;
  section: MecaluxCompetencySection;
  nombre: string;
  evaluacion: MecaluxEvaluationLevel | '';
  comentarios: string;
}

export interface CandidateInterview {
  id: string;
  user_id?: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  seniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Tech Lead' | 'Especialista';
  currentCompany?: string;
  currentSalaryEur?: number;
  expectedSalaryEur?: number;
  noticePeriodWeeks?: number;
  englishLevel?: string;
  location?: string;
  linkedinUrl?: string;
  status: 'scheduled' | 'in_progress' | 'evaluated' | 'approved' | 'rejected' | 'on_hold';
  interviewDate: string; // YYYY-MM-DD
  durationMinutes?: number;
  interviewNotes?: string;
  cvText?: string;
  cvFileName?: string;
  parsedSkills?: string[];
  evaluations: Record<string, CompetencyEvaluation>; // key: competencyId
  resultadoFinal: {
    decision: 'Aprobado / Contratar' | 'Duda / 2ª Vuelta' | 'Rechazado' | 'Reserva para otro puesto' | 'Pendiente';
    puntuacionGlobal: number; // 0 a 100%
    puntosFuertes: string[];
    puntosAMejorar: string[];
    conclusionesTeamLeader: string;
    salarioRecomendadoEur?: number;
  };
  createdAt: string;
  updatedAt: string;
}

