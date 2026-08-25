export interface ParsedCvResult {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentCompany: string;
  currentPosition: string;
  estimatedSeniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Tech Lead' | 'Especialista';
  detectedSkills: string[];
  intralogisticsExperience: boolean;
  yearsOfExperienceEstimate: number;
  customSuggestedQuestions: {
    category: string;
    question: string;
    reason: string;
  }[];
  suggestedFocusAreas: string[];
}

const TECH_DICTIONARY = [
  // Backend & Languages
  { name: 'C#', regex: /\b(c#|csharp|\.net core|\.net\s*[5-9]|\.net\s*framework)\b/i },
  { name: '.NET', regex: /\b(\.net|dotnet|asp\.net|ef core|entity framework)\b/i },
  { name: 'Java', regex: /\b(java|spring boot|spring cloud|hibernate|quarkus)\b/i },
  { name: 'Python', regex: /\b(python|django|fastapi|flask|pandas)\b/i },
  { name: 'TypeScript', regex: /\b(typescript|ts)\b/i },
  { name: 'JavaScript', regex: /\b(javascript|es6|node\.?js)\b/i },
  { name: 'C++', regex: /\b(c\+\+|cpp)\b/i },
  
  // Databases
  { name: 'SQL Server', regex: /\b(sql server|tsql|t-sql|ssms)\b/i },
  { name: 'Oracle', regex: /\b(oracle|pl\/sql|plsql)\b/i },
  { name: 'PostgreSQL', regex: /\b(postgres|postgresql)\b/i },
  { name: 'MySQL', regex: /\b(mysql|mariadb)\b/i },
  { name: 'MongoDB / NoSQL', regex: /\b(mongo|mongodb|redis|cassandra|cosmosdb)\b/i },

  // Architecture & Messaging
  { name: 'Microservicios', regex: /\b(microservicios|microservices|soa)\b/i },
  { name: 'Clean Architecture / DDD', regex: /\b(clean architecture|hexagonal|ddd|domain driven design|cqrs)\b/i },
  { name: 'RabbitMQ / Kafka', regex: /\b(rabbitmq|kafka|event-driven|event driven|colas|service bus)\b/i },
  { name: 'Docker / Kubernetes', regex: /\b(docker|containers|k8s|kubernetes|helm)\b/i },
  { name: 'Azure / AWS Cloud', regex: /\b(azure|aws|cloud|gcp|serverless|lambda)\b/i },

  // Intralogistics & Industrial
  { name: 'SGA / WMS', regex: /\b(sga|wms|warehouse management|easy wms|sap wm|sap ewm|manhattan|intralog[ií]stica)\b/i },
  { name: 'PLC / Industrial', regex: /\b(plc|aut[oó]mata|scada|tia portal|siemens|omron|beckhoff|modbus|opc-ua|wcs|mfc)\b/i },
  { name: 'Picking / RF / Hardware', regex: /\b(picking|radiofrecuencia|rfid|pick-to-light|transelevador|conveyor|transportador)\b/i },

  // Frontend
  { name: 'React', regex: /\b(react|next\.?js|redux|tailwind)\b/i },
  { name: 'Angular', regex: /\b(angular|rxjs|ngrx)\b/i },
  { name: 'Vue', regex: /\b(vue|vuex|pinia|nuxt)\b/i },

  // Methodologies & Quality
  { name: 'Scrum / Agile', regex: /\b(scrum|agile|kanban|jira|sprint)\b/i },
  { name: 'CI/CD / DevOps', regex: /\b(ci\/cd|github actions|azure devops|jenkins|pipelines)\b/i },
  { name: 'Unit Testing / QA', regex: /\b(unit testing|nunit|xunit|junit|jest|cypress|selenium|tdd|sonar)\b/i }
];

export function analyzeCvText(text: string): ParsedCvResult {
  const clean = text.trim();

  // 1. Extraer Email
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extraer Teléfono
  const phoneMatch = clean.match(/(?:\+34|0034|34)?[ -]?(?:[6789]\d{2})[ -]?\d{3}[ -]?\d{3}/) ||
                     clean.match(/\+?\d{1,4}[ -]?\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // 3. Extraer Nombre (Primera línea o tras patrones típicos)
  let fullName = '';
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const firstLine = lines[0].replace(/^(curriculum|cv|hoja de vida)[:\s-]*/i, '');
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.match(/^\+?\d/)) {
      fullName = firstLine;
    }
  }

  // 4. Extraer Ubicación aproximada
  let location = '';
  const locationMatches = clean.match(/(madrid|barcelona|valencia|gij[oó]n|oviedo|sevilla|bilbao|zaragoza|m[aá]laga|alicante|santander|vigo|coru[ñn]a|valladolid|remoto)/i);
  if (locationMatches) {
    location = locationMatches[0].charAt(0).toUpperCase() + locationMatches[0].slice(1).toLowerCase();
  }

  // 5. Detectar Skills
  const detectedSkills: string[] = [];
  TECH_DICTIONARY.forEach(item => {
    if (item.regex.test(clean)) {
      detectedSkills.push(item.name);
    }
  });

  // 6. Detección de experiencia en Intralogística / Almacenes
  const intralogisticsRegex = /\b(intralog[ií]stica|almac[eé]n|almacenes|wms|sga|easy wms|picking|transelevador|log[ií]stica|stock|inventario)\b/i;
  const intralogisticsExperience = intralogisticsRegex.test(clean);

  // 7. Estimación de Años de Experiencia y Seniority
  let yearsOfExperienceEstimate = 2;
  const yearMatches = clean.match(/(\d{1,2})\s*(?:\+|m[aá]s\s*de)?\s*(?:a[ñn]os|years|a[ñn]o)\s*(?:de)?\s*(?:experiencia|exp)/i);
  if (yearMatches && yearMatches[1]) {
    yearsOfExperienceEstimate = parseInt(yearMatches[1], 10);
  } else {
    // Contar años tipo 2018-2022, etc.
    const yearRangeMatches = clean.match(/\b(20[0-2]\d)\b/g);
    if (yearRangeMatches && yearRangeMatches.length >= 2) {
      const numericYears = yearRangeMatches.map(Number).filter(y => y >= 2000 && y <= 2026);
      if (numericYears.length >= 2) {
        const minYear = Math.min(...numericYears);
        const maxYear = Math.max(...numericYears);
        yearsOfExperienceEstimate = Math.max(1, maxYear - minYear);
      }
    }
  }

  let estimatedSeniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Tech Lead' | 'Especialista' = 'Mid';
  if (/\b(tech lead|team lead|lead engineer|arquitecto|architect)\b/i.test(clean) || yearsOfExperienceEstimate >= 8) {
    estimatedSeniority = 'Lead';
  } else if (/\b(senior|sr\.?)\b/i.test(clean) || yearsOfExperienceEstimate >= 4) {
    estimatedSeniority = 'Senior';
  } else if (yearsOfExperienceEstimate <= 2 && /\b(junior|jr\.?|trainee|pr[aá]cticas)\b/i.test(clean)) {
    estimatedSeniority = 'Junior';
  }

  // 8. Generación Inteligente de Preguntas Dinámicas adaptadas al CV
  const customSuggestedQuestions: { category: string; question: string; reason: string }[] = [];

  if (detectedSkills.includes('C#') || detectedSkills.includes('.NET')) {
    customSuggestedQuestions.push({
      category: 'Backend .NET',
      question: 'En tu experiencia con .NET/C#, ¿cómo gestionas el ciclo de vida de dependencias (Scoped vs Transient vs Singleton) y la prevención de memory leaks en procesos en background?',
      reason: 'El CV menciona C# / .NET como lenguaje principal.'
    });
  }

  if (detectedSkills.includes('SQL Server') || detectedSkills.includes('Oracle') || detectedSkills.includes('PostgreSQL')) {
    customSuggestedQuestions.push({
      category: 'Bases de Datos & Concurrencia',
      question: 'Mencionas bases de datos relacionales. En un almacén con cientos de lecturas/escrituras concurrentes, ¿cómo diseñarías las transacciones para evitar interbloqueos (deadlocks)?',
      reason: 'Experiencia detectada en motores de base de datos relacional.'
    });
  }

  if (intralogisticsExperience) {
    customSuggestedQuestions.push({
      category: 'Intralogística & SGA',
      question: 'Vemos que has participado en entornos logísticos o SGA. ¿Qué casuísticas de control de stock y preparación de pedidos (picking/packing) has implementado?',
      reason: 'Experiencia previa detectada en el sector logístico / almacenes.'
    });
  } else {
    customSuggestedQuestions.push({
      category: 'Adaptación a Intralogística Mecalux',
      question: 'En Mecalux el software controla almacenes automatizados y operaciones críticas en tiempo real. ¿Cómo afrontas el reto de aprender un dominio de negocio tan específico como la intralogística?',
      reason: 'No se detecta experiencia previa específica en intralogística/SGA.'
    });
  }

  if (detectedSkills.includes('RabbitMQ / Kafka') || detectedSkills.includes('Microservicios')) {
    customSuggestedQuestions.push({
      category: 'Arquitectura Distribuida',
      question: 'Has trabajado con arquitectura de eventos y mensajería. ¿Cómo garantizas la idempotencia y el orden de procesamiento de mensajes si la red sufre reintentos?',
      reason: 'El perfil destaca tecnologías de mensajería / microservicios.'
    });
  }

  if (estimatedSeniority === 'Senior' || estimatedSeniority === 'Lead') {
    customSuggestedQuestions.push({
      category: 'Liderazgo & Team Leader',
      question: 'Como perfil Senior/Lead, ¿cómo equilibras la resolución de problemas técnicos complejos con la mentoría y apoyo diario a los miembros más noveles del equipo?',
      reason: 'Perfil senior detectado; evaluar potencial de liderazgo y colaboración.'
    });
  }

  const suggestedFocusAreas: string[] = [];
  if (intralogisticsExperience) suggestedFocusAreas.push('Profundizar en su conocimiento funcional de almacenes.');
  if (detectedSkills.includes('SQL Server')) suggestedFocusAreas.push('Comprobar soltura en optimización de consultas SQL y planes de ejecución.');
  if (detectedSkills.length > 5) suggestedFocusAreas.push('Validar si el conocimiento en el amplio stack tecnológico es profundo o superficial.');
  suggestedFocusAreas.push('Evaluar actitud ante situaciones de presión y comunicación con el Team Leader.');

  return {
    fullName: fullName || 'Candidato Detectado',
    email,
    phone,
    location,
    currentCompany: '',
    currentPosition: '',
    estimatedSeniority,
    detectedSkills,
    intralogisticsExperience,
    yearsOfExperienceEstimate,
    customSuggestedQuestions,
    suggestedFocusAreas
  };
}
