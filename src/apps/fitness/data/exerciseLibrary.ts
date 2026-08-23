export interface ExerciseDef {
  id: string;
  name: string;
  muscle_group: 'Pecho' | 'Espalda' | 'Piernas (Cuádriceps)' | 'Piernas (Isquios/Glúteo)' | 'Hombros' | 'Bíceps' | 'Tríceps' | 'Core / Abdomen' | 'Cardio';
  secondary_muscles: string[];
  equipment: 'Barra' | 'Mancuernas' | 'Polea' | 'Máquina' | 'Peso Corporal' | 'Kettlebell' | 'Cardio Polar';
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  mechanics: 'Compuesto' | 'Aislamiento';
  instructions: string;
  tips: string;
}

export const EXERCISE_LIBRARY: ExerciseDef[] = [
  // PECHO
  {
    id: 'ex-bench-press',
    name: 'Press de Banca con Barra',
    muscle_group: 'Pecho',
    secondary_muscles: ['Tríceps', 'Deltoides anterior'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Túmbate en el banco, retrae escápulas, baja la barra de forma controlada a la parte media del pecho y empuja con fuerza.',
    tips: 'Mantén los codos en un ángulo de 45-75° respecto al torso. No rebotes la barra.'
  },
  {
    id: 'ex-db-incline-press',
    name: 'Press Inclinado con Mancuernas',
    muscle_group: 'Pecho',
    secondary_muscles: ['Deltoides anterior', 'Tríceps'],
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Banco a 30-45°. Sube las mancuernas con control concentrándote en la porción clavicular del pectoral.',
    tips: 'Excelente rango de movimiento y menor estrés en la articulación del hombro.'
  },
  {
    id: 'ex-chest-dips',
    name: 'Fondos en Paralelas (Pecho)',
    muscle_group: 'Pecho',
    secondary_muscles: ['Tríceps', 'Deltoides anterior'],
    equipment: 'Peso Corporal',
    difficulty: 'Avanzado',
    mechanics: 'Compuesto',
    instructions: 'Inclina el torso hacia adelante unos 30°, flexiona codos hasta 90° y empuja sintiendo el pectoral inferior.',
    tips: 'Si te resulta fácil, añade lastre con cinturón.'
  },
  {
    id: 'ex-cable-flyes',
    name: 'Cruces en Polea Media/Baja',
    muscle_group: 'Pecho',
    secondary_muscles: ['Deltoides anterior'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Lleva las empuñaduras hacia el centro apretando el pecho en el punto de máxima contracción (1s de pausa).',
    tips: 'Mantén una ligera flexión de codos constante durante todo el recorrido.'
  },
  {
    id: 'ex-push-ups',
    name: 'Flexiones de Pecho (Push-Ups)',
    muscle_group: 'Pecho',
    secondary_muscles: ['Tríceps', 'Core'],
    equipment: 'Peso Corporal',
    difficulty: 'Principiante',
    mechanics: 'Compuesto',
    instructions: 'Cuerpo en línea recta, baja hasta rozar el suelo con el pecho y sube bloqueando con control.',
    tips: 'Genial como finalizador o calentamiento.'
  },

  // ESPALDA
  {
    id: 'ex-deadlift',
    name: 'Peso Muerto Convencional',
    muscle_group: 'Espalda',
    secondary_muscles: ['Isquiosurales', 'Glúteos', 'Erectores espinales', 'Trapecios'],
    equipment: 'Barra',
    difficulty: 'Avanzado',
    mechanics: 'Compuesto',
    instructions: 'Barra pegada a las espinillas, espalda neutra, empuja el suelo con las piernas y extiende caderas con potencia.',
    tips: 'Ejercicio rey de fuerza y masa global. Respeta la técnica estricta.'
  },
  {
    id: 'ex-pull-ups',
    name: 'Dominadas Pronas / Neutras',
    muscle_group: 'Espalda',
    secondary_muscles: ['Bíceps', 'Braquial', 'Dorsal ancho'],
    equipment: 'Peso Corporal',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Agarre algo más ancho que los hombros. Sube hasta pasar la barbilla por encima de la barra traccionando con dorsales.',
    tips: 'Evita el balanceo (kipping). Haz la bajada en 2-3 segundos.'
  },
  {
    id: 'ex-barbell-row',
    name: 'Remo con Barra (Pendlay o 45°)',
    muscle_group: 'Espalda',
    secondary_muscles: ['Bíceps', 'Romboides', 'Trapecios'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Inclina el torso manteniendo la columna neutra. Tracciona la barra hacia el ombligo apretando escápulas.',
    tips: 'Tracciona con los codos pegados para mayor activación del dorsal.'
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Jalón al Pecho en Polea',
    muscle_group: 'Espalda',
    secondary_muscles: ['Bíceps', 'Dorsal'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Compuesto',
    instructions: 'Siéntate con los muslos sujetos, inclina ligeramente el torso y baja la barra a la clavícula.',
    tips: 'No tires con los brazos, piensa en clavar los codos hacia tus costados.'
  },
  {
    id: 'ex-seated-cable-row',
    name: 'Remo Gironda en Polea Baja',
    muscle_group: 'Espalda',
    secondary_muscles: ['Romboides', 'Dorsales', 'Bíceps'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Compuesto',
    instructions: 'Mantén la espalda recta y tira del agarre hacia el abdomen bajo, juntando escápulas atrás.',
    tips: 'Excelente para densidad y grosor de la espalda media.'
  },

  // PIERNAS (CUÁDRICEPS)
  {
    id: 'ex-squat',
    name: 'Sentadilla Trasera con Barra',
    muscle_group: 'Piernas (Cuádriceps)',
    secondary_muscles: ['Glúteos', 'Aductores', 'Core'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Pies al ancho de hombros, desciende rompiendo el paralelo manteniendo el pecho alto y empuja con talones.',
    tips: 'Calzado plano o de halterofilia para mejorar la profundidad y estabilidad.'
  },
  {
    id: 'ex-leg-press',
    name: 'Prensa Inclinada 45°',
    muscle_group: 'Piernas (Cuádriceps)',
    secondary_muscles: ['Glúteos', 'Isquios'],
    equipment: 'Máquina',
    difficulty: 'Principiante',
    mechanics: 'Compuesto',
    instructions: 'Apoya bien la zona lumbar en el respaldo, baja hasta flexión profunda sin despegar el glúteo y empuja.',
    tips: 'Nunca bloquees las rodillas bruscamente en la extensión completa.'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Sentadilla Búlgara con Mancuernas',
    muscle_group: 'Piernas (Cuádriceps)',
    secondary_muscles: ['Glúteos', 'Estabilizadores'],
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Pie trasero elevado en banco, desciende la rodilla trasera hacia el suelo manteniendo el torso firme.',
    tips: 'Inclinarse ligeramente hacia adelante transfiere más tensión al glúteo; vertical a cuádriceps.'
  },
  {
    id: 'ex-leg-extension',
    name: 'Extensiones de Cuádriceps en Máquina',
    muscle_group: 'Piernas (Cuádriceps)',
    secondary_muscles: ['Recto femoral'],
    equipment: 'Máquina',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Extiende las piernas apretando cuádriceps 1 segundo arriba y baja de forma muy controlada.',
    tips: 'Perfecto para hipertrofia pura y series al fallo o drop sets.'
  },

  // PIERNAS (ISQUIOS / GLÚTEO / GEMELOS)
  {
    id: 'ex-romanian-deadlift',
    name: 'Peso Muerto Rumano con Mancuernas o Barra',
    muscle_group: 'Piernas (Isquios/Glúteo)',
    secondary_muscles: ['Glúteos', 'Erectores'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Rodillas semiflexionadas fijas, empuja las caderas hacia atrás sintiendo el estiramiento profundo de isquios.',
    tips: 'La barra debe rozar tus muslos durante todo el descenso.'
  },
  {
    id: 'ex-hip-thrust',
    name: 'Hip Thrust con Barra',
    muscle_group: 'Piernas (Isquios/Glúteo)',
    secondary_muscles: ['Isquios', 'Core'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Espalda apoyada en banco a la altura de escápulas, extiende la cadera arriba bloqueando glúteo 1 segundo.',
    tips: 'Usa una almohadilla protectora en la barra para evitar molestias en la pelvis.'
  },
  {
    id: 'ex-leg-curl',
    name: 'Curl Femoral Tumbado / Sentado',
    muscle_group: 'Piernas (Isquios/Glúteo)',
    secondary_muscles: ['Gemelos'],
    equipment: 'Máquina',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Flexiona las rodillas llevando los talones hacia el glúteo y resiste la fase excéntrica lentamente.',
    tips: 'No arquees la zona lumbar al flexionar.'
  },
  {
    id: 'ex-calf-raises',
    name: 'Elevación de Talones para Gemelos',
    muscle_group: 'Piernas (Isquios/Glúteo)',
    secondary_muscles: ['Sóleo', 'Gastrocnemio'],
    equipment: 'Máquina',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Estira al máximo abajo (pausa 2s) y elévate sobre las puntas de los pies contrayendo al máximo.',
    tips: 'El gemelo responde mejor a pausas en el estiramiento para eliminar el rebote del tendón de Aquiles.'
  },

  // HOMBROS
  {
    id: 'ex-overhead-press',
    name: 'Press Militar de Pie con Barra (OHP)',
    muscle_group: 'Hombros',
    secondary_muscles: ['Tríceps', 'Core', 'Serrato'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Compuesto',
    instructions: 'Aprieta glúteos y abdomen, empuja la barra verticalmente por encima de la cabeza y bloquea con control.',
    tips: 'Mantén el core firme para no arquear la zona lumbar.'
  },
  {
    id: 'ex-db-lateral-raises',
    name: 'Elevaciones Laterales con Mancuernas',
    muscle_group: 'Hombros',
    secondary_muscles: ['Trapecio superior'],
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Eleva los brazos hacia los lados en el plano escapular (30° adelantado) hasta la altura de hombros.',
    tips: 'No subas con impulso; usa un peso que te permita controlar la bajada.'
  },
  {
    id: 'ex-face-pull',
    name: 'Face Pull en Polea con Cuerda',
    muscle_group: 'Hombros',
    secondary_muscles: ['Deltoides posterior', 'Manguito rotador', 'Trapecio medio'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Tira de la cuerda hacia los ojos/frente separando las manos y rotando los hombros externamente.',
    tips: 'Crucial para la salud postural y compensar el trabajo de empujes.'
  },
  {
    id: 'ex-rear-delt-flyes',
    name: 'Pájaros para Deltoides Posterior',
    muscle_group: 'Hombros',
    secondary_muscles: ['Romboides'],
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Torso inclinado a 90°, abre los brazos en cruz enfocando la fuerza en la parte trasera del hombro.',
    tips: 'Desactiva los trapecios dejando caer los hombros hacia abajo.'
  },

  // BÍCEPS & BRAZOS
  {
    id: 'ex-barbell-curl',
    name: 'Curl de Bíceps con Barra Z',
    muscle_group: 'Bíceps',
    secondary_muscles: ['Antebrazo', 'Braquial'],
    equipment: 'Barra',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Codos pegados a los costados, flexiona los brazos llevando la barra hacia el pecho sin balancear el cuerpo.',
    tips: 'La barra Z reduce la tensión en las muñecas respecto a la barra recta.'
  },
  {
    id: 'ex-incline-db-curl',
    name: 'Curl Inclinado con Mancuernas',
    muscle_group: 'Bíceps',
    secondary_muscles: ['Cabeza larga bíceps'],
    equipment: 'Mancuernas',
    difficulty: 'Intermedio',
    mechanics: 'Aislamiento',
    instructions: 'Banco a 60°, brazos colgando en estiramiento total, realiza el curl supinando la muñeca arriba.',
    tips: 'El mayor estiramiento promueve una hipertrofia superior en la cabeza larga del bíceps.'
  },
  {
    id: 'ex-hammer-curl',
    name: 'Curl Martillo con Mancuernas',
    muscle_group: 'Bíceps',
    secondary_muscles: ['Braquiorradial', 'Braquial anterior'],
    equipment: 'Mancuernas',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Agarre neutro (palmas enfrentadas), sube las mancuernas manteniendo los codos estables.',
    tips: 'Excelente para engrosar el brazo y dar fuerza de agarre.'
  },

  // TRÍCEPS
  {
    id: 'ex-tricep-pushdown',
    name: 'Extensión de Tríceps en Polea (Cuerda o Barra)',
    muscle_group: 'Tríceps',
    secondary_muscles: ['Cabeza lateral del tríceps'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'Codos inmóviles junto al torso, extiende completamente los brazos abajo abriendo ligeramente la cuerda.',
    tips: 'Mantén los hombros relajados y no te apoyes encima del peso.'
  },
  {
    id: 'ex-skull-crushers',
    name: 'Press Francés con Barra Z',
    muscle_group: 'Tríceps',
    secondary_muscles: ['Cabeza larga tríceps'],
    equipment: 'Barra',
    difficulty: 'Intermedio',
    mechanics: 'Aislamiento',
    instructions: 'Tumbado en banco, baja la barra hacia la coronilla/frente flexionando sólo los codos y extiende.',
    tips: 'Llevar los codos ligeramente inclinados hacia atrás mantiene tensión constante.'
  },
  {
    id: 'ex-overhead-tricep-ext',
    name: 'Extensión de Tríceps Sobre la Cabeza en Polea',
    muscle_group: 'Tríceps',
    secondary_muscles: ['Cabeza larga tríceps'],
    equipment: 'Polea',
    difficulty: 'Intermedio',
    mechanics: 'Aislamiento',
    instructions: 'Tira de la polea por encima de la cabeza maximizando el estiramiento de la cabeza larga.',
    tips: 'Ideal para personas propensas a molestias en los codos.'
  },

  // CORE / ABDOMEN
  {
    id: 'ex-hanging-leg-raise',
    name: 'Elevaciones de Piernas Colgado',
    muscle_group: 'Core / Abdomen',
    secondary_muscles: ['Flexores de cadera', 'Oblicuos'],
    equipment: 'Peso Corporal',
    difficulty: 'Avanzado',
    mechanics: 'Aislamiento',
    instructions: 'Colgado de la barra, flexiona la cadera llevando las rodillas o pies hacia el pecho contrayendo el abdomen.',
    tips: 'Evita el balanceo. Piensa en enrollar la pelvis hacia el ombligo.'
  },
  {
    id: 'ex-cable-crunch',
    name: 'Crunch Abdominal en Polea Alta',
    muscle_group: 'Core / Abdomen',
    secondary_muscles: ['Recto abdominal'],
    equipment: 'Polea',
    difficulty: 'Principiante',
    mechanics: 'Aislamiento',
    instructions: 'De rodillas con la cuerda sujeta tras la cabeza, flexiona la columna llevando los codos hacia las rodillas.',
    tips: 'Mueve el torso mediante la contracción del abdomen, no flexionando las caderas.'
  },
  {
    id: 'ex-ab-wheel',
    name: 'Rueda Abdominal (Ab Wheel Rollout)',
    muscle_group: 'Core / Abdomen',
    secondary_muscles: ['Dorsales', 'Hombros', 'Erectores'],
    equipment: 'Peso Corporal',
    difficulty: 'Avanzado',
    mechanics: 'Compuesto',
    instructions: 'De rodillas, rueda hacia adelante manteniendo la retroversión pélvica y regresa traccionando con el abdomen.',
    tips: 'Mantén el core tenso y nunca dejes que la zona lumbar se hunda.'
  },

  // CARDIO & POLAR ZONAS
  {
    id: 'ex-polar-zone2',
    name: 'Cardio Base Polar Zona 2 (Quema Grasa / Base Aeróbica)',
    muscle_group: 'Cardio',
    secondary_muscles: ['Sistema Cardiovascular', 'Piernas'],
    equipment: 'Cardio Polar',
    difficulty: 'Principiante',
    mechanics: 'Compuesto',
    instructions: 'Mantén la frecuencia cardíaca entre el 60% y 70% de tu FC Máx (ej. 120-140 ppm) en cinta, elíptica o bici.',
    tips: 'Debes poder mantener una conversación sin ahogarte. Máxima eficiencia mitocondrial y preservación muscular.'
  },
  {
    id: 'ex-polar-hiit',
    name: 'HIIT Polar a Intervalos (Zonas 4 y 5)',
    muscle_group: 'Cardio',
    secondary_muscles: ['Todo el cuerpo'],
    equipment: 'Cardio Polar',
    difficulty: 'Avanzado',
    mechanics: 'Compuesto',
    instructions: 'Intervalos de 30s a máxima intensidad (>85% FC Máx) seguidos de 60s de recuperación activa.',
    tips: 'Optimiza el VO2max y eleva el gasto calórico post-ejercicio (EPOC).'
  }
];
