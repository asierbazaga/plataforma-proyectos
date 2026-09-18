import { supabase } from '../lib/supabase';
import { 
  AgendaTask, 
  AgendaSubtask, 
  AgendaEvent, 
  AgendaHabit, 
  AgendaHabitLog, 
  AgendaNote 
} from '../types';

export const agendaService = {
  // --- TASKS ---
  async getTasks(userId: string): Promise<AgendaTask[]> {
    const { data, error } = await supabase
      .from('agenda_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTask(task: Partial<AgendaTask>): Promise<AgendaTask> {
    const { data, error } = await supabase
      .from('agenda_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, updates: Partial<AgendaTask>): Promise<AgendaTask> {
    const { data, error } = await supabase
      .from('agenda_tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  // --- SUBTASKS ---
  async createSubtask(subtask: Partial<AgendaSubtask>): Promise<AgendaSubtask> {
    const { data, error } = await supabase
      .from('agenda_subtasks')
      .insert([subtask])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSubtask(subtaskId: string, updates: Partial<AgendaSubtask>): Promise<AgendaSubtask> {
    const { data, error } = await supabase
      .from('agenda_subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  },

  // --- EVENTS ---
  async getEvents(userId: string): Promise<AgendaEvent[]> {
    const { data, error } = await supabase
      .from('agenda_events')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createEvent(event: Partial<AgendaEvent>): Promise<AgendaEvent> {
    const { data, error } = await supabase
      .from('agenda_events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(eventId: string, updates: Partial<AgendaEvent>): Promise<AgendaEvent> {
    const { data, error } = await supabase
      .from('agenda_events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  // --- HABITS ---
  async getHabits(userId: string): Promise<{ habit: AgendaHabit, logs: AgendaHabitLog[] }[]> {
    const { data: habits, error: habitsError } = await supabase
      .from('agenda_habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;
    if (!habits) return [];

    const { data: logs, error: logsError } = await supabase
      .from('agenda_habit_logs')
      .select('*')
      .in('habit_id', habits.map(h => h.id));

    if (logsError) throw logsError;

    return habits.map(habit => ({
      habit,
      logs: logs?.filter(log => log.habit_id === habit.id) || []
    }));
  },

  async createHabit(habit: Partial<AgendaHabit>): Promise<AgendaHabit> {
    const { data, error } = await supabase
      .from('agenda_habits')
      .insert([habit])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleHabitLog(habitId: string, date: string): Promise<void> {
    // Check if log exists
    const { data } = await supabase
      .from('agenda_habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('completed_date', date)
      .single();

    if (data) {
      // Exists, so delete it
      await supabase
        .from('agenda_habit_logs')
        .delete()
        .eq('id', data.id);
    } else {
      // Does not exist, create it
      await supabase
        .from('agenda_habit_logs')
        .insert([{ habit_id: habitId, completed_date: date }]);
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_habits')
      .delete()
      .eq('id', habitId);

    if (error) throw error;
  },

  // --- NOTES ---
  async getNotes(userId: string): Promise<AgendaNote[]> {
    const { data, error } = await supabase
      .from('agenda_notes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createNote(note: Partial<AgendaNote>): Promise<AgendaNote> {
    const { data, error } = await supabase
      .from('agenda_notes')
      .insert([note])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(noteId: string, updates: Partial<AgendaNote>): Promise<AgendaNote> {
    const { data, error } = await supabase
      .from('agenda_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('agenda_notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  }
};
