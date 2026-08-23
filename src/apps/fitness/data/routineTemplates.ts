import { WorkoutRoutineTemplate } from '../../../types';

export const ROUTINE_TEMPLATES: WorkoutRoutineTemplate[] = [
  // 1. PUSH - PULL - LEGS (EMPUJE, TRACCIÓN, PIERNA)
  {
    id: 'tpl-ppl-push',
    name: 'Push (Empuje - Pecho, Hombro, Tríceps)',
    category: 'Hipertrofia',
    split_type: 'PPL',
    description: 'Enfoque en presses pesados, deltoides anterior/lateral y aislamiento de tríceps.',
    frequency_days: 6,
    level: 'Intermedio',
    exercises: [
      { name: 'Press de Banca con Barra', muscle_group: 'Pecho', default_sets: 4, default_reps: '6-8', notes: 'RIR 1-2, descanso 2.5 min' },
      { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', default_sets: 3, default_reps: '8-10', notes: 'Enfoque clavicular' },
      { name: 'Elevaciones Laterales con Mancuernas', muscle_group: 'Hombros', default_sets: 4, default_reps: '12-15', notes: 'Control excéntrico' },
      { name: 'Cruces en Polea Media/Baja', muscle_group: 'Pecho', default_sets: 3, default_reps: '12-15', notes: 'Pausa 1s en contracción' },
      { name: 'Extensión de Tríceps en Polea (Cuerda o Barra)', muscle_group: 'Tríceps', default_sets: 3, default_reps: '10-12', notes: 'Apertura final de cuerda' },
      { name: 'Extensión de Tríceps Sobre la Cabeza en Polea', muscle_group: 'Tríceps', default_sets: 3, default_reps: '12-15', notes: 'Estiramiento máximo' }
    ]
  },
  {
    id: 'tpl-ppl-pull',
    name: 'Pull (Tracción - Espalda, Deltoides Posterior, Bíceps)',
    category: 'Hipertrofia',
    split_type: 'PPL',
    description: 'Trabajo integral de tracciones verticales, horizontales, salud del manguito y flexores de codo.',
    frequency_days: 6,
    level: 'Intermedio',
    exercises: [
      { name: 'Dominadas Pronas / Neutras', muscle_group: 'Espalda', default_sets: 4, default_reps: '6-8', notes: 'Lastre si completas más de 8' },
      { name: 'Remo con Barra (Pendlay o 45°)', muscle_group: 'Espalda', default_sets: 4, default_reps: '8-10', notes: 'Tensión dorsal pura' },
      { name: 'Jalón al Pecho en Polea', muscle_group: 'Espalda', default_sets: 3, default_reps: '10-12', notes: 'Codos hacia los costados' },
      { name: 'Face Pull en Polea con Cuerda', muscle_group: 'Hombros', default_sets: 4, default_reps: '15-20', notes: 'Rotación externa' },
      { name: 'Curl de Bíceps con Barra Z', muscle_group: 'Bíceps', default_sets: 3, default_reps: '8-10', notes: 'Sin balanceos' },
      { name: 'Curl Martillo con Mancuernas', muscle_group: 'Bíceps', default_sets: 3, default_reps: '10-12', notes: 'Grosor de brazo y braquial' }
    ]
  },
  {
    id: 'tpl-ppl-legs',
    name: 'Legs (Pierna Completa & Core)',
    category: 'Hipertrofia',
    split_type: 'PPL',
    description: 'Cadena anterior y posterior, desarrollo de cuádriceps, glúteos y gemelos.',
    frequency_days: 6,
    level: 'Intermedio',
    exercises: [
      { name: 'Sentadilla Trasera con Barra', muscle_group: 'Piernas (Cuádriceps)', default_sets: 4, default_reps: '6-8', notes: 'Rompiendo paralelo' },
      { name: 'Peso Muerto Rumano con Mancuernas o Barra', muscle_group: 'Piernas (Isquios/Glúteo)', default_sets: 4, default_reps: '8-10', notes: 'Estiramiento profundo' },
      { name: 'Prensa Inclinada 45°', muscle_group: 'Piernas (Cuádriceps)', default_sets: 3, default_reps: '10-12', notes: 'Rango amplio' },
      { name: 'Curl Femoral Tumbado / Sentado', muscle_group: 'Piernas (Isquios/Glúteo)', default_sets: 3, default_reps: '12-15', notes: 'Control en la bajada' },
      { name: 'Elevación de Talones para Gemelos', muscle_group: 'Piernas (Isquios/Glúteo)', default_sets: 4, default_reps: '15-20', notes: 'Pausa 2s abajo' },
      { name: 'Elevaciones de Piernas Colgado', muscle_group: 'Core / Abdomen', default_sets: 3, default_reps: '12-15', notes: 'Retroversion pélvica' }
    ]
  },

  // 2. TORSO - PIERNA (4 DÍAS)
  {
    id: 'tpl-upper-power',
    name: 'Torso Fuerza e Hipertrofia (Upper)',
    category: 'Fuerza',
    split_type: 'Torso_Pierna',
    description: 'División equilibrada de tren superior con los movimientos fundamentales de empuje y tracción.',
    frequency_days: 4,
    level: 'Intermedio',
    exercises: [
      { name: 'Press de Banca con Barra', muscle_group: 'Pecho', default_sets: 4, default_reps: '5-6', notes: 'Fuerza pesada' },
      { name: 'Remo con Barra (Pendlay o 45°)', muscle_group: 'Espalda', default_sets: 4, default_reps: '6-8', notes: 'Explosivo' },
      { name: 'Press Militar de Pie con Barra (OHP)', muscle_group: 'Hombros', default_sets: 3, default_reps: '6-8', notes: 'Estabilidad core' },
      { name: 'Dominadas Pronas / Neutras', muscle_group: 'Espalda', default_sets: 3, default_reps: '8-10', notes: 'Rango estricto' },
      { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', default_sets: 3, default_reps: '10-12', notes: 'Bombeo' },
      { name: 'Curl Inclinado con Mancuernas', muscle_group: 'Bíceps', default_sets: 3, default_reps: '10-12', notes: 'Cabeza larga' },
      { name: 'Press Francés con Barra Z', muscle_group: 'Tríceps', default_sets: 3, default_reps: '10-12', notes: 'Extensión controlada' }
    ]
  },
  {
    id: 'tpl-lower-power',
    name: 'Pierna & Cadena Posterior (Lower)',
    category: 'Fuerza',
    split_type: 'Torso_Pierna',
    description: 'Enfoque completo en cuádriceps, glúteos e isquiosurales.',
    frequency_days: 4,
    level: 'Intermedio',
    exercises: [
      { name: 'Sentadilla Trasera con Barra', muscle_group: 'Piernas (Cuádriceps)', default_sets: 4, default_reps: '6-8', notes: 'Fuerza base' },
      { name: 'Hip Thrust con Barra', muscle_group: 'Piernas (Isquios/Glúteo)', default_sets: 4, default_reps: '8-10', notes: 'Pausa arriba' },
      { name: 'Sentadilla Búlgara con Mancuernas', muscle_group: 'Piernas (Cuádriceps)', default_sets: 3, default_reps: '10-12', notes: 'Unilateral' },
      { name: 'Curl Femoral Tumbado / Sentado', muscle_group: 'Piernas (Isquios/Glúteo)', default_sets: 3, default_reps: '12-15', notes: 'Aislamiento' },
      { name: 'Rueda Abdominal (Ab Wheel Rollout)', muscle_group: 'Core / Abdomen', default_sets: 3, default_reps: '10-12', notes: 'Core blindado' }
    ]
  },

  // 3. FULL BODY (3 DÍAS / SEMANA)
  {
    id: 'tpl-fullbody-a',
    name: 'Full Body A (Sentadilla + Banca + Remo)',
    category: 'Fuerza',
    split_type: 'FullBody',
    description: 'Máxima frecuencia de estímulo corporal en 3 días no consecutivos.',
    frequency_days: 3,
    level: 'Principiante',
    exercises: [
      { name: 'Sentadilla Trasera con Barra', muscle_group: 'Piernas (Cuádriceps)', default_sets: 4, default_reps: '6-8' },
      { name: 'Press de Banca con Barra', muscle_group: 'Pecho', default_sets: 4, default_reps: '6-8' },
      { name: 'Remo con Barra (Pendlay o 45°)', muscle_group: 'Espalda', default_sets: 4, default_reps: '8-10' },
      { name: 'Elevaciones Laterales con Mancuernas', muscle_group: 'Hombros', default_sets: 3, default_reps: '12-15' },
      { name: 'Curl de Bíceps con Barra Z', muscle_group: 'Bíceps', default_sets: 3, default_reps: '10-12' },
      { name: 'Crunch Abdominal en Polea Alta', muscle_group: 'Core / Abdomen', default_sets: 3, default_reps: '12-15' }
    ]
  },

  // 4. POLAR HÍBRIDO (FUERZA + CARDIO EN ZONA 2 QUEMAGRASAS)
  {
    id: 'tpl-polar-hybrid',
    name: 'Polar Híbrido: Fuerza Funcional + Cardio Zona 2 (30 min)',
    category: 'Polar Híbrido',
    split_type: 'Cardio_Fuerza',
    description: 'Sesión híbrida para recomposición corporal óptima: estímulo muscular + cardio en Zona 2 monitorizado con Polar Grit X Pro.',
    frequency_days: 4,
    level: 'Intermedio',
    exercises: [
      { name: 'Press Inclinado con Mancuernas', muscle_group: 'Pecho', default_sets: 3, default_reps: '8-10', notes: 'Fuerza base' },
      { name: 'Jalón al Pecho en Polea', muscle_group: 'Espalda', default_sets: 3, default_reps: '10-12', notes: 'Dorsales' },
      { name: 'Sentadilla Búlgara con Mancuernas', muscle_group: 'Piernas (Cuádriceps)', default_sets: 3, default_reps: '10-12', notes: 'Pierna' },
      { name: 'Face Pull en Polea con Cuerda', muscle_group: 'Hombros', default_sets: 3, default_reps: '15-20', notes: 'Postura' },
      { name: 'Cardio Base Polar Zona 2 (Quema Grasa / Base Aeróbica)', muscle_group: 'Cardio', default_sets: 1, default_reps: '30 min', notes: 'Mantener FC en 60-70% con Polar Grit X Pro' }
    ]
  }
];
