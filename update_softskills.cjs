const fs = require('fs');
const filepath = 'src/apps/entrevistas/services/mecaluxRubrics.ts';
let code = fs.readFileSync(filepath, 'utf8');

const regex = /\/\/\s*SOFTSKILLS[\s\S]*?\];/i;

const replacementText = `// SOFTSKILLS & CULTURA
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
];`;

let newCode = code.replace(regex, replacementText);
fs.writeFileSync(filepath, newCode);
console.log('Done replacement');
