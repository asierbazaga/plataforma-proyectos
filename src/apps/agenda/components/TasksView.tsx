import React, { useState, useEffect } from 'react';
import { Plus, Check, Clock, AlertCircle, Trash2, Calendar, CheckSquare } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaTask } from '../../../types';

export const TasksView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [tasks, setTasks] = useState<AgendaTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadTasks();
    }
  }, [currentUser]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await agendaService.getTasks(currentUser!.id);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !currentUser?.id) return;

    try {
      const taskData: Partial<AgendaTask> = {
        user_id: currentUser.id,
        title: newTaskTitle,
        priority: newTaskPriority,
        status: 'pending',
        is_recurring: false
      };
      
      if (newTaskDueDate) {
        taskData.due_date = newTaskDueDate;
      }

      const task = await agendaService.createTask(taskData);
      
      setTasks([...tasks, task]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error adding task:', error);
      alert('Error al guardar: ' + (error.message || 'Asegúrate de que las tablas en Supabase están creadas.'));
    }
  };

  const toggleTaskStatus = async (task: AgendaTask) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Optimistic update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    try {
      await agendaService.updateTask(task.id, { status: newStatus });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: task.status } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    // Optimistic update
    setTasks(tasks.filter(t => t.id !== taskId));
    
    try {
      await agendaService.deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
      loadTasks(); // Reload to restore
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            Mis Tareas
          </h2>
          <p className="text-sm text-slate-400">Gestiona tus tareas pendientes y completadas.</p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Tarea
          </button>
        )}
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="¿Qué necesitas hacer?"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
              autoFocus
            />
            
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-400 mb-1">Prioridad</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Límite (Opcional)</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
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
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Guardar Tarea
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Pending Tasks List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pendientes ({pendingTasks.length})</h3>
        
        {pendingTasks.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tienes tareas pendientes.</p>
          </div>
        ) : (
          pendingTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${
                isDark ? 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isDark ? 'border-slate-600 hover:border-blue-400' : 'border-slate-300 hover:border-blue-500'
                  }`}
                >
                  {/* Empty checkbox */}
                </button>
                
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {task.title}
                  </h4>
                  {task.due_date && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase ${getPriorityColor(task.priority)}`}>
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  title="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks List */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-6 opacity-75">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Completadas ({completedTasks.length})</h3>
          
          {completedTasks.map((task) => (
            <div
              key={task.id}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-800/20 border-slate-800' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => toggleTaskStatus(task)}
                  className="w-6 h-6 rounded-md border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center transition-colors hover:bg-emerald-600"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
                
                <div>
                  <h4 className={`text-sm font-medium line-through ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {task.title}
                  </h4>
                </div>
              </div>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
