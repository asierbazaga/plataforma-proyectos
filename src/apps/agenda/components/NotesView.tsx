import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { agendaService } from '../../../services/agendaService';
import { AgendaNote } from '../../../types';

export const NotesView: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  
  const [notes, setNotes] = useState<AgendaNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadNotes();
    }
  }, [currentUser]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await agendaService.getNotes(currentUser!.id);
      setNotes(data);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!currentUser?.id) return;
    try {
      const note = await agendaService.createNote({
        user_id: currentUser.id,
        title: 'Nueva Nota',
        content: '',
        date: new Date().toISOString().split('T')[0]
      });
      setNotes([note, ...notes]);
      startEditing(note);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const startEditing = (note: AgendaNote) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content || '');
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
  };

  const saveNote = async (id: string) => {
    try {
      const updated = await agendaService.updateNote(id, { title: editTitle, content: editContent });
      setNotes(notes.map(n => n.id === id ? updated : n));
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    try {
      await agendaService.deleteNote(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      loadNotes();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            Notas Rápidas
          </h2>
          <p className="text-sm text-slate-400">Apuntes, ideas y diario personal.</p>
        </div>
        
        <button
          onClick={handleAddNote}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-yellow-500/20"
        >
          <Plus className="w-4 h-4" />
          Nueva Nota
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.length === 0 ? (
          <div className={`col-span-full p-8 text-center rounded-2xl border border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tienes notas guardadas.</p>
          </div>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className={`flex flex-col rounded-2xl border transition-all overflow-hidden ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-200'
              }`}
            >
              {editingNoteId === note.id ? (
                <div className="p-4 space-y-3 flex flex-col h-full">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold outline-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    className={`w-full flex-1 px-3 py-2 rounded-lg border text-sm outline-none resize-none ${
                      isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Escribe aquí..."
                  />
                  <div className="flex justify-end gap-2 mt-auto pt-2">
                    <button
                      onClick={cancelEditing}
                      className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => saveNote(note.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex flex-col h-full group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-400/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`text-sm whitespace-pre-wrap flex-1 overflow-hidden line-clamp-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {note.content || <span className="italic opacity-50">Nota vacía...</span>}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-slate-700/30 text-[10px] text-slate-500 font-medium">
                    {new Date(note.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
