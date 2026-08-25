import { MecaluxCompetencyRubric } from '../../../types';

export const MECALUX_RUBRICS: MecaluxCompetencyRubric[] = [
  // ==========================================================================
  // COMPETENCIAS PROFESIONALES (TÉCNICAS & OPERATIVAS MECALUX)
  // ==========================================================================
  {
    id: 'cp_intralogistica',
    section: 'Competencias Profesionales',
    nombre: 'Intralogística & Flujos de Almacén',
    criterios: {
      inexistente: 'No tiene experiencia ni conocimiento sobre intralogística.',
      pobre: 'Tiene conocimientos muy básicos, solo términos como albarán y ha visto alguno alguna vez.',
      bueno: 'Tiene experiencia o conocimientos sobre operativas del almacén como picking, reposiciones, gestión de lotes, entradas, carga de camión, empaquetado.',
      fuerte: 'Conoce todos los flujos internos en un almacén. Tanto de sistemas altamente automatizados como manuales con múltiples operativas y operarios.'
    },
    disparadores: [
      '¿Has trabajado en algún almacén o proyecto logístico? ¿De qué tipo?',
      '¿Puedes explicar los flujos principales (recepción, ubicación, preparación/picking, expedición), interacciones y documentación que se genera?',
      '¿Qué estrategias de picking conoces (wave picking, batch picking, pick-to-light, por zonas) y cuándo aplicarías cada una?',
      '¿Cómo gestionarías el control de trazabilidad, lotes y caducidades en un almacén farmacéutico o alimentario?'
    ]
  },
  {
    id: 'cp_trato_clientes',
    section: 'Competencias Profesionales',
    nombre: 'Experiencia en trato a clientes',
    criterios: {
      inexistente: 'No ha tenido contacto directo con clientes. Muestra inseguridad o rechazo al trato con el cliente y no comprende la importancia del mismo.',
      pobre: 'Ha tratado con clientes en situaciones puntuales o no estructuradas. Responde de forma correcta pero con dificultades para mantener emociones, frustraciones o una actitud profesional bajo presión.',
      bueno: 'Tiene experiencia directa atendiendo a clientes. Escucha activamente, comunica con claridad y mantiene actitud positiva ante quejas o dificultades. Transmite confianza.',
      fuerte: 'Amplia experiencia en atención al cliente en entornos exigentes. Gestiona situaciones difíciles con empatía y actitud profesional. Contribuye a mejorar la experiencia del cliente y aporta sugerencias en los procesos. Informa con detalle a los clientes.'
    },
    disparadores: [
      '¿Qué tipo de relación has tenido con los clientes en tus anteriores experiencias?',
      'Cuéntanos una situación difícil con un cliente: ¿qué pasó y cómo lo resolviste?',
      '¿Cómo afrontas la conversación con un cliente frustrado/enfadado que no puede operar porque el software está bloqueado?',
      '¿Qué puntos consideras que debe de tener un servicio de soporte o implantación para ser ejemplar?'
    ]
  },
  {
    id: 'cp_sga_wms',
    section: 'Competencias Profesionales',
    nombre: 'Software SGA / WMS (Sistemas de Gestión de Almacenes)',
    criterios: {
      inexistente: 'No conoce el concepto de SGA/WMS ni cómo interactúa con un ERP.',
      pobre: 'Conoce qué es un SGA a nivel conceptual pero nunca ha interactuado con su arquitectura ni parametrización.',
      bueno: 'Ha trabajado con o desarrollado módulos para software SGA/WMS (Easy WMS, SAP WM/EWM, Manhattan, etc.). Comprende la lógica de inventario en tiempo real.',
      fuerte: 'Experto en arquitectura funcional y técnica de SGA. Domina algoritmos de cubicaje, optimización de recorridos, priorización de órdenes y reglas de ubicación dinámica.'
    },
    disparadores: [
      '¿Con qué sistemas SGA/WMS has tenido contacto y qué rol tenías en el proyecto?',
      '¿Cómo se sincroniza el stock entre un ERP (ej. SAP, Navision) y un SGA en tiempo real?',
      'Si un operario reporta una rotura de stock durante un picking dirigido, ¿cómo debe reaccionar el sistema?'
    ]
  },
  {
    id: 'cp_sql_bbdd',
    section: 'Competencias Profesionales',
    nombre: 'Bases de Datos & SQL de Alto Rendimiento',
    criterios: {
      inexistente: 'No maneja consultas SQL ni conceptos relacionales básicos.',
      pobre: 'Realiza selects básicos pero desconoce planes de ejecución, índices o transaccionalidad.',
      bueno: 'Escribe queries complejas, domina joins, índices, transacciones ACID, procedimientos almacenados y optimización básica.',
      fuerte: 'Capacidad avanzada de tuning de consultas, análisis de execution plans, particionamiento, locks/deadlocks y diseño para alta concurrencia 24/7.'
    },
    disparadores: [
      '¿Cómo investigas y resuelves un problema de bloqueos (deadlocks) o lentitud en una base de datos en producción con cientos de transacciones por segundo?',
      '¿Cuándo conviene usar un índice agrupado (clustered) vs no agrupado, y qué impacto tienen los índices en operaciones de escritura masivas?',
      'Explica una situación donde tuviste que optimizar una consulta crítica de minutos a milisegundos.'
    ]
  },
  {
    id: 'cp_desarrollo_backend',
    section: 'Competencias Profesionales',
    nombre: 'Desarrollo Backend & Arquitectura (.NET / C# / Java / APIs)',
    criterios: {
      inexistente: 'Sin conocimientos de programación backend estructurada.',
      pobre: 'Conocimiento superficial de sintaxis pero con dificultades en POO, asincronía o diseño por capas.',
      bueno: 'Sólido dominio de POO, async/await, inyección de dependencias, REST APIs y acceso a datos mediante ORM o ADO.NET.',
      fuerte: 'Arquitectura avanzada (Clean Architecture, DDD, Event-Driven, colas RabbitMQ/Kafka), microservicios resilientes, multithreading seguro y benchmarks de rendimiento.'
    },
    disparadores: [
      '¿Cómo diseñas una API backend para que sea tolerante a fallos y mantenga consistencia ante cortes de red temporales?',
      '¿Cómo gestionas la concurrencia y la memoria cuando procesas miles de mensajes de eventos simultáneos?',
      'Describe la arquitectura del proyecto más complejo en el que hayas participado.'
    ]
  },
  {
    id: 'cp_automatizacion_plc',
    section: 'Competencias Profesionales',
    nombre: 'Conectividad Industrial, Automatización & Hardware / PLC / Scada',
    criterios: {
      inexistente: 'Desconoce la interacción entre software de gestión y maquinaria/automatismos.',
      pobre: 'Conoce superficialmente que existen PLCs o autómatas pero no protocolos de comunicación.',
      bueno: 'Comprende la capa de integración WCS/MFC, protocolos industriales (OPC-UA, Modbus, TCP/IP sockets, MQTT) o interacción con lectores de código de barras/RFID.',
      fuerte: 'Amplia experiencia en integración WMS <-> WCS <-> PLC (transelevadores, transportadores, carruseles, AGVs/AMRs). Manejo de timings en milisegundos y contingencias de hardware.'
    },
    disparadores: [
      '¿Has trabajado en integración entre software de gestión y automatismos (transportadores, transelevadores, básculas)?',
      'Si un transelevador pierde comunicación a mitad de una misión de ubicación, ¿cómo debe actuar el software WCS/WMS?'
    ]
  },
  {
    id: 'cp_troubleshooting',
    section: 'Competencias Profesionales',
    nombre: 'Resolución de Incidencias en Producción (Troubleshooting)',
    criterios: {
      inexistente: 'Se bloquea ante errores no previstos y depende completamente de otros para investigar.',
      pobre: 'Revisa logs superficiales pero le cuesta aislar la causa raíz de problemas complejos.',
      bueno: 'Metodología estructurada de diagnóstico: análisis de logs, reproducción de bugs, telemetría y soluciones limpias sin efectos secundarios.',
      fuerte: 'Capacidad sobresaliente de triage bajo alta presión en entornos 24/7. Identifica patrones raíz, genera hotfixes seguros y diseña medidas preventivas definitivas.'
    },
    disparadores: [
      'Cuéntanos una incidencia crítica en producción que hayas tenido que resolver con urgencia. ¿Cuál fue tu proceso paso a paso?',
      '¿Cómo te aseguras de que un parche rápido de emergencia no introduzca regresiones en otros módulos del sistema?'
    ]
  },

  // ==========================================================================
  // FRAMEWORK & METODOLOGÍAS DE TRABAJO
  // ==========================================================================
  {
    id: 'fw_buenas_practicas',
    section: 'Framework',
    nombre: 'Buenas Prácticas de Código (Clean Code, SOLID & Patrones)',
    criterios: {
      inexistente: 'Código desestructurado sin seguir estándares ni convenciones de legibilidad.',
      pobre: 'Conoce los términos SOLID o Clean Code pero no sabe aplicarlos en código real.',
      bueno: 'Aplica principios SOLID de forma natural, escribe código autodocumentado, modular y con bajo acoplamiento.',
      fuerte: 'Referente técnico en calidad de código: define guías de estilo, realiza code reviews constructivos y refactoriza sistemas legados con seguridad.'
    },
    disparadores: [
      '¿Puedes poner un ejemplo práctico de cómo aplicas el Principio de Responsabilidad Única o Inversión de Dependencias en tu día a día?',
      '¿Qué criterios sigues al hacer una Code Review a un compañero?'
    ]
  },
  {
    id: 'fw_agil_metodologias',
    section: 'Framework',
    nombre: 'Metodologías Ágiles & Gestión de Tareas (Scrum / Kanban / Jira)',
    criterios: {
      inexistente: 'No ha trabajado con metodologías ágiles ni herramientas de gestión de tickets.',
      pobre: 'Participa pasivamente en reuniones ágiles pero no comprende el valor de las estimaciones o retrospectivas.',
      bueno: 'Familiarizado con ciclos de sprint, estimación de historias de usuario, dailies, retrospectivas y uso fluido de Jira/Azure DevOps.',
      fuerte: 'Comprensión profunda de la mentalidad ágil. Capaz de desbloquear impedimentos, afinar refinamientos y equilibrar deuda técnica con entrega de valor.'
    },
    disparadores: [
      '¿Cómo organizas tu jornada de trabajo y cómo estimas una tarea compleja con incertidumbre técnica?',
      'Si a mitad de un sprint entra un cambio de alcance prioritario, ¿cómo lo gestionas?'
    ]
  },
  {
    id: 'fw_git_cicd',
    section: 'Framework',
    nombre: 'Control de Versiones & CI/CD (Git Flow, Pipelines, Calidad)',
    criterios: {
      inexistente: 'No utiliza herramientas de control de versiones o solo comandos básicos con miedo a conflictos.',
      pobre: 'Usa git pull/push pero se bloquea ante ramas divergentes, rebases o resolución de conflictos.',
      bueno: 'Domina Git Flow, ramas de feature/hotfix, pull requests, resolución de conflictos y pipelines de build/deploy automáticos.',
      fuerte: 'Diseña y optimiza pipelines de integración continua, despliegues sin downtime, versionado semántico y políticas de protección de ramas.'
    },
    disparadores: [
      '¿Qué flujo de trabajo en Git prefieres (GitFlow, Trunk-Based) y por qué?',
      '¿Cómo resuelves un conflicto de merge complejo entre dos ramas desfasadas?'
    ]
  },
  {
    id: 'fw_testing_qa',
    section: 'Framework',
    nombre: 'Testing, Calidad & Cobertura (Unit, Integration, E2E)',
    criterios: {
      inexistente: 'No realiza pruebas automatizadas; solo comprobaciones manuales rápidas.',
      pobre: 'Escribe tests unitarios muy simples únicamente cuando se lo exigen, sin validar casos límites.',
      bueno: 'Escribe tests unitarios y de integración de forma habitual con mocks/stubs, garantizando cobertura de lógica de negocio crítica.',
      fuerte: 'Estrategia integral de testing (TDD/BDD, tests de carga, regresión automatizada, pipelines con gates de calidad SonarQube).'
    },
    disparadores: [
      '¿Qué porcentaje de tu tiempo dedicas a escribir tests y qué partes del código consideras prioritarias para testear?',
      '¿Cómo testeas un proceso que depende de una base de datos externa o un servicio de terceros?'
    ]
  },

  // ==========================================================================
  // SOFTSKILLS & VISIÓN TEAM LEADER
  // ==========================================================================
  {
    id: 'ss_comunicacion',
    section: 'Softskills',
    nombre: 'Comunicación, Claridad & Asertividad',
    criterios: {
      inexistente: 'Dificultad severa para expresar ideas técnicas con claridad. Respuestas monosilábicas o dispersas.',
      pobre: 'Comunica de forma confusa, requiere repreguntar constantemente para entender sus explicaciones.',
      bueno: 'Se expresa de manera estructurada, clara y fluida. Adapta el lenguaje según el interlocutor (técnico vs negocio).',
      fuerte: 'Excelente capacidad de síntesis, argumentación constructiva, escucha activa y carisma para presentar soluciones técnicas complejas con sencillez.'
    },
    disparadores: [
      'Explícanos un concepto técnico complejo de tu especialidad como si se lo contaras a alguien que no sabe de informática.',
      '¿Cómo comunicas a un responsable de proyecto que un plazo no se va a poder cumplir?'
    ]
  },
  {
    id: 'ss_trabajo_equipo',
    section: 'Softskills',
    nombre: 'Trabajo en Equipo, Colaboración & Mentoría',
    criterios: {
      inexistente: 'Actitud individualista, reacia a colaborar o compartir conocimiento con sus compañeros.',
      pobre: 'Trabaja en equipo solo si se le asigna explícitamente, prefiere aislarse en sus tareas.',
      bueno: 'Colaborador activo, pide y ofrece ayuda con naturalidad, buena disposición para integrar a nuevos miembros.',
      fuerte: 'Pilar de cohesión en el equipo. Mentoriza a perfiles junior, fomenta un clima de confianza, comparte conocimiento proactivamente y eleva el nivel colectivo.'
    },
    disparadores: [
      '¿Qué haces cuando ves que un compañero del equipo está bloqueado con una tarea y no pide ayuda?',
      '¿Has tenido experiencia mentorizando a compañeros más juniors o traspasando conocimiento?'
    ]
  },
  {
    id: 'ss_resolucion_conflictos',
    section: 'Softskills',
    nombre: 'Resolución de Conflictos & Gestión de Desacuerdos',
    criterios: {
      inexistente: 'Genera fricción o adopta actitudes defensivas/agresivas ante opiniones contrarias.',
      pobre: 'Evita los desacuerdos o cede sin aportar argumentos técnicos por no generar debate.',
      bueno: 'Afronta discrepancias técnicas con respeto, datos objetivos y búsqueda de consenso profesional.',
      fuerte: 'Capacidad de mediación, empatía para entender diferentes perspectivas y orientar discusiones técnicas hacia la mejor decisión para el producto y el equipo.'
    },
    disparadores: [
      'Cuéntanos un desacuerdo técnico que hayas tenido con un compañero o líder de equipo. ¿Cómo se llegó a la solución final?',
      '¿Cómo manejas una crítica constructiva a una solución arquitectónica que tú propusiste?'
    ]
  },
  {
    id: 'ss_presion_resiliencia',
    section: 'Softskills',
    nombre: 'Gestión de la Presión, Cambios & Resiliencia',
    criterios: {
      inexistente: 'Se bloquea o pierde la calma fácilmente ante imprevistos o plazos ajustados.',
      pobre: 'Se estresa visiblemente y su productividad cae ante cambios de prioridades de última hora.',
      bueno: 'Mantiene la serenidad, prioriza con criterio y gestiona situaciones de estrés con profesionalidad.',
      fuerte: 'Firmeza y claridad mental sobresaliente en picos de alta demanda. Transmite calma al equipo y encuentra soluciones pragmáticas ante imprevistos.'
    },
    disparadores: [
      '¿Cómo gestionas una jornada en la que se juntan varias urgencias simultáneas y un despliegue crítico?',
      '¿Qué técnicas utilizas para desconectar y mantener un rendimiento sostenible a largo plazo?'
    ]
  },
  {
    id: 'ss_cultura_mecalux',
    section: 'Softskills',
    nombre: 'Alineación con Valores Mecalux, Compromiso & Proactividad',
    criterios: {
      inexistente: 'Desconoce por completo a Mecalux y muestra desinterés por el sector intralogístico y el puesto.',
      pobre: 'Interés superficial motivado solo por el cambio de empresa sin motivación por el proyecto tecnológico.',
      bueno: 'Se ha informado sobre Mecalux, valora el reto de la ingeniería intralogística y muestra entusiasmo y compromiso.',
      fuerte: 'Identificación total con el impacto de Mecalux a nivel global. Curiosidad genuina por los almacenes automatizados, ambición de crecimiento y visión a largo plazo.'
    },
    disparadores: [
      '¿Qué te motivó a postular a esta posición en Mecalux y qué esperas de nosotros como equipo?',
      '¿Dónde te visualizas profesionalmente en 2 o 3 años dentro de nuestra organización?'
    ]
  }
];

