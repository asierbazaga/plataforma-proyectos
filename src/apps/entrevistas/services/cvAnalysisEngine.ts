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
  // Soporte, Sistemas & Helpdesk
  { name: 'Soporte N1 / Helpdesk', regex: /\b(helpdesk|soporte|service desk|ticketing|jira service|zendesk|remedy|itil|incidencias|guardias)\b/i },
  { name: 'SGA / Easy WMS', regex: /\b(sga|wms|warehouse management|easy wms|sap wm|sap ewm|manhattan|intralog[ií]stica|almac[eé]n)\b/i },
  { name: 'SQL & Bases de Datos', regex: /\b(sql|sql server|tsql|t-sql|oracle|pl\/sql|postgres|mysql|select|join|query|queries)\b/i },
  { name: 'Hardware / Radiofrecuencia', regex: /\b(radiofrecuencia|rf|pistolas|zebra|honeywell|lectores|impresoras t[eé]rmicas|rfid|etiquetadoras)\b/i },
  { name: 'Redes & Comunicaciones', regex: /\b(tcp\/ip|vpn|dns|dhcp|lan|wan|ssh|remote desktop|rdp|anydesk|teamviewer|switches|routers)\b/i },
  { name: 'Sistemas Operativos', regex: /\b(windows server|linux|ubuntu|debian|centos|redhat|active directory|powershell|bash)\b/i },
  
  // Desarrollo & Automatización
  { name: 'C# / .NET', regex: /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i },
  { name: 'Java', regex: /\b(java|spring)\b/i },
  { name: 'Python / Scripting', regex: /\b(python|scripting|bash|powershell|automation)\b/i },
  { name: 'PLC / Industrial', regex: /\b(plc|aut[oó]mata|scada|tia portal|siemens|omron|modbus|opc-ua|wcs|mfc)\b/i },
  { name: 'Web / APIs', regex: /\b(html|css|javascript|typescript|react|angular|api|rest|json|postman)\b/i }
];

const SPANISH_CITIES_PROVINCES = [
  'Gijón', 'Oviedo', 'Avilés', 'Asturias',
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia',
  'Palma de Mallorca', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo',
  'A Coruña', 'La Coruña', 'Vitoria-Gasteiz', 'Vitoria', 'Granada', 'Elche',
  'Santander', 'Pamplona', 'Almería', 'San Sebastián', 'Burgos', 'Albacete',
  'Castellón', 'Logroño', 'Badajoz', 'Salamanca', 'Huelva', 'Lleida', 'Tarragona',
  'León', 'Cádiz', 'Jaén', 'Ourense', 'Girona', 'Lugo', 'Cáceres', 'Toledo',
  'Guadalajara', 'Pontevedra', 'Palencia', 'Ciudad Real', 'Zamora', 'Ávila',
  'Cuenca', 'Huesca', 'Segovia', 'Soria', 'Teruel', 'Cantabria', 'Bizkaia',
  'Álava', 'Guipúzcoa', 'Remoto / Teletrabajo'
];

