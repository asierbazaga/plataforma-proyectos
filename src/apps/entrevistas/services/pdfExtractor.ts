import * as pdfjsLib from 'pdfjs-dist';
// Importar worker local vía URL de Vite para no depender de CDN externo ni fallos de red
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
  } catch (e) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    } catch (err) {
      console.warn('No se pudo inicializar worker de PDF.js', err);
    }
  }
}

interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hasEOL?: boolean;
}

/**
 * Extrae y segmenta las columnas de una página (ej. diseño Europass / Canva de 2 columnas)
 * para evitar mezclar lateralmente los bloques de contacto/sidebar con los de experiencia/cuerpo.
 */
function extractPageTextWithColumns(items: PdfTextItem[]): string {
  if (!items || items.length === 0) return '';

  const minX = Math.min(...items.map(it => it.x));
  const maxX = Math.max(...items.map(it => it.x + it.width));

  // Detectar si existe una división nítida en 2 columnas verticales (habitual en Europass o plantillas modernas)
  let splitX = -1;
  const step = 10;
  for (let testX = minX + 80; testX <= maxX - 80; testX += step) {
    const leftItems = items.filter(it => it.x + it.width <= testX + 5);
    const rightItems = items.filter(it => it.x >= testX - 5);
    const crossingItems = items.filter(it => it.x < testX && it.x + it.width > testX);
    
    if (leftItems.length >= 6 && rightItems.length >= 6 && crossingItems.length <= 2) {
      splitX = testX;
      break;
    }
  }

  const columns: PdfTextItem[][] = [];
  if (splitX > 0) {
    const col1 = items.filter(it => it.x + it.width <= splitX + 10);
    const col2 = items.filter(it => it.x > splitX - 10);
    columns.push(col1, col2);
  } else {
    columns.push(items);
  }

  const resultColumnsText: string[] = [];

  for (const colItems of columns) {
    const linesMap: { y: number; items: PdfTextItem[] }[] = [];
    for (const item of colItems) {
      if (!item.str.trim() && item.str.length === 0) continue;
      let foundLine = linesMap.find(l => Math.abs(l.y - item.y) <= 4);
      if (!foundLine) {
        foundLine = { y: item.y, items: [] };
        linesMap.push(foundLine);
      }
      foundLine.items.push(item);
    }

    // Ordenar de arriba hacia abajo
    linesMap.sort((a, b) => b.y - a.y);
    const colLines: string[] = [];
    let lastLineY = linesMap.length > 0 ? linesMap[0].y : 0;

    for (const line of linesMap) {
      // Ordenar de izquierda a derecha
      line.items.sort((a, b) => a.x - b.x);
      let reconstructedLine = '';
      let lastRight = -1;

      for (const it of line.items) {
        if (lastRight >= 0 && (it.x - lastRight) > 2) {
          if (!reconstructedLine.endsWith(' ') && !it.str.startsWith(' ')) {
            reconstructedLine += ' ';
          }
        }
        reconstructedLine += it.str;
        lastRight = it.x + (it.width || (it.str.length * 5));
      }

      const trimmed = reconstructedLine.trim();
      if (trimmed) {
        if (Math.abs(lastLineY - line.y) > 24) {
          colLines.push('');
        }
        colLines.push(trimmed);
        lastLineY = line.y;
      }
    }

    if (colLines.length > 0) {
      resultColumnsText.push(colLines.join('\n'));
    }
  }

  return resultColumnsText.join('\n\n');
}

/**
 * Extrae todo el contenido de texto de un archivo PDF subido por el usuario en el navegador,
 * reconstruyendo la estructura real de líneas, párrafos y columnas basándose en coordenadas espaciales.
 */
export async function extractTextFromPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: true,
      useSystemFonts: true
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const rawItems: PdfTextItem[] = [];
      for (const item of textContent.items as any[]) {
        if (!item || typeof item.str !== 'string') continue;
        const str = item.str;
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4] || 0;
        const y = transform[5] || 0;
        const width = item.width || 0;
        const height = item.height || Math.abs(transform[3]) || 10;
        rawItems.push({
          str,
          x,
          y,
          width,
          height,
          hasEOL: !!item.hasEOL
        });
      }

      const pageExtracted = extractPageTextWithColumns(rawItems);
      if (pageExtracted.trim()) {
        pageTexts.push(pageExtracted);
      }
    }

    const extractedText = pageTexts.join('\n\n--- PÁGINA SIGUIENTE ---\n\n');
    if (extractedText.trim().length > 15) {
      return extractedText;
    }
  } catch (pdfError) {
    console.warn('Error leyendo PDF con PDF.js, intentando extractor de streams crudos...', pdfError);
  }

  // Fallback heurístico inteligente: extraer streams de texto y objetos Tj/TJ del binario del PDF
  try {
    const textDecoder = new TextDecoder('latin1');
    const raw = textDecoder.decode(new Uint8Array(arrayBuffer));
    
    const linesExtracted: string[] = [];

    // Extraer bloques TJ: [ (Texto 1) 20 (Texto 2) ] TJ
    const tjRegex = /\[([^\]]+)\]\s*TJ/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(raw)) !== null) {
      const inner = tjMatch[1];
      const strParts: string[] = [];
      const strRegex = /\(([^)]*)\)/g;
      let sMatch: RegExpExecArray | null;
      while ((sMatch = strRegex.exec(inner)) !== null) {
        if (sMatch[1]) strParts.push(sMatch[1]);
      }
      if (strParts.length > 0) {
        const line = strParts.join('').replace(/\\([()\\])/g, '$1').trim();
        if (line.length > 1) linesExtracted.push(line);
      }
    }

    // Extraer bloques Tj: (Texto) Tj
    const tjSingleRegex = /\(([^)]+)\)\s*T[jd]/g;
    let singleMatch: RegExpExecArray | null;
    while ((singleMatch = tjSingleRegex.exec(raw)) !== null) {
      const cleaned = singleMatch[1].replace(/\\([()\\])/g, '$1').trim();
      if (cleaned.length > 1 && !linesExtracted.includes(cleaned)) {
        linesExtracted.push(cleaned);
      }
    }

    if (linesExtracted.length > 5) {
      return linesExtracted.join('\n');
    }
  } catch (rawError) {
    console.warn('Fallback extractor falló:', rawError);
  }

  throw new Error('No se pudo extraer el texto legible del archivo PDF. Asegúrate de que el PDF contiene texto seleccionable y no es una imagen escaneada.');
}