export const EVALUATION_LEVELS: { id: import('../../../types').MecaluxEvaluationLevel; label: string; score: number; color: string; badgeBg: string }[] = [
  { id: 'Inexistente', label: 'Inexistente', score: 0, color: 'text-rose-400', badgeBg: 'bg-rose-500/15 border-rose-500/30' },
  { id: 'Pobre', label: 'Pobre', score: 1, color: 'text-amber-400', badgeBg: 'bg-amber-500/15 border-amber-500/30' },
  { id: 'Bueno', label: 'Bueno', score: 2, color: 'text-blue-400', badgeBg: 'bg-blue-500/15 border-blue-500/30' },
  { id: 'Fuerte', label: 'Fuerte', score: 3, color: 'text-emerald-400', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' }
];

export const INITIAL_CANDIDATE_SAMPLE: import('../../../types').CandidateInterview = {
  id: 'cand_mecalux_demo_1',
  fullName: 'Carlos Ramos Martínez',
  email: 'carlos.ramos@email.com',
  phone: '+34 612 345 678',
  role: 'Software Engineer Backend (.NET / SGA)',
  seniority: 'Senior',
  currentCompany: 'LogisTech Solutions',
  currentSalaryEur: 38000,
  expectedSalaryEur: 44000,
  noticePeriodWeeks: 2,
  englishLevel: 'B2',
  location: 'Gijón / Remoto Híbrido',
  linkedinUrl: 'https://linkedin.com/in/carlos-ramos-demo',
  status: 'evaluated',
  interviewDate: new Date().toISOString().split('T')[0],
  durationMinutes: 55,
  parsedSkills: ['C#', '.NET 8', 'SQL Server', 'Easy WMS', 'Clean Architecture', 'Docker', 'RabbitMQ'],
  evaluations: {
    'cp_intralogistica': {
      competencyId: 'cp_intralogistica',
      section: 'Competencias Profesionales',
      nombre: 'Intralogística & Flujos de Almacén',
      evaluacion: 'Fuerte',
      comentarios: 'Conoce a la perfección los flujos de recepción, picking por olas y expedición en almacenes automatizados.'
    },
    'cp_trato_clientes': {
      competencyId: 'cp_trato_clientes',
      section: 'Competencias Profesionales',
      nombre: 'Experiencia en trato a clientes',
      evaluacion: 'Bueno',
      comentarios: 'Ha liderado puestas en marcha en planta cliente, trato educado y muy resolutivo.'
    },
    'cp_sga_wms': {
      competencyId: 'cp_sga_wms',
      section: 'Competencias Profesionales',
      nombre: 'Software SGA / WMS (Sistemas de Gestión de Almacenes)',
      evaluacion: 'Fuerte',
      comentarios: '3 años de experiencia parametrizando reglas de ubicación y estrategias de reaprovisionamiento.'
    },
    'cp_sql_bbdd': {
      competencyId: 'cp_sql_bbdd',
      section: 'Competencias Profesionales',
      nombre: 'Bases de Datos & SQL de Alto Rendimiento',
      evaluacion: 'Bueno',
      comentarios: 'Buen manejo de índices y planes de ejecución. Ha resuelto deadlocks en transacciones concurrentes.'
    },
    'cp_desarrollo_backend': {
      competencyId: 'cp_desarrollo_backend',
      section: 'Competencias Profesionales',
      nombre: 'Desarrollo Backend & Arquitectura (.NET / C# / Java / APIs)',
      evaluacion: 'Fuerte',
      comentarios: 'Sólidos conocimientos de .NET 8, Clean Architecture y mensajería con RabbitMQ.'
    },
    'fw_buenas_practicas': {
      competencyId: 'fw_buenas_practicas',
      section: 'Framework',
      nombre: 'Buenas Prácticas de Código (Clean Code, SOLID & Patrones)',
      evaluacion: 'Fuerte',
      comentarios: 'Aplica SOLID con naturalidad. Buenas referencias sobre modularidad.'
    },
    'fw_agil_metodologias': {
      competencyId: 'fw_agil_metodologias',
      section: 'Framework',
      nombre: 'Metodologías Ágiles & Gestión de Tareas (Scrum / Kanban / Jira)',
      evaluacion: 'Bueno',
      comentarios: 'Acostumbrado a sprints de 2 semanas y estimaciones en Story Points.'
    },
    'fw_git_cicd': {
      competencyId: 'fw_git_cicd',
      section: 'Framework',
      nombre: 'Control de Versiones & CI/CD (Git Flow, Pipelines, Calidad)',
      evaluacion: 'Bueno',
      comentarios: 'Manejo fluido de GitFlow y pipelines en Azure DevOps.'
    },
    'ss_comunicacion': {
      competencyId: 'ss_comunicacion',
      section: 'Softskills',
      nombre: 'Comunicación, Claridad & Asertividad',
      evaluacion: 'Fuerte',
      comentarios: 'Excelente capacidad de explicación técnica y escucha activa.'
    },
    'ss_trabajo_equipo': {
      competencyId: 'ss_trabajo_equipo',
      section: 'Softskills',
      nombre: 'Trabajo en Equipo, Colaboración & Mentoría',
      evaluacion: 'Fuerte',
      comentarios: 'Ha mentorizado a 2 juniors en su anterior trabajo.'
    },
    'ss_cultura_mecalux': {
      competencyId: 'ss_cultura_mecalux',
      section: 'Softskills',
      nombre: 'Alineación con Valores Mecalux, Compromiso & Proactividad',
      evaluacion: 'Fuerte',
      comentarios: 'Muy motivado por la envergadura de los proyectos de almacenes automáticos de Mecalux.'
    }
  },
  resultadoFinal: {
    decision: 'Aprobado / Contratar',
    puntuacionGlobal: 91,
    puntosFuertes: [
      'Amplia experiencia real en intralogística y software SGA',
      'Excelente nivel en C# .NET y SQL Server',
      'Actitud colaborativa y muy buena comunicación'
    ],
    puntosAMejorar: [
      'Ampliar experiencia en arquitecturas cloud distribuidas avanzadas'
    ],
    conclusionesTeamLeader: 'Candidato sobresaliente con encaje directo para el equipo de desarrollo de Easy WMS. Nivel técnico senior demostrado y excelente actitud.',
    salarioRecomendadoEur: 42000
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
