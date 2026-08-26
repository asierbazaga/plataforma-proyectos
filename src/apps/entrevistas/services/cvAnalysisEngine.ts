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
  englishLevel?: 'A2' | 'B1' | 'B2' | 'C1' | 'C2 / Nativo';
  noticePeriodWeeks?: number;
  suggestedRole?: string;
  currentSalaryEur?: number;
  expectedSalaryEur?: number;
  customSuggestedQuestions: {
    category: string;
    question: string;
    reason: string;
  }[];
  suggestedFocusAreas: string[];
}

const TECH_DICTIONARY = [
  // Soporte, Sistemas & Helpdesk
  { name: 'Soporte N1 / Helpdesk', regex: /\b(helpdesk|soporte\s*t[eé]cnico|soporte|service\s*desk|ticketing|jira\s*service|zendesk|remedy|itil|incidencias|guardias|triage|atenci[oó]n\s*a\s*usuarios|tecnico\s*n1|t[eé]cnico\s*n1|tecnico\s*n2|t[eé]cnico\s*n2)\b/i },
  { name: 'SGA / Easy WMS', regex: /\b(sga|wms|warehouse\s*management|easy\s*wms|sap\s*wm|sap\s*ewm|manhattan|intralog[ií]stica|almac[eé]n|almacenes|picking|packing|stock|transelevador)\b/i },
  { name: 'SQL & Bases de Datos', regex: /\b(sql|sql\s*server|tsql|t-sql|oracle|pl\/sql|postgres|postgresql|mysql|sqlite|mariadb|select|join|consultas\s*sql)\b/i },
  { name: 'Hardware / Radiofrecuencia', regex: /\b(radiofrecuencia|rf|pistolas|zebra|honeywell|datalogic|lectores|impresoras\s*t[eé]rmicas|rfid|etiquetadoras|handheld|montaje\s*hardware)\b/i },
  { name: 'Redes & Comunicaciones', regex: /\b(tcp\/ip|vpn|dns|dhcp|lan|wan|ssh|remote\s*desktop|rdp|anydesk|teamviewer|switches|routers|firewall|wifi|redes|redes\s*informaticas)\b/i },
  { name: 'Sistemas Operativos', regex: /\b(windows\s*server|linux|ubuntu|debian|centos|redhat|active\s*directory|powershell|bash|cmd|virtualizaci[oó]n|vmware|hyper-v|sistemas\s*linux)\b/i },
  
  // Desarrollo & Automatización
  { name: 'C# / .NET', regex: /\b(c#|csharp|\.net|dotnet|asp\.net|entity\s*framework|linq|wpf|wcf)\b/i },
  { name: 'Java', regex: /\b(java|spring|spring\s*boot|hibernate|maven|gradle)\b/i },
  { name: 'Python / Scripting', regex: /\b(python|django|fastapi|flask|pandas|scripting|automation)\b/i },
  { name: 'PLC / Industrial', regex: /\b(plc|aut[oó]mata|scada|tia\s*portal|siemens|s7-1200|s7-1500|omron|beckhoff|modbus|opc-ua|wcs|mfc|rob[oó]tica)\b/i },
  { name: 'Web / APIs', regex: /\b(html5?|css3?|javascript|typescript|react|angular|vue|node\.?js|api|rest|json|postman|swagger|wordpress)\b/i },
  { name: 'DevOps & Cloud', regex: /\b(docker|kubernetes|azure|aws|gcp|ci\/cd|jenkins|git|github|gitlab|terraform)\b/i },
  { name: 'QA & Testing', regex: /\b(qa|testing|selenium|cypress|jest|junit|pruebas\s*unitarias|postman\s*tests)\b/i }
];

const SPANISH_PROVINCES_AND_CITIES = [
  // Asturias
  'Gijón', 'Oviedo', 'Avilés', 'Corvera', 'Corvera de Asturias', 'Castrillón', 'Piedras Blancas', 'Langreo', 'Mieres', 'Siero', 'Llanera', 'Llanes', 'Villaviciosa', 'Ribadesella', 'Cangas del Narcea', 'Cangas de Onís', 'Pravia', 'Grado', 'Grao', 'Candás', 'Carreño', 'Luanco', 'Gozón', 'Noreña', 'Laviana', 'Asturias',
  // Madrid
  'Madrid', 'Alcalá de Henares', 'Getafe', 'Leganés', 'Fuenlabrada', 'Alcorcón', 'Móstoles', 'Las Rozas', 'Pozuelo de Alarcón', 'Alcobendas', 'San Sebastián de los Reyes', 'Torrejón de Ardoz', 'Rivas-Vaciamadrid',
  // Barcelona & Cataluña
  'Barcelona', 'L\'Hospitalet', 'Hospitalet de Llobregat', 'Badalona', 'Terrassa', 'Tarrasa', 'Sabadell', 'Mataró', 'Santa Coloma de Gramenet', 'Cornellà', 'Sant Cugat del Vallès', 'Girona', 'Gerona', 'Tarragona', 'Lleida', 'Lérida', 'Cataluña',
  // Valencia & C. Valenciana
  'Valencia', 'Alicante', 'Alacant', 'Elche', 'Elx', 'Castellón', 'Castelló', 'Torrevieja', 'Gandia', 'Comunidad Valenciana',
  // Andalucía
  'Sevilla', 'Málaga', 'Marbella', 'Córdoba', 'Granada', 'Jerez de la Frontera', 'Almería', 'Huelva', 'Cádiz', 'Algeciras', 'San Fernando', 'Jaén', 'Dos Hermanas', 'Roquetas de Mar', 'Andalucía',
  // País Vasco & Navarra
  'Bilbao', 'Bizkaia', 'Vizcaya', 'Donostia', 'San Sebastián', 'Gipuzkoa', 'Guipúzcoa', 'Vitoria-Gasteiz', 'Vitoria', 'Álava', 'Araba', 'País Vasco', 'Pamplona', 'Iruña', 'Navarra',
  // Galicia
  'Vigo', 'A Coruña', 'La Coruña', 'Santiago de Compostela', 'Ourense', 'Orense', 'Lugo', 'Pontevedra', 'Ferrol', 'Galicia',
  // Castilla y León & La Rioja
  'Valladolid', 'Burgos', 'Salamanca', 'León', 'Palencia', 'Ponferrada', 'Zamora', 'Ávila', 'Segovia', 'Soria', 'Castilla y León', 'Logroño', 'La Rioja',
  // Castilla-La Mancha & Extremadura
  'Toledo', 'Albacete', 'Ciudad Real', 'Guadalajara', 'Cuenca', 'Talavera de la Reina', 'Castilla-La Mancha', 'Badajoz', 'Cáceres', 'Mérida', 'Extremadura',
  // Aragón & Murcia
  'Zaragoza', 'Huesca', 'Teruel', 'Aragón', 'Murcia', 'Cartagena', 'Lorca',
  // Islas & Otras
  'Palma de Mallorca', 'Palma', 'Mallorca', 'Ibiza', 'Menorca', 'Baleares', 'Las Palmas de Gran Canaria', 'Las Palmas', 'Santa Cruz de Tenerife', 'Tenerife', 'Canarias', 'Santander', 'Cantabria', 'Torrelavega', 'Ceuta', 'Melilla', 'Remoto / Teletrabajo'
];

const COMMON_FIRST_NAMES = [
  'Pelayo', 'Carlos', 'Juan', 'David', 'Alejandro', 'Javier', 'Manuel', 'Daniel', 'Pablo', 'Sergio',
  'Álvaro', 'Alvaro', 'Hugo', 'Adrián', 'Adrian', 'Marcos', 'Lucas', 'Mateo', 'Mario', 'Diego',
  'Iker', 'Rodrigo', 'Gonzalo', 'Rubén', 'Ruben', 'Iván', 'Ivan', 'Jorge', 'Alberto', 'Miguel',
  'Antonio', 'José', 'Jose', 'Francisco', 'Guillermo', 'Enrique', 'Víctor', 'Victor', 'Ignacio', 'Raúl',
  'Raul', 'Borja', 'Aitor', 'Unai', 'Asier', 'Nicolás', 'Nicolas', 'Gabriel', 'Samuel', 'Óscar', 'Oscar',
  'María', 'Maria', 'Lucía', 'Lucia', 'Paula', 'Sara', 'Laura', 'Alba', 'Claudia', 'Marta',
  'Irene', 'Sofía', 'Sofia', 'Andrea', 'Carmen', 'Elena', 'Ana', 'Cristina', 'Patricia', 'Nuria',
  'Beatriz', 'Raquel', 'Silvia', 'Teresa', 'Covadonga', 'Ainara', 'Uxue', 'Nerea', 'Leire', 'Clara'
];

export function analyzeCvText(rawText: string, fileNameHint?: string): ParsedCvResult {
  if (!rawText) rawText = '';
  
  // Limpieza inicial de saltos, iconos especiales y espacios
  const clean = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[\uF000-\uFFFF]/g, ' ')
    .trim();

  const lines = clean
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  // ==========================================
  // 1. EXTRAER EMAIL
  // ==========================================
  let email = '';
  const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/;
  const emailMatch = clean.match(emailRegex);
  if (emailMatch) {
    email = emailMatch[0].trim().toLowerCase();
  }

  // ==========================================
  // 2. EXTRAER TELÉFONO
  // ==========================================
  let phone = '';
  const phoneLabelMatch = clean.match(/(?:tel[eé]fono|m[oó]vil|tlf|tfno|celular|phone|contact(?:o)?)[:\s]*(\+?(?:\(?34\)?)?[\s.-]?[6789]\d(?:[\s.-]?\d){7})/i);
  if (phoneLabelMatch && phoneLabelMatch[1]) {
    phone = phoneLabelMatch[1].trim();
  }

  if (!phone) {
    const rawPhoneMatch = clean.match(/(?:\+34|0034|\(34\)|\(\+34\))?[ -]?[6789]\d{2}[ -]?\d{3}[ -]?\d{3}/) ||
                          clean.match(/(?:\+34|0034|\(34\)|\(\+34\))?[ -]?[6789]\d{8}/);
    if (rawPhoneMatch) {
      phone = rawPhoneMatch[0].trim();
    }
  }

  if (phone) {
    phone = phone.replace(/[^\d+ ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // ==========================================
  // 3. EXTRAER RESIDENCIA / UBICACIÓN
  // ==========================================
  let location = '';

  // A) Priorizar zona de CONTACTO / DOMICILIO / RESIDENCIA
  const contactoSnippetMatch = clean.match(/CONTACTO[\s\S]{0,180}?(?:domicilio|\n\n|$)/i) ||
                               clean.match(/DOMICILIO[\s\S]{0,120}/i) ||
                               clean.match(/RESIDENCIA[\s\S]{0,120}/i);
  const contactArea = contactoSnippetMatch ? contactoSnippetMatch[0] : clean;

  const cpMatch = contactArea.match(/\b(0[1-9]|[1-4][0-9]|5[0-2])\d{3}\b\s*,?\s*([A-Za-zÁÉÍÓÚáéíóúñÁÉÍÓÚÑ\s]+?)(?:,?\s*Espa[ñn]a|\n|\(|\)|$)/i);
  if (cpMatch && cpMatch[2] && cpMatch[2].trim().length > 2 && !cpMatch[2].toLowerCase().includes('cervantes')) {
    location = cpMatch[2].trim();
  }

  // B) Buscar etiqueta explícita de residencia o domicilio
  if (!location) {
    const explicitLocMatch = clean.match(/(?:residencia|ubicaci[oó]n|localidad|poblaci[oó]n|ciudad|provincia|domicilio|lugar de residencia|vive en|reside en)[:\s]+([^\n\r,;]{3,50})/i);
    if (explicitLocMatch && explicitLocMatch[1]) {
      const candidateLoc = explicitLocMatch[1].trim().replace(/^[-•*#:]+\s*/, '');
      if (!candidateLoc.includes('@') && !candidateLoc.match(/^\+?\d{5,}/) && candidateLoc.length > 2 && !candidateLoc.toLowerCase().includes('cervantes')) {
        location = candidateLoc;
      }
    }
  }

  // C) Buscar en catálogo de ciudades/provincias de España
  if (!location) {
    for (const city of SPANISH_PROVINCES_AND_CITIES) {
      const cityRegex = new RegExp(`\\b${city.replace('-', '\\-')}\\b`, 'i');
      if (cityRegex.test(clean)) {
        location = city;
        break;
      }
    }
  }

  // ==========================================
  // 4. EXTRAER NOMBRE COMPLETO (SISTEMA MULTI-CAPA)
  // ==========================================
  let fullName = '';

  const forbiddenHeaderWords = [
    'curriculum', 'vitae', 'cv', 'resumen', 'perfil', 'contacto', 'datos', 'personales',
    'experiencia', 'laboral', 'profesional', 'educacion', 'educación', 'formacion', 'formación',
    'skills', 'habilidades', 'competencias', 'idiomas', 'proyectos', 'page', 'pagina', 'página',
    'telefono', 'teléfono', 'email', 'correo', 'ingeniero', 'desarrollador', 'tecnico', 'técnico',
    'programador', 'developer', 'consultor', 'helpdesk', 'soporte', 'certificaciones', 'sobre mi', 'sobre mí',
    'nacionalidad', 'fecha de nacimiento', 'domicilio', 'competencias digitales'
  ];

  // A) Formato InfoJobs / Portales / Etiquetas explícitas
  const explicitNameMatch = clean.match(/(?:curr[ií]culum\s+de|cv\s+de|nombre(?:\s*y\s*apellidos)?|candidato(?:\/a)?|datos\s+personales|nombre\s+completo)[:\s]+([A-ZÁÉÍÓÚÑa-záéíóúñ\s]{3,45})/i);
  if (explicitNameMatch && explicitNameMatch[1]) {
    const cand = explicitNameMatch[1].trim().replace(/^[-•*#:]+\s*/, '');
    if (cand.split(/\s+/).length >= 2 && cand.length <= 40) {
      fullName = cand;
    }
  }

  // B) Búsqueda por catálogo de nombres de pila comunes españoles (ej. Pelayo García García)
  if (!fullName) {
    for (const firstName of COMMON_FIRST_NAMES) {
      const namePattern = new RegExp(`\\b(${firstName}\\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)\\b`);
      const match = clean.match(namePattern);
      if (match && match[1]) {
        const found = match[1].trim();
        if (found.length >= 5 && !forbiddenHeaderWords.some(w => found.toLowerCase().includes(w))) {
          fullName = found;
          break;
        }
      }
    }
  }

  // C) Si tenemos un nombre de archivo (ej. Pelayo.cv-5.pdf o CV_Pelayo_Garcia.pdf) o email (pelayovrs7@gmail.com):
  if (!fullName) {
    const hints: string[] = [];
    if (fileNameHint) {
      const base = fileNameHint
        .replace(/\.pdf$/i, '')
        .replace(/[._-](?:cv|curriculum|\d+)/gi, ' ')
        .replace(/[^A-Za-zÁÉÍÓÚáéíóúñÁÉÍÓÚÑ\s]/g, ' ')
        .trim();
      hints.push(...base.split(/\s+/).filter(w => w.length >= 3));
    }
    if (email) {
      const emailUser = email.split('@')[0];
      const emailParts = emailUser.split(/[._-]/).filter(p => p.length >= 3 && !/^\d+$/.test(p));
      hints.push(...emailParts);
    }

    for (const hint of hints) {
      const hintRegex = new RegExp(`\\b(${hint}[A-Za-zÁÉÍÓÚáéíóúñÁÉÍÓÚÑ\\s]{2,40})`, 'i');
      const match = clean.match(hintRegex);
      if (match && match[1]) {
        let candidateText = match[1].split('\n')[0].trim();
        candidateText = candidateText.replace(/\s+(?:t[eé]cnico|desarrollador|ingeniero|programador|administrador|fecha|nacionalidad|contacto|experiencia|educaci[oó]n|domicilio|email|tel[eé]fono|tel|tlf|para|de|en|del).*/i, '').trim();
        const words = candidateText.split(/\s+/).filter(w => w.length > 1);
        if (words.length >= 2 && words.length <= 4) {
          fullName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
          break;
        } else if (words.length === 1 && !fullName) {
          fullName = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        }
      }
    }
  }

  // D) Escaneo de las primeras líneas del documento
  if (!fullName && lines.length > 0) {
    for (let i = 0; i < Math.min(15, lines.length); i++) {
      let line = lines[i].replace(/[|•·,;:\-_/()]/g, ' ').replace(/\s+/g, ' ').trim();
      const lower = line.toLowerCase();

      if (line.includes('@') || line.match(/\+?\d{6,}/) || line.includes('http') || line.includes('www.') || line.includes('linkedin.com')) {
        continue;
      }

      if (forbiddenHeaderWords.some(w => lower === w || lower.startsWith(w + ' ') || lower.endsWith(' ' + w))) {
        continue;
      }

      const words = line.split(/\s+/).filter(w => w.length > 1);
      if (words.length >= 2 && words.length <= 4 && !line.match(/\d/)) {
        const isNameLike = words.every(w => 
          /^[A-ZÁÉÍÓÚÑ]/.test(w) || 
          ['de', 'del', 'la', 'las', 'los', 'san', 'santa', 'y', 'von', 'van', 'da', 'di'].includes(w.toLowerCase())
        );

        if (isNameLike && line.length >= 5 && line.length <= 45) {
          fullName = line;
          break;
        }
      }
    }
  }

  // E) Fallback final al nombre de archivo
  if (!fullName && fileNameHint) {
    const base = fileNameHint
      .replace(/\.pdf$/i, '')
      .replace(/[._-](?:cv|curriculum|\d+)/gi, ' ')
      .replace(/[^A-Za-zÁÉÍÓÚáéíóúñÁÉÍÓÚÑ\s]/g, ' ')
      .trim();
    if (base.length >= 3) {
      fullName = base.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  // ==========================================
  // 5. EXTRAER PUESTO Y EMPRESA ACTUAL / RECIENTE
  // ==========================================
  let currentPosition = '';
  let currentCompany = '';

  // A) Detectar empresas conocidas en experiencia profesional (Capgemini, Indra, Telefónica, DXC, Mecalux, Accenture, etc.)
  const knownCompanies = ['Capgemini', 'Indra', 'Telefónica', 'DXC Technology', 'Mecalux', 'Accenture', 'NTT Data', 'Inetum', 'Alten', 'Babel', 'Izertis', 'Satec', 'Oesia', 'Autoridad Portuaria'];
  for (const comp of knownCompanies) {
    if (new RegExp(`\\b${comp}\\b`, 'i').test(clean)) {
      currentCompany = comp;
      break;
    }
  }

  // B) Puesto actual
  if (/tecnico\s*n2|t[eé]cnico\s*n2/i.test(clean)) {
    currentPosition = 'Técnico N2 de Soporte';
  } else if (/tecnico\s*(?:inform[aá]tico\s*)?n1|t[eé]cnico\s*(?:inform[aá]tico\s*)?n1/i.test(clean)) {
    currentPosition = 'Técnico informático N1';
  } else if (/administrador\s+de\s+sistemas/i.test(clean) && !currentPosition) {
    currentPosition = 'Administrador de Sistemas';
  }

  // C) Etiquetas explícitas
  if (!currentPosition) {
    const explicitPosMatch = clean.match(/(?:puesto|cargo|posici[oó]n|rol|ocupaci[oó]n|actualmente|trabajo\s+actual)[:\s]+([^\n\r,;]{3,50})/i);
    if (explicitPosMatch && explicitPosMatch[1]) {
      currentPosition = explicitPosMatch[1].trim().replace(/^[-•*#:]+\s*/, '');
    }
  }

  if (!currentCompany) {
    const explicitCompMatch = clean.match(/(?:empresa|compa[ñn][ií]a|cliente|organizaci[oó]n|company)[:\s]+([^\n\r,;]{2,50})/i);
    if (explicitCompMatch && explicitCompMatch[1]) {
      currentCompany = explicitCompMatch[1].trim().replace(/^[-•*#:]+\s*/, '');
    }
  }

  // D) Patrones como "Técnico N2 para negocio telefónica Capgemini"
  if (!currentPosition || !currentCompany) {
    const jobCompanyPattern = /((?:t[eé]cnico|helpdesk|soporte|desarrollador|programador|analista|ingeniero|operador|consultor|administrador|especialista)[^\n\r]{0,45})\s+(?:en|at|para\s+negocio[^\n\r]{0,25})\s+([A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s.,&-]{2,30})/i;
    const jobCompMatch = clean.match(jobCompanyPattern);
    if (jobCompMatch) {
      if (!currentPosition) currentPosition = jobCompMatch[1].trim().replace(/^[-•*#\d.]+\s*/, '');
      if (!currentCompany) currentCompany = jobCompMatch[2].trim();
    }
  }

  if (!currentPosition) {
    currentPosition = 'Técnico de Soporte';
  }

  // ==========================================
  // 6. DETECCIÓN DE SKILLS TÉCNICAS
  // ==========================================
  const detectedSkills: string[] = [];
  TECH_DICTIONARY.forEach(item => {
    if (item.regex.test(clean)) {
      detectedSkills.push(item.name);
    }
  });

  // ==========================================
  // 7. INTRALOGÍSTICA Y SGA
  // ==========================================
  const intralogisticsExperience = /\b(intralog[ií]stica|almac[eé]n|almacenes|wms|sga|easy\s*wms|picking|packing|transelevador|log[ií]stica|stock|inventario|radiofrecuencia|rfid)\b/i.test(clean);

  // ==========================================
  // 8. ESTIMACIÓN DE AÑOS DE EXPERIENCIA Y SENIORITY
  // ==========================================
  let yearsOfExperienceEstimate = 1;
  const currentYear = new Date().getFullYear();

  const yearMatches = clean.match(/(\d{1,2})\s*(?:\+|m[aá]s\s*de)?\s*(?:a[ñn]os|years|a[ñn]o)\s*(?:de)?\s*(?:experiencia|exp)/i);
  if (yearMatches && yearMatches[1]) {
    yearsOfExperienceEstimate = parseInt(yearMatches[1], 10);
  } else {
    const dateRangeRegex = /\b(?:(?:\d{1,2}\/)?(20\d{2}|19\d{2}))\s*(?:-|–|a|to|hasta)\s*(?:(?:\d{1,2}\/)?(20\d{2})|actualidad|presente|present|actual|hoy)\b/gi;
    let match: RegExpExecArray | null;
    let minYear = currentYear;
    let foundDates = false;

    while ((match = dateRangeRegex.exec(clean)) !== null) {
      foundDates = true;
      const startYear = parseInt(match[1], 10);
      if (startYear < minYear && startYear >= 1990 && startYear <= currentYear) {
        minYear = startYear;
      }
    }

    if (foundDates && minYear < currentYear) {
      yearsOfExperienceEstimate = Math.max(1, currentYear - minYear);
    }
  }

  let estimatedSeniority: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Tech Lead' | 'Especialista' = 'Junior';
  if (yearsOfExperienceEstimate >= 6 || /\b(senior|sr\.?|responsable|lead|team\s*lead|arquitecto)\b/i.test(clean)) {
    estimatedSeniority = 'Senior';
  } else if (yearsOfExperienceEstimate >= 2 || /\b(mid|intermedio|n2|nivel\s*2)\b/i.test(clean)) {
    estimatedSeniority = 'Mid';
  } else {
    estimatedSeniority = 'Junior';
  }

  // ==========================================
  // 9. NIVEL DE INGLÉS DETECTADO
  // ==========================================
  let englishLevel: 'A2' | 'B1' | 'B2' | 'C1' | 'C2 / Nativo' = 'B2';
  if (/ingl[eé]s[\s\S]{0,30}\b(?:c2|nativo|biling[uü]e|native|proficiency|cpe)\b/i.test(clean)) {
    englishLevel = 'C2 / Nativo';
  } else if (/ingl[eé]s[\s\S]{0,30}\b(?:c1|avanzado|advanced|cae|fluido\s*profesional)\b/i.test(clean) || /\b(c1\s*ingl[eé]s|cae\s*cambridge)\b/i.test(clean) || /\bingl[eé]s[\s\S]{0,40}c1\b/i.test(clean)) {
    englishLevel = 'C1';
  } else if (/ingl[eé]s[\s\S]{0,30}\b(?:b2|intermedio\s*alto|first\s*certificate|fce)\b/i.test(clean) || /\b(b2\s*ingl[eé]s|fce\s*cambridge)\b/i.test(clean)) {
    englishLevel = 'B2';
  } else if (/ingl[eé]s[\s\S]{0,30}\b(?:b1|intermedio|pet|medio)\b/i.test(clean) || /\b(b1\s*ingl[eé]s)\b/i.test(clean)) {
    englishLevel = 'B1';
  } else if (/ingl[eé]s[\s\S]{0,30}\b(?:a2|a1|b[aá]sico|basic)\b/i.test(clean)) {
    englishLevel = 'A2';
  }

  // ==========================================
  // 10. PREAVISO / DISPONIBILIDAD
  // ==========================================
  let noticePeriodWeeks = 2;
  if (/disponibilidad\s*(?:inmediata|completa|ya)|incorporaci[oó]n\s*inmediata/i.test(clean)) {
    noticePeriodWeeks = 0;
  } else if (/1\s*mes|un\s*mes|4\s*semanas|30\s*d[ií]as/i.test(clean)) {
    noticePeriodWeeks = 4;
  } else if (/2\s*meses|dos\s*meses|8\s*semanas/i.test(clean)) {
    noticePeriodWeeks = 8;
  }

  // ==========================================
  // 11. ROL SUGERIDO EN MECALUX
  // ==========================================
  let suggestedRole = 'Técnico de Nivel 1 (Soporte & Helpdesk Mecalux)';
  if (/implantaci[oó]n|puesta\s+en\s+marcha|field\s*service|viajes|desplazamiento/i.test(clean)) {
    suggestedRole = 'Técnico de Nivel 1 (Implantación & Puesta en Marcha SGA)';
  } else if (/\b(c#|csharp|\.net|dotnet)\b/i.test(clean)) {
    suggestedRole = 'Software Engineer Backend (.NET / C# / SGA)';
  } else if (/\b(java|spring)\b/i.test(clean)) {
    suggestedRole = 'Software Engineer Backend (Java / Spring)';
  } else if (/\b(react|angular|vue|typescript|frontend)\b/i.test(clean) && !/\b(backend|c#|java)\b/i.test(clean)) {
    suggestedRole = 'Software Engineer Frontend (React / Angular / TS)';
  } else if (/\b(plc|aut[oó]mata|scada|tia\s*portal|siemens)\b/i.test(clean)) {
    suggestedRole = 'Ingeniero de Automatización, Robótica & PLC (Siemens / TIA Portal)';
  } else if (/\b(devops|docker|kubernetes|azure|cloud|ci\/cd)\b/i.test(clean)) {
    suggestedRole = 'DevOps & Cloud Systems Engineer (Azure / AWS)';
  } else if (/\b(qa|testing|selenium|cypress|calidad\s*software)\b/i.test(clean)) {
    suggestedRole = 'QA Automation & Quality Engineer';
  } else if (/\b(consultor|consulting|funcional|easy\s*wms)\b/i.test(clean)) {
    suggestedRole = 'Consultor SGA / WMS (Easy WMS Mecalux)';
  }

  // ==========================================
  // 12. SALARIOS (OPCIONAL)
  // ==========================================
  let currentSalaryEur: number | undefined;
  let expectedSalaryEur: number | undefined;

  const salaryMatch = clean.match(/(?:salario|sueldo|retribuci[oó]n|expectativa(?:s)?\s*salarial(?:es)?|pretensiones)[:\s]+(\d{2})[.\s]?(\d{3})\s*€?/i);
  if (salaryMatch) {
    const val = parseInt(salaryMatch[1] + salaryMatch[2], 10);
    if (val >= 15000 && val <= 100000) {
      expectedSalaryEur = val;
    }
  }

  // ==========================================
  // 13. PREGUNTAS DINÁMICAS MECALUX
  // ==========================================
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
    fullName: fullName || (fileNameHint ? fileNameHint.replace(/\.pdf$/i, '').replace(/[._-](?:cv|curriculum|\d+)/gi, ' ').trim() : 'Candidato Detectado'),
    email,
    phone,
    location: location || 'No especificada',
    currentCompany: currentCompany || 'No especificada',
    currentPosition: currentPosition || 'Técnico de Soporte',
    estimatedSeniority,
    detectedSkills,
    intralogisticsExperience,
    yearsOfExperienceEstimate,
    englishLevel,
    noticePeriodWeeks,
    suggestedRole,
    currentSalaryEur,
    expectedSalaryEur,
    customSuggestedQuestions,
    suggestedFocusAreas
  };
}
