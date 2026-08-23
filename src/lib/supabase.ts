/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// URL y clave de Supabase con fallback directo para asegurar que la app en móvil y web se conecte siempre a la misma base de datos
const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  'https://xmxrywztdmjzffgdknpd.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteHJ5d3p0ZG1qemZmZ2RrbnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MjY3OTksImV4cCI6MjEwMjMwMjc5OX0.4I17qZhFFrKdcn3nXxYuudNCevEFw4FLs_wf9nvHwqY';

export const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null;
