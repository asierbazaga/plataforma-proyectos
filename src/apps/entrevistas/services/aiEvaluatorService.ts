import { MecaluxCompetencyRubric, CandidateInterview } from '../../../types';

export interface AiEvaluationResult {
  evaluations: Record<string, { evaluacion: 'Inexistente' | 'Pobre' | 'Bueno' | 'Fuerte', comentarios: string }>;
  puntosFuertes: string[];
  puntosAMejorar: string[];
  resumen: string;
}

export const aiEvaluatorService = {
  generatePrompt: (notes: string, rubrics: MecaluxCompetencyRubric[]): string => {
    return `Eres un asistente experto en evaluar candidatos técnicos para Mecalux.
Tu tarea es leer las NOTAS LIBRES tomadas por un entrevistador y mapearlas a una lista de RÚBRICAS.
Para cada rúbrica, debes decidir el nivel ('Inexistente', 'Pobre', 'Bueno', 'Fuerte') que mejor se ajuste a las notas, y redactar un comentario profesional justificando la decisión basándote estrictamente en lo que dicen las notas. Si las notas no mencionan nada sobre una competencia, asígnale 'Inexistente' y en comentarios pon 'No evaluado / No hay notas al respecto'.

Además, debes extraer hasta 3 Puntos Fuertes, hasta 3 Puntos a Mejorar, y un Resumen General.

Formato de salida OBLIGATORIO (JSON estricto):
{
  "evaluations": {
    "ID_RUBRICA": {
      "evaluacion": "Bueno",
      "comentarios": "Justificación..."
    }
  },
  "puntosFuertes": ["punto 1", "punto 2"],
  "puntosAMejorar": ["punto 1", "punto 2"],
  "resumen": "Resumen general..."
}

RÚBRICAS DISPONIBLES:
${JSON.stringify(rubrics.map(r => ({ id: r.id, nombre: r.nombre, criterios: r.criterios })), null, 2)}

NOTAS DEL ENTREVISTADOR:
"""
${notes}
"""

Genera la evaluación en formato JSON (solo el objeto JSON, sin explicaciones extra, ni Markdown, ni bloques de código).`;
  },
  
  parseResponse: (text: string): AiEvaluationResult => {
    let cleanText = text.trim();
    if (cleanText.startsWith('\`\`\`json')) {
      cleanText = cleanText.substring(7);
      if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.slice(0, -3);
    } else if (cleanText.startsWith('\`\`\`')) {
      cleanText = cleanText.substring(3);
      if (cleanText.endsWith('\`\`\`')) cleanText = cleanText.slice(0, -3);
    }
    return JSON.parse(cleanText) as AiEvaluationResult;
  }
};
