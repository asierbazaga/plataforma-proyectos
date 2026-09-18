import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaEvent } from '../../../types';

export const CalendarView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadEvents();
    }
  }, [currentUser]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await agendaService.getEvents(currentUser!.id);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate || !currentUser?.id) return;

    // Combine date and time
    const start_time = new Date(`${newEventDate}T${newEventTime || '09:00'}:00`).toISOString();
    // Default end time to 1 hour later
    const end_time = new Date(new Date(start_time).getTime() + 60 * 60 * 1000).toISOString();

    try {
      const ev = await agendaService.createEvent({
        user_id: currentUser.id,
        title: newEventTitle,
        description: newEventDesc,
        start_time,
        end_time,
        is_all_day: !newEventTime
      });
      
      setEvents([...events, ev].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
      setNewEventTitle('');
      setNewEventDesc('');
      setNewEventDate('');
      setNewEventTime('');
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    try {
      await agendaService.deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      loadEvents();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, ev) => {
    const dateKey = new Date(ev.start_time).toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(ev);
    return acc;
  }, {} as Record<string, AgendaEvent[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-400" />
            Calendario de Eventos
          </h2>
          <p className="text-sm text-slate-400">Programa tus compromisos y reuniones.</p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Evento
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleAddEvent} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Título del evento"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              autoFocus
            />
            
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={newEventDesc}
              onChange={(e) => setNewEventDesc(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-400 mb-1">Hora (Opcional - Todo el día)</label>
                <input
                  type="time"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newEventTitle.trim() || !newEventDate}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Guardar Evento
              </button>
            </div>
          </div>
        </form>
      )}

      {Object.keys(groupedEvents).length === 0 ? (
        <div className={`p-8 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
          <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No tienes eventos programados.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([date, dayEvents]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider sticky top-0 py-1 bg-inherit">
                {date}
              </h3>
              
              <div className="space-y-2">
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    className={`group relative flex flex-col p-4 rounded-2xl border-l-4 border-l-indigo-500 transition-all ${
                      isDark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/60' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`text-base font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                          {ev.title}
                        </h4>
                        {ev.description && (
                          <p className="text-sm text-slate-400 mt-1">{ev.description}</p>
                        )}
                        {!ev.is_all_day && (
                          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-indigo-400 bg-indigo-400/10 w-fit px-2 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {new Date(ev.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEvent(ev.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all absolute top-2 right-2"
                        title="Eliminar evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
