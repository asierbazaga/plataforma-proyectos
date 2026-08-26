import { MecaluxCompetencyRubric } from '../../../types';

export const MECALUX_RUBRICS: MecaluxCompetencyRubric[] = [
  // ==========================================================================
  // COMPETENCIAS PROFESIONALES (SEGÚN CAPTURAS)
  // ==========================================================================
  {
    id: 'cp_trabajo_equipo',
    section: 'Competencias Profesionales',
    nombre: 'Trabajo en equipo',
    criterios: {
      inexistente: 'Prefiere trabajar solo/a. Muestra dificultad para colaborar con otros. Suele tener conflictos.',
      pobre: 'Acepta trabajar en equipo si es necesario, pero le cuesta adaptarse a los diferentes estilos de trabajo. Participa de forma pasiva y no asume responsabilidades compartidas.',
      bueno: 'Colaboradora activamente con el equipo. Comparte información, se comunica bien y participa en la toma de decisiones. Es confiable dentro del equipo y apoya a los demás.',
      fuerte: 'Promueve un ambiente de colaboración, facilita la comunicación dentro del equipo. Lidera sin imponer.'
    },
    disparadores: [
      '¿Qué opinas sobre el trabajo individual frente al trabajo en equipo? ¿Qué ventajas ofrece cada uno desde tu punto de vista? ¿En qué tipo de entorno te sientes más comodo/a?',
      'Cuéntanos sobre una experiencia anterior trabajando en equipo. ¿Qué papel desempeñaste tu?',
      '¿Has tenido que colaborar/trabajar con personas con las que no tenías una buena relación? ¿Cómo lo manejaste?',
      '¿Recuerdas algún ejemplo de un conflicto dentro de un equipo en el que participaste? ¿Cómo se resolvió? ¿Cuál fue tu papel?'
    ]
  },
  {
    id: 'cp_conocimiento_lenguciones',
    section: 'Competencias Profesionales',
    nombre: 'Conocimiento de lenguajes de programación',
    criterios: {
      inexistente: 'No conoce o no ha usado ninguno',
      pobre: 'Conoce algún lenguaje de su época de estudiante/ vida privada y es capaz de entender códigos simples aunque nunca ha trabajado programando.',
      bueno: 'Ha trabajado previamente con algún lenguaje de programación, conoce y sabe emplear las estructuras básicas. Conoce buenas prácticas y las emplea.',
      fuerte: 'Conoce varios lenguajes de programación y no solo ha trabajado con ellos, va más allá de las buenas prácticas y es capaz de corregir y formar a otros en el empleo del lenguaje.'
    },
    disparadores: [
      '¿Has programado alguna vez? ¿Qué lenguajes de programación conoces? Repreguntar sobre detalles concretos',
      '¿Hacíais revisiones de código? ¿Quién las hacía? ¿Cómo las abordabáis?',
      '¿Puedes ponernos un ejemplo concreto de una mala práctica que tuviste que corregir? ¿Cómo la corregiste? ¿Tuviste éxito?'
    ]
  },
  {
    id: 'cp_conocimiento_bbdd',
    section: 'Competencias Profesionales',
    nombre: 'Conocimiento de BBDD',
    criterios: {
      inexistente: 'No tiene experiencia ni conoce ningún motor de BBDD o conoce alguna pero no ha trabajado con ellas.',
      pobre: 'Ha trabajado previamente con alguna BBDD y entiende conceptos fundamentales como tablas, vistas, esquemas, roles, permisos, etc',
      bueno: 'Conoce sentencias DDL para la creación de la BBDD y sus componentes: tablas, índices, triggers, procedimientos almacenados, etc',
      fuerte: 'Tiene grandes conocimientos de BBDD ya que ha trabajado con varios motores previamente. Conoce la gestión de backups, estructurar una BBDD, diferencia entre modelo de datos relacional y no relacional. Es capaz de proponer mejoras sobre el modelo de datos.'
    },
    disparadores: [
      '¿Has tenido experiencia con bases de datos? ¿Cuáles conoces? Repreguntar sobre detalles concretos',
      '¿Conoces lo que es un esquema? ¿una tabla? ¿diferencia entre modelo relacional y no relacional?',
      '¿Llegaste a crear tablas nuevas, índices? ¿Gestionaste backups?'
    ]
  },
  {
    id: 'cp_lenguajes_consulta',
    section: 'Competencias Profesionales',
    nombre: 'Conocimiento de lenguajes de consulta (SQL, linQ, etc)',
    criterios: {
      inexistente: 'No conoce o no ha usado ninguno',
      pobre: 'Conoce algún lenguaje de su época de estudiante/ vida privada y es capaz de entender consultas simples aunque nunca ha trabajado realizando consultas.',
      bueno: 'Ha trabajado previamente con algún lenguaje de consulta, conoce y sabe emplear las estructuras básicas DML: select, update, insert, delete, truncate, begin, commit y rollback. Sabe emplear y diferenciar los cruces de tablas: inner join, left join, right join, etc. Sabe identificar cuando se ha producido un producto cartesiano por el mal empleo de un join.',
      fuerte: 'Conoce varios lenguajes de consulta y no solo ha trabajado con ellos, va más allá de las buenas prácticas, se enfoca en el rendimiento y es capaz de corregir y formar a otros en el empleo del lenguaje.'
    },
    disparadores: [
      '¿Has tenido experiencia con lenguajes de consulta? ¿Cuáles conoces? Repreguntar sobre detalles concretos',
      '¿Conoces los operadores principales? ¿Podrías mencionar alguno y para que sirve?',
      '¿Cuándo los tuviste que usar para que te hicieron falta? ¿Qué propósito tuvo?'
    ]
  },
  {
    id: 'cp_experiencia_soporte',
    section: 'Competencias Profesionales',
    nombre: 'Experiencia en Soporte',
    criterios: {
      inexistente: 'No ha trabajado previamente en algún soporte técnico a software. Desconoce las metodologías de atención, herramientas de soporte remoto y gestión de incidencias.',
      pobre: 'Ha brindado soporte técnico ocasionalmente pero sin experiencia estructurada. Resuelve problemas muy básicos y requiere de asistencia frecuente.',
      bueno: 'Ha trabajado previamente en soporte técnico. Diagnostica y resuelve incidencias comunes (instalaciones, errores de ejecución, configuraciones). Usa herramientas de soporte remoto y gestión de tickets. Sabe comunicarse con clientes y documenta las soluciones.',
      fuerte: 'Tiene amplia experiencia en soporte técnico. Resuelve problemas complejos (conflictos, revisión de logs, permisos, errores persistentes). Forma a otros técnicos, propone mejoras y detecta patrones de error. Maneja muy bien la presión y la gestión simultánea de varios casos.'
    },
    disparadores: [
      '¿Cuál ha sido tu experiencia trabajando en soporte técnico a software? ¿Qué tipo de usuarios atendías?',
      '¿Qué herramientas de soporte remoto y gestión de tickets has utilizado?',
      'Cuentanos una experiencia donde hayas tenido que abordar un problema muy complejo.',
      '¿Has tenido que trabajar en situaciones bajo presión? Cuéntanos algún ejemplo y como las gestionaste.',
      '¿Cómo verificas que un problema ha quedado completamente resuelto?'
    ]
  },
  {
    id: 'cp_intralogistica_v2',
    section: 'Competencias Profesionales',
    nombre: 'Intralogística',
    criterios: {
      inexistente: 'No tiene experiencia ni conocimiento sobre intralogística',
      pobre: 'Tiene conocimientos muy básicos, solo terminos como albarán y ha visto alguno alguna vez.',
      bueno: 'Tiene expeciencia o conocimientos sobre operativas del almacén como picking, reposiciones, gestion de lotes, entradas, carga de camión, empaquetado.',
      fuerte: 'Conoce todos los flujos internos en un almacén. Tanto de sistemas altamente automátizados como manuales con multiples operativas y operarios.'
    },
    disparadores: [
      '¿Has trabajado en algún almacén? ¿de que tipo?',
      '¿puedes explicar los flujos, interacciones y documentación que se genera?'
    ]
  },
  {
    id: 'cp_trato_clientes_v2',
    section: 'Competencias Profesionales',
    nombre: 'Experiencia en trato a clientes',
    criterios: {
      inexistente: 'No ha tenido contacto directo con clientes. Muestra inseguridad o rechazo al trato con el cliente y no comprende la importancia del mismo.',
      pobre: 'Ha tratado con clientes en situaciones puntuales o no estructuradas. Responde de forma correcta pero con dificultades para mantener emociones, frustraciones o una actitud profesional bajo presión.',
      bueno: 'Tiene experiencia directa atendiendo a clientes. Escucha activamente, comunica con claridad y mantiene actitud positiva ante quejas o dificultades. Transmite confianza.',
      fuerte: 'Amplia experiencia en atención al cliente en entornos exigentes. Gestiona situaciones dificiles con empatía y actitud profesional. Contribuye a mejorar la experiencia del cliente y aporta sugerencias en los procesos. Informa con detalle a los clientes.'
    },
    disparadores: [
      '¿Qué tipo de relación has tenido con los clientes en tus anteriores experiencias?',
      'Cuéntanos una situación difícil con un cliente, ¿qué pasó, como lo resolviste?',
      '¿Cómo afrontas la conversión con un cliente frustrado/enfadado que no puede usar el software?',
      '¿Qué puntos consideras que debe de tener un servicio de atención al cliente para ser ejemplar?'
    ]
  },
  {
    id: 'cp_conocimientos_itil',
    section: 'Competencias Profesionales',
    nombre: 'Conocimientos de ITIL',
    criterios: {
      inexistente: 'No conoce el marco ITIL ni sus conceptos. Nunca ha trabajado en entornos estructurados por procesos de gestión de servicios TI.',
      pobre: 'Ha oido hablar de ITIL. Conoce terminos básicos como "incidencia", "cambio", "SLA", "problema", pero no comprende sus diferencias ni los aplica.',
      bueno: 'Tiene conocimientos sólidos de ITIL y ha trabajado en entornos que usan algunos de sus procesos (incidencias, problemas, cambios...). Aplica principios como "escalados", "priorización" o "documentación".',
      fuerte: 'Tiene formación o certificación ITIL. Aplica activamente los procesos y entiende la idea. Participa en la mejora continua, identifica ineficiencias y propone mejoras. Puede formar o ayudar a otros sobre su aplicación.'
    },
    disparadores: [
      '¿Conoces el concepto ITIL o tienes alguna formación/certificación del mismo? Cuentanos tu experiencia al respecto.',
      '¿Cómo gestionabas las prioridades de los tickets y los SLA?',
      '¿Conoces la diferente entre una incidencia y un problema?',
      '¿Has participado en revisiones post-mortem, informes de causa raíz o procesos de mejora continua?'
    ]
  },
  {
    id: 'cp_configuracion_hardware',
    section: 'Competencias Profesionales',
    nombre: 'Configuración de hardware: servidores, impresoras, terminales RF, etc',
    criterios: {
      inexistente: 'Nunca ha configurado ningún tipo de hardware',
      pobre: 'Ha instalador equipos a nivel personal pero nunca ha trabajado configurando hardware o redes.',
      bueno: 'Comprende conceptos avanzados como virtualización y clustering. Sabe como administrar usuarios y permisos en windows. Ha configurado a nivel profesional hardware o redes.',
      fuerte: 'Tiene experiencia previa dedicando gran parte de su jornada laboral a la configuración y puesta a punto de hardware y redes.'
    },
    disparadores: [
      '¿Te ha tocado configurar hardware alguna vez? ¿Qué tipos de hardware conoces?',
      '¿Sabes que es un servidor y cual es su función principal? ¿Qué sabes sobre almacenamiento en servidores? ¿Tienes experiencia en virtualización y clustering? ¿Cómo administrarías los permisos en un servidor? ¿Conoces alguna arquitectura de alta disponibilidad?',
      '¿Sabrías configurar una impresora en windows? ¿Sabrías solucionar problemas comunes de impresión?',
      '¿Sabrías realizar actualizaciones de firmware en terminales Android? ¿Qué harías para resolver problemas de conectividad?'
    ]
  },
  {
    id: 'cp_documentacion',
    section: 'Competencias Profesionales',
    nombre: 'Documentación y creación de conocimiento compartido',
    criterios: {
      inexistente: 'No ha tenido que documentar nunca nada',
      pobre: 'Sabe documentar de forma clara las interacciones con los clientes y en la resolución de incidencias. Puede explicar conceptos técnicos de manera sencilla y comparte recursos o enlaces relevantes con compañeros',
      bueno: 'Sabe documentar de forma clara las interacciones con los clientes y en la resolución de incidencias. Ha contribuido activamente en los grupos de discusión aportando valor y formando a compañeros.',
      fuerte: 'Es capaz de mejorar los estándares de documentación establecidos. Sabe como documentar casos de uso complejos. Ha liderado iniciativas de formación o mentoría de personal y fomenta una cultura de aprendizaje y colaboración.'
    },
    disparadores: [
      '¿Qué documentos formales has usado en tu experiencia? ¿Existía documentación tipo runbooks de resolución? ¿Has documentado algún proceso complejo, etc?',
      '¿Cuál es el ciclo o proceso de actualización de los runbooks?',
      '¿Qué opinas de esa base documental? ¿Era agil de rellenar, aportaba valor? ¿Puedes poner algún ejemplo de situación donde ha sido clave que existieran dichos documentos? ¿Crees que podrían ser mejorables? ¿Como los mejorarías?',
      '¿Como explicarías conceptos técnicos de manera sencilla a un compañero de trabajo? ¿Has organizado talleres internos para compartir conocimiento? ¿Has usado wikis?'
    ]
  },
  {
    id: 'cp_ingles',
    section: 'Competencias Profesionales',
    nombre: 'Inglés',
    criterios: {
      inexistente: 'No lo habla en absoluto de forma práctica',
      pobre: 'Lo habla con muchas dificultades, trabandose y titubeando. Podría pedir unas indicaciones pero no asistir a una reunión de negocios con soltura.',
      bueno: 'Lo habla con soltura y se hace entender perfectamente, aunque de vez en cuando cometa algún error. Puede manejarse sin problemas en una reunión de negocios. Nivel B2 bien engrasado o superior.',
      fuerte: 'Lo habla perfectamente, con mucha soltura e incluso con dejes idiomaticos. Es igual de elocuente en un idioma que en otro.'
    },
    disparadores: [
      'Tienes que lamar a un cliente y explicarle que es necesario conectarte al servidor y hacer un reinicio del mismo para solucionar la incidencia. ¿Cómo lo harías?'
    ]
  },
  {
    id: 'cp_aleman',
    section: 'Competencias Profesionales',
    nombre: 'Alemán',
    criterios: {
      inexistente: 'No lo habla en absoluto de forma práctica',
      pobre: 'Lo habla con muchas dificultades, trabandose y titubeando. Podría pedir unas indicaciones pero no asistir a una reunión de negocios con soltura.',
      bueno: 'Lo habla con soltura y se hace entender perfectamente, aunque de vez en cuando cometa algún error. Puede manejarse sin problemas en una reunión de negocios. Nivel B2 bien engrasado o superior.',
      fuerte: 'Lo habla perfectamente, con mucha soltura e incluso con dejes idiomaticos. Es igual de elocuente en un idioma que en otro.'
    },
    disparadores: [
      'Tienes que llamar a un cliente y explicarle que es necesario conectarte al servidor y hacer un reinicio del mismo para solucionar la incidencia. ¿Cómo lo harías?'
    ]
  },

// SOFTSKILLS & CULTURA
  // ==========================================================================
  {
    id: 'ss_proactividad',
    section: 'Softskills',
    nombre: 'Proactividad',
    criterios: {
      inexistente: 'No demuestra proactividad alguna, ni en lo que narra de su experiencia pasada ni en la entrevista. No hace preguntas o comentarios que no sean respuestas directas.',
      pobre: 'Cuesta mucho que explique algo motu proprio. Es pasivo durante la entrevista o las preguntas que hace son poco interesantes y dejan claro que lo que hace el puesto en realidad le da igual.',
      bueno: 'Demuestra iniciativa, tanto viendo su experiencia pasada vital y profesional como durante la entrevista. Es una persona curiosa e interesada por crecer profesionalmente.',
      fuerte: 'Es un motor de cambios. En la entrevista es capaz de llevar la conversación y explicar en su experiencia pasada como ha hecho evolucionar situaciones o posiciones. Siempre ha dado pasos firmes en su carrera profesional'
    },
    disparadores: []
  },
  {
    id: 'ss_empowerment',
    section: 'Softskills',
    nombre: 'Empowerment / Transmitir seguridad',
    criterios: {
      inexistente: 'Ultra nervioso, titubea todo el rato, no mira a los ojos, etc.',
      pobre: 'Duda en las respuestas. Cuando repreguntas, cambia sus respuestas o opiniones. No da la impresión de conocer con firmeza de lo que habla',
      bueno: 'Es claro en sus respuestas. Esta tranquilo y ante repreguntas explica con mas detalle y de forma clara.',
      fuerte: 'Esta seguro de sus capacidades y de su trayectoria, y cuando habla da una impresión clara de dominar el tema, sea cierto o no.'
    },
    disparadores: []
  },
  {
    id: 'ss_confianza_transparencia',
    section: 'Softskills',
    nombre: 'Confianza / Transparencia',
    criterios: {
      inexistente: 'Todo lo que cuenta suena falso. En cuanto repreguntas inventa nuevas respuestas. Parece un vendehumos.',
      pobre: 'Duda, no es claro, cuando cuenta cosas no quedan claras y se lia en las repreguntas. Si no sabe de algo intenta disimularlo. Acaba generando dudas de si es veridico lo que indica.',
      bueno: 'Es claro y humilde. Si algo no tiene experiencia o no sabe del tema no lo disfraza. Lo que explica parece veraz.',
      fuerte: 'Es completamente abierto sobre su carrera y expectativas futuras. Tambien sobre sus conocimientos y experiencia: indica claramente cuando no sabe de algo. Ante repreguntas, es firme y da detalles, trasmitiendo confianza en lo que narra.'
    },
    disparadores: []
  },
  {
    id: 'ss_mentalidad_analitica',
    section: 'Softskills',
    nombre: 'Mentalidad analítica',
    criterios: {
      inexistente: 'No parece tener la capacidad para identificar problemas y aportar soluciones. No conecta ideas y conceptos de una manera coherente.',
      pobre: 'Tiene capacidad para reconocer problemas o áreas de mejora. En su experiencia ha sido capaz de realizar análisis básicos para extraer conclusiones. Parece capaz de distinguir lo principal de lo secundario.',
      bueno: 'Ha abordado problemas complejos y ha aportado soluciones concretas. Ha utilizado la información obtenida para tomar decisiones acertadas. Es capaz de proponer ideas innovadoras para resolver problemas.',
      fuerte: 'Ha tomado decisiones basadas en toda la información, apoyadas en análisis de datos y que sirven para el largo plazo. Ha buscado de manera constante la manera de optimizar procesos cuestionando su comportamiento inicial y planteando mejoras más allá de lo establecido. Tiene una influencia positiva en los demás e intenta liderar iniciativas siempre reforzando que han de estar basadas en datos.'
    },
    disparadores: [
      '¿Cual ha sido tu mayor desafío a lo largo de tu carrera? ¿Como llegaste a dar con la solución?',
      '¿Cómo abordarias un problema técnico desconocido? ¿Qué pasos seguirías para analizarlo y encontrar una solución?',
      '¿Cómo evaluarías la eficacia de un proceso o sistema existente? ¿Qué indicadores o métricas considerarías?',
      'Si te enfrentas a un problema muy importante y tuvieras que tomar una decisión ¿Cómo analizarías que opciones tienes y cómo harías una elección?'
    ]
  },
  {
    id: 'ss_adaptacion_cambio',
    section: 'Softskills',
    nombre: 'Adaptación al cambio',
    criterios: {
      inexistente: 'No parece haber tenido que manejar ningun cambio previamente.',
      pobre: 'Muestra una actitud negativa ante los cambios, ha comentado incluso haberse resistido activamente o negado a llevar a cabo alguno.',
      bueno: 'Admite que necesita tiempo para asimilar y adaptarse a los cambios pero, que una vez lo ha hecho, se adapta perfectamente.',
      fuerte: 'Muestra una actitud positiva hacia los cambios. Indica que se adapta rápidamente a nuevas situaciones y desafíos. Busca oportunidades de aprendizaje y crecimiento en momentos de cambio. Acepta y se adapta a las modificaciones sin apenas resistencia.'
    },
    disparadores: []
  },
  {
    id: 'ss_tolerancia_presion',
    section: 'Softskills',
    nombre: 'Tolerancia a la presión',
    criterios: {
      inexistente: 'No parece haber tenido que manejar ninguna situación con presión alta o gestionar altos niveles de extrés.',
      pobre: 'Admite que trabajando bajo presión puede reaccionar negativamente, que le cuesta dificultad abordar las tareas solicitadas e incluso llegar a bloquearse.',
      bueno: 'A pesar de la presión, indica que suele lograr alcanzar los objetivos aunque admite que su rendimiento puede ser ligeramente inferior en esas circunstancias.',
      fuerte: 'Indica haber sido capaz de tomar decisiones correctas en condiciones adversas indicando ejemplos de ello. Indica que puede realizar tareas y mantener la calidad aún en situaciones exigentes.'
    },
    disparadores: []
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
