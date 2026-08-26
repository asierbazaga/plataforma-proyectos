import { CandidateInterview, MecaluxCompetencyRubric, MecaluxCompetencySection } from '../../../types';
import { MECALUX_RUBRICS } from './mecaluxRubrics';

export class ExcelInterviewService {
  /**
   * Genera el archivo Excel idéntico a la plantilla de Mecalux con 4 hojas:
   * 1. Framework
   * 2. Competencias Profesionales
   * 3. Softskills
   * 4. Resultado
   */
  static async exportCandidateToExcel(candidate: CandidateInterview): Promise<void> {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    // 1. Hoja Competencias Profesionales
    const wsProf = this.createSectionSheet(XLSX, 'Competencias Profesionales', candidate);
    XLSX.utils.book_append_sheet(wb, wsProf, 'Competencias Profesionales');

    // 3. Hoja Softskills
    const wsSoft = this.createSectionSheet(XLSX, 'Softskills', candidate);
    XLSX.utils.book_append_sheet(wb, wsSoft, 'Softskills');

    // 4. Hoja Resultado
    const wsResultado = this.createResultadoSheet(XLSX, candidate);
    XLSX.utils.book_append_sheet(wb, wsResultado, 'Resultado');

    // Generar y descargar archivo
    const safeName = candidate.fullName.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const fileName = `Entrevista_Mecalux_${safeName}_${candidate.interviewDate || 'Evaluacion'}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  /**
   * Crea una hoja para una sección específica (Framework, Competencias Profesionales o Softskills)
   * replicando exactamente la estructura de filas y columnas del Excel de Mecalux.
   */
  private static createSectionSheet(XLSX: any, section: MecaluxCompetencySection, candidate: CandidateInterview): any {
    const rubrics = MECALUX_RUBRICS.filter(r => r.section === section);
    const rows: any[][] = [];

    // Cabecera superior con datos del candidato
    rows.push(['MECALUX - EVALUACIÓN DE COMPETENCIAS', '', '', '', '']);
    rows.push(['Candidato:', candidate.fullName, 'Puesto:', candidate.role, 'Fecha:', candidate.interviewDate]);
    rows.push([]); // fila en blanco

    rubrics.forEach(rubric => {
      const evalData = candidate.evaluations[rubric.id] || {
        evaluacion: '',
        comentarios: ''
      };

      // Fila 1: Competencia (Barra azul de cabecera)
      rows.push([`Competencia:`, rubric.nombre, '', '', '']);

      // Fila 2: Niveles
      rows.push(['', 'Inexistente', 'Pobre', 'Bueno', 'Fuerte']);

      // Fila 3: Criterios de evaluación
      rows.push([
        'Criterios de evaluación:',
        rubric.criterios.inexistente,
        rubric.criterios.pobre,
        rubric.criterios.bueno,
        rubric.criterios.fuerte
      ]);

      // Fila 4: Disparadores
      const disparadoresText = rubric.disparadores.map(d => `- ${d}`).join('\n');
      rows.push([
        'Disparadores:',
        disparadoresText,
        '',
        '',
        ''
      ]);

      // Fila 5: Evaluación
      rows.push([
        'Evaluación:',
        evalData.evaluacion || 'Pendiente',
        '',
        '',
        ''
      ]);

      // Fila 6: Comentarios persona entrevistadora
      rows.push([
        'Comentarios persona entrevistadora:',
        evalData.comentarios || 'Sin observaciones registradas.',
        '',
        '',
        ''
      ]);

      // Separador
      rows.push([]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Ajustar anchos de columnas
    ws['!cols'] = [
      { wch: 32 }, // Columna A: Etiquetas (Competencia, Criterios, Disparadores, etc.)
      { wch: 36 }, // Columna B: Inexistente / Contenido
      { wch: 36 }, // Columna C: Pobre / Contenido
      { wch: 36 }, // Columna D: Bueno / Contenido
      { wch: 42 }  // Columna E: Fuerte / Contenido
    ];

    return ws;
  }

  /**
   * Crea la hoja de "Resultado" con resumen ejecutivo, métricas, pros/cons y conclusiones.
   */
  private static createResultadoSheet(XLSX: any, candidate: CandidateInterview): any {
    const rows: any[][] = [];

    rows.push(['MECALUX - DICTAMEN FINAL DE ENTREVISTA (TEAM LEADER)', '', '', '']);
    rows.push([]);
    rows.push(['DATOS DEL CANDIDATO', '', '', '']);
    rows.push(['Nombre Completo:', candidate.fullName, 'Email:', candidate.email || 'N/A']);
    rows.push(['Puesto / Rol:', candidate.role, 'Teléfono:', candidate.phone || 'N/A']);
    rows.push(['Seniority:', candidate.seniority, 'Ubicación:', candidate.location || 'N/A']);
    rows.push(['Empresa Actual:', candidate.currentCompany || 'N/A', 'Nivel de Inglés:', candidate.englishLevel || 'N/A']);
    rows.push(['Salario Actual:', candidate.currentSalaryEur ? `${candidate.currentSalaryEur} €` : 'N/A', 'Salario Pretendido:', candidate.expectedSalaryEur ? `${candidate.expectedSalaryEur} €` : 'N/A']);
    rows.push(['Preaviso / Disponibilidad:', candidate.noticePeriodWeeks ? `${candidate.noticePeriodWeeks} semanas` : 'Inmediata', 'Fecha Entrevista:', candidate.interviewDate]);
    rows.push([]);

    rows.push(['RESUMEN DE EVALUACIONES POR BLOQUE', '', '', '']);
    rows.push(['Bloque / Sección', 'Competencia', 'Nivel Obtenido', 'Comentarios del Evaluador']);

    MECALUX_RUBRICS.forEach(r => {
      const ev = candidate.evaluations[r.id];
      rows.push([
        r.section,
        r.nombre,
        ev?.evaluacion || 'No evaluada',
        ev?.comentarios || ''
      ]);
    });

    rows.push([]);
    rows.push(['DICTAMEN Y CONCLUSIÓN FINAL DEL TEAM LEADER', '', '', '']);
    rows.push(['Decisión Final:', candidate.resultadoFinal.decision]);
    rows.push(['Puntuación Global:', `${candidate.resultadoFinal.puntuacionGlobal}%`]);
    rows.push(['Salario Sugerido Mecalux:', candidate.resultadoFinal.salarioRecomendadoEur ? `${candidate.resultadoFinal.salarioRecomendadoEur} €` : 'N/A']);
    rows.push([]);

    rows.push(['Puntos Fuertes (Pros):']);
    if (candidate.resultadoFinal.puntosFuertes && candidate.resultadoFinal.puntosFuertes.length > 0) {
      candidate.resultadoFinal.puntosFuertes.forEach(p => rows.push([`- ${p}`]));
    } else {
      rows.push(['- Ninguno especificado']);
    }
    rows.push([]);

    rows.push(['Puntos a Mejorar / Riesgos (Cons):']);
    if (candidate.resultadoFinal.puntosAMejorar && candidate.resultadoFinal.puntosAMejorar.length > 0) {
      candidate.resultadoFinal.puntosAMejorar.forEach(p => rows.push([`- ${p}`]));
    } else {
      rows.push(['- Ninguno especificado']);
    }
    rows.push([]);

    rows.push(['Conclusiones del Evaluador / Team Leader:']);
    rows.push([candidate.resultadoFinal.conclusionesTeamLeader || 'Sin conclusiones finales.']);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 30 },
      { wch: 45 },
      { wch: 25 },
      { wch: 55 }
    ];

    return ws;
  }

  /**
   * Exporta la matriz global con todos los candidatos entrevistados.
   */
  static async exportAllCandidatesSummary(candidates: CandidateInterview[]): Promise<void> {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const rows: any[][] = [];

    rows.push(['MECALUX - MATRIZ DE CANDIDATOS ENTREVISTADOS (TEAM LEADER)', '', '', '', '', '', '', '', '']);
    rows.push([
      'Nombre',
      'Puesto',
      'Seniority',
      'Fecha',
      'Puntuación Global',
      'Decisión Final',
      'Salario Pretendido',
      'Salario Recomendado',
      'Estado'
    ]);

    candidates.forEach(c => {
      rows.push([
        c.fullName,
        c.role,
        c.seniority,
        c.interviewDate,
        `${c.resultadoFinal.puntuacionGlobal}%`,
        c.resultadoFinal.decision,
        c.expectedSalaryEur ? `${c.expectedSalaryEur} €` : 'N/A',
        c.resultadoFinal.salarioRecomendadoEur ? `${c.resultadoFinal.salarioRecomendadoEur} €` : 'N/A',
        c.status
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      { wch: 28 },
      { wch: 32 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 24 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Matriz Candidatos');
    XLSX.writeFile(wb, `Mecalux_Matriz_Candidatos_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  /**
   * Lee un archivo Excel o CSV y extrae datos de candidatos o rellena evaluaciones existentes.
   */
  static async importCandidatesFromExcel(file: File): Promise<Partial<CandidateInterview>[]> {
    const XLSX = await import('xlsx');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          const results: Partial<CandidateInterview>[] = [];

          // Intentar leer la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

          jsonData.forEach((row: any) => {
            const candidate: Partial<CandidateInterview> = {
              id: `cand_import_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              fullName: row['Nombre'] || row['Nombre Completo'] || row['Candidato'] || row['full_name'] || 'Candidato Importado',
              email: row['Email'] || row['Correo'] || row['email'] || '',
              phone: row['Teléfono'] || row['Telefono'] || row['phone'] || '',
              role: row['Puesto'] || row['Rol'] || row['Cargo'] || 'Software Engineer Backend (.NET / SGA)',
              seniority: row['Seniority'] || 'Senior',
              expectedSalaryEur: Number(row['Salario Pretendido'] || row['Sueldo'] || 0) || undefined,
              interviewDate: row['Fecha'] || new Date().toISOString().split('T')[0],
              status: 'scheduled',
              evaluations: {},
              resultadoFinal: {
                decision: 'Pendiente',
                puntuacionGlobal: 0,
                puntosFuertes: [],
                puntosAMejorar: [],
                conclusionesTeamLeader: 'Importado desde Excel.'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            results.push(candidate);
          });

          resolve(results);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }
}
