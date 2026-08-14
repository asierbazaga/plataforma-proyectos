import React, { useEffect, useState } from 'react';
import { FileText, Clock, User, Activity } from 'lucide-react';
import { AuditLog } from '../types';
import { storageService } from '../services/storageService';

export const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    storageService.getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-gradient-to-r from-slate-800/60 to-transparent p-6 rounded-2xl border border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">REGISTRO DE ACTIVIDAD (AUDIT TRAIL)</h1>
          <p className="text-slate-400 text-sm">Historial cronológico de accesos, logins y cambios de permisos.</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Eventos del Sistema
        </h2>

        {logs.length === 0 ? (
          <p className="text-slate-500 text-sm italic py-4">No hay registros de actividad aún.</p>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.user_email}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase">
                        {log.action}
                      </span>
                    </div>
                    {log.details && <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>}
                  </div>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(log.created_at).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