export function analyzeCvText(rawText: string): ParsedCvResult {
  // Limpieza inicial de saltos y espacios múltiples
  const clean = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // 1. Extraer Email
  const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';

  // 2. Extraer Teléfono
  const phoneMatch = clean.match(/(?:\+34|0034|34)?[ -]?(?:[6789]\d{2})[ -]?\d{3}[ -]?\d{3}/) ||
                     clean.match(/\+?\d{1,4}[ -]?\d{2,4}[ -]?\d{3,4}[ -]?\d{3,4}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // 3. Extraer Residencia / Ubicación
  let location = '';
  // Buscar etiqueta explícita de residencia o dirección
  const explicitLocMatch = clean.match(/(?:residencia|ubicaci[oó]n|direcci[oó]n|localidad|ciudad|domicilio|vive en|reside en|provincia|address|location)[:\s]+([^\n\r,;]{3,45})/i);
  if (explicitLocMatch && explicitLocMatch[1]) {
    const candidateLoc = explicitLocMatch[1].trim();
    if (!candidateLoc.includes('@') && !candidateLoc.match(/^\+?\d/)) {
      location = candidateLoc;
    }
  }

  // Si no se encontró por etiqueta, buscar por catálogo de ciudades/provincias de España o código postal
  if (!location) {
    for (const city of SPANISH_CITIES_PROVINCES) {
      const cityRegex = new RegExp(`\\b${city.replace('-', '\\-')}\\b`, 'i');
      if (cityRegex.test(clean)) {
        location = city;
        break;
      }
    }
  }

  // Buscar código postal + ciudad (ej. 33201 Gijón o 28001 Madrid)
  if (!location) {
    const cpMatch = clean.match(/\b(0[1-9]|[1-4][0-9]|5[0-2])\d{3}\b\s*([A-Za-zÁÉÍÓÚáéíóúñÁÉÍÓÚÑ]+)/);
    if (cpMatch && cpMatch[2]) {
      location = cpMatch[2];
    }
  }

  // 4. Extracción Robusta del Nombre Completo
  let fullName = '';
  
  // A) Búsqueda por etiqueta explícita
  const explicitNameMatch = clean.match(/(?:nombre(?:\s*y\s*apellidos)?|candidato|datos personales)[:\s]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,40})/i);
  if (explicitNameMatch && explicitNameMatch[1]) {
    const testName = explicitNameMatch[1].trim();
    if (testName.length > 3 && !testName.includes('@') && testName.split(/\s+/).length >= 2) {
      fullName = testName;
    }
  }

  // B) Si no hay etiqueta, buscar en las primeras 12 líneas del CV
  if (!fullName) {
    const forbiddenHeaderWords = [
      'curriculum', 'vitae', 'cv', 'resumen', 'perfil', 'contacto', 'datos',
      'experiencia', 'laboral', 'profesional', 'educacion', 'formacion', 'skills',
      'habilidades', 'idiomas', 'proyectos', 'page', 'pagina', 'telefono', 'email',
      'correo', 'ingeniero', 'desarrollador', 'tecnico', 'programador', 'developer'
    ];

    for (let i = 0; i < Math.min(12, lines.length); i++) {
      const line = lines[i].replace(/[|•·,;:\-_/()]/g, ' ').trim();
      const lower = line.toLowerCase();
      
      // Ignorar si contiene email, teléfono o palabras reservadas de sección
      if (line.includes('@') || line.match(/\+?\d{6,}/) || forbiddenHeaderWords.some(w => lower.includes(w))) {
        continue;
      }

      const words = line.split(/\s+/).filter(w => w.length > 1);
      // Un nombre suele tener entre 2 y 4 palabras, sin dígitos y con mayúsculas
      if (words.length >= 2 && words.length <= 4 && !line.match(/\d/)) {
        const isCapitalized = words.every(w => /^[A-ZÁÉÍÓÚÑ]/.test(w) || w.toLowerCase() === 'de' || w.toLowerCase() === 'del' || w.toLowerCase() === 'la');
        if (isCapitalized && line.length >= 5 && line.length <= 45) {
          fullName = line;
          break;
        }
      }
    }
  }

  // C) Si aún no tiene nombre, tomar la primera línea válida no numérica ni email
  if (!fullName && lines.length > 0) {
    for (const l of lines.slice(0, 5)) {
      if (!l.includes('@') && !l.match(/^\+?\d/) && l.length > 3 && l.length < 40) {
        fullName = l;
        break;
      }
    }
  }

  // 5. Extracción de Puesto y Empresa Actual
  let currentPosition = '';
  let currentCompany = '';

  // Buscar etiquetas explícitas
  const explicitPosMatch = clean.match(/(?:puesto|cargo|posici[oó]n|rol|ocupaci[oó]n|actualmente|trabajo actual)[:\s]+([^\n\r,;]{3,50})/i);
  if (explicitPosMatch && explicitPosMatch[1]) {
    currentPosition = explicitPosMatch[1].trim();
  }

  const explicitCompMatch = clean.match(/(?:empresa|compa[ñn][ií]a|cliente|organizaci[oó]n|company)[:\s]+([^\n\r,;]{2,50})/i);
  if (explicitCompMatch && explicitCompMatch[1]) {
    currentCompany = explicitCompMatch[1].trim();
  }

  // Buscar patrones comunes de empleo: "[Puesto] en [Empresa]" o "[Puesto] at [Empresa]"
  if (!currentPosition || !currentCompany) {
    const jobAtMatch = clean.match(/((?:t[eé]cnico|helpdesk|soporte|desarrollador|programador|analista|ingeniero|operador|consultor|administrador|especialista)[^\n\r,;]{0,40})\s+(?:en|at|@)\s+([A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s.,&-]{2,35})/i);
    if (jobAtMatch) {
      if (!currentPosition) currentPosition = jobAtMatch[1].trim();
      if (!currentCompany) currentCompany = jobAtMatch[2].trim();
    }
  }

  // Buscar en la sección de Experiencia Profesional el primer bloque
  if (!currentPosition || !currentCompany) {
    const expIndex = clean.search(/(?:experiencia|historial laboral|trayectoria|work experience)/i);
    if (expIndex !== -1) {
      const expSnippet = clean.slice(expIndex, expIndex + 400);
      const expLines = expSnippet.split('\n').map(l => l.trim()).filter(l => l.length > 2);
      
      // Saltar la línea del encabezado
      for (let j = 1; j < expLines.length; j++) {
        const el = expLines[j];
        if (!currentPosition && /(t[eé]cnico|helpdesk|soporte|desarrollador|programador|ingeniero|operador|consultor|analista|administrador|inform[aá]tico)/i.test(el)) {
          currentPosition = el.replace(/^[-•*#\d.]+\s*/, '').slice(0, 45).trim();
          // La siguiente línea suele ser la empresa o las fechas
          if (expLines[j + 1] && !currentCompany && !expLines[j + 1].match(/\d{4}/)) {
            currentCompany = expLines[j + 1].replace(/^[-•*#]+\s*/, '').slice(0, 35).trim();
          }
          break;
        }
      }
    }
  }

  // Fallback si encontramos palabras clave de puesto
  if (!currentPosition) {
    if (/t[eé]cnico\s*(?:de\s*)?(?:soporte|helpdesk|sistemas|n1|nivel 1|inform[aá]tico)/i.test(clean)) {
      currentPosition = 'Técnico de Soporte / Helpdesk';
    } else if (/desarrollador|programador|developer/i.test(clean)) {
      currentPosition = 'Desarrollador de Software';
    } else if (/operador\s*(?:de\s*)?(?:sistemas|monitorizaci[oó]n|almac[eé]n)/i.test(clean)) {
      currentPosition = 'Operador de Sistemas / Almacén';
    }
  }

  // 6. Detección de Skills y Ecosistema Mecalux
  const detectedSkills: string[] = [];
  TECH_DICTIONARY.forEach(item => {
    if (item.regex.test(clean)) {
      detectedSkills.push(item.name);
    }
  });

  // 7. Experiencia en SGA e Intralogística
  const intralogisticsExperience = /\b(intralog[ií]stica|almac[eé]n|almacenes|wms|sga|easy wms|picking|transelevador|log[ií]stica|stock|inventario)\b/i.test(clean);

  // 8. Estimación de Experiencia y Seniority
  let yearsOfExperienceEstimate = 1;
  const yearMatches = clean.match(/(\d{1,2})\s*(?:\+|m[aá]s\s*de)?\s*(?:a[ñn]os|years|a[ñn]o)\s*(?:de)?\s*(?:experiencia|exp)/i);
  if (yearMatches && yearMatches[1]) {
    yearsOfExperienceEstimate = parseInt(yearMatches[1], 10);
  }

  let estimatedSeniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Tech Lead' | 'Especialista' = 'Junior';
  if (yearsOfExperienceEstimate >= 5 || /\b(senior|sr\.?|responsable|lead)\b/i.test(clean)) {
    estimatedSeniority = 'Senior';
  } else if (yearsOfExperienceEstimate >= 2 || /\b(mid|intermedio)\b/i.test(clean)) {
    estimatedSeniority = 'Mid';
  } else {
    estimatedSeniority = 'Junior';
  }

  // 9. Preguntas Dinámicas adaptadas específicamente para Técnico de Nivel 1 en Mecalux
  const customSuggestedQuestions: { category: string; question: string; reason: string }[] = [];

  customSuggestedQuestions.push({
    category: 'Resolución de Incidencias SGA Nivel 1',
    question: 'Si un operario de almacén te llama diciendo que la pistola de radiofrecuencia no le permite ubicar un palet porque el SGA da un error de stock, ¿cuál es tu secuencia de diagnóstico paso a paso?',
    reason: 'Pregunta clave para Técnico N1 en soporte e implantación Mecalux.'
  });

  customSuggestedQuestions.push({
    category: 'Consultas SQL & Verificación de Datos',
    question: 'En soporte Nivel 1 a veces hay que consultar directamente en la base de datos SQL el estado de un pedido o un bloqueo. ¿Qué soltura tienes ejecutando selects con joins y filtros?',
    reason: 'Comprobar capacidad de triage técnico con base de datos SQL.'
  });

  customSuggestedQuestions.push({
    category: 'Gestión de Clientes Bajo Presión',
    question: 'En un almacén donde los camiones están esperando para cargar y el software tiene una parada, el jefe de almacén está nervioso. ¿Cómo manejas la comunicación para tranquilizarle mientras investigas?',
    reason: 'Evaluación de softskills de atención al cliente y resiliencia en Nivel 1.'
  });

  if (intralogisticsExperience) {
    customSuggestedQuestions.push({
      category: 'Procesos de Almacén',
      question: 'Vemos que conoces la operativa de almacenes. ¿Qué operativas te resultan más familiares (entradas, picking, reposición, expedición) y qué incidencias solías ver?',
      reason: 'El CV menciona experiencia en almacenes o intralogística.'
    });
  }

  if (detectedSkills.includes('Redes & Comunicaciones') || detectedSkills.includes('Hardware / Radiofrecuencia')) {
    customSuggestedQuestions.push({
      category: 'Hardware & Conectividad',
      question: '¿Qué experiencia tienes configurando terminales de radiofrecuencia (pistolas Zebra/Honeywell) o diagnosticando problemas de cobertura WiFi / red en planta?',
      reason: 'El CV destaca experiencia en hardware o redes.'
    });
  }

  const suggestedFocusAreas: string[] = [
    'Actitud de servicio y empatía en atención telefónica y soporte a clientes.',
    'Capacidad de diagnóstico lógico ante bloqueos en el software de almacén.',
    'Manejo de consultas SQL básicas/intermedias para consulta de datos.',
    'Disponibilidad para turnos rotativos o guardias si la posición lo requiere.'
  ];

  return {
    fullName: fullName || 'Candidato Detectado',
    email,
    phone,
    location: location || 'No especificada',
    currentCompany: currentCompany || 'No especificada',
    currentPosition: currentPosition || 'Técnico de Soporte',
    estimatedSeniority,
    detectedSkills,
    intralogisticsExperience,
    yearsOfExperienceEstimate,
    customSuggestedQuestions,
    suggestedFocusAreas
  };
}
