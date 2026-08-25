import * as pdfjsLib from 'pdfjs-dist';

// Configurar el worker de PDF.js usando CDN correspondiente a la versión instalada
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Configurando fallback para PDF.js worker');
  }
}

/**
 * Extrae todo el contenido de texto de un archivo PDF subido por el usuario en el navegador.
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
    const fullTextParts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');

      if (pageText.trim()) {
        fullTextParts.push(pageText);
      }
    }

    const extractedText = fullTextParts.join('\n\n');
    if (extractedText.trim().length > 20) {
      return extractedText;
    }
  } catch (pdfError) {
    console.warn('Error leyendo PDF con PDF.js, intentando extractor de streams crudos...', pdfError);
  }

  // Fallback heurístico: buscar streams de texto en el binario del PDF si el worker fallase
  try {
    const textDecoder = new TextDecoder('utf-8');
    const raw = textDecoder.decode(new Uint8Array(arrayBuffer));
    
    // Extraer fragmentos entre BT (Begin Text) y ET (End Text) o bloques de texto
    const textMatches: string[] = [];
    const regex = /\(([^)]+)\)\s*T[jd]/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(raw)) !== null) {
      if (match[1] && match[1].length > 1) {
        textMatches.push(match[1]);
      }
    }

    if (textMatches.length > 5) {
      return textMatches.join(' ');
    }
  } catch (rawError) {
    console.warn('Fallback extractor falló:', rawError);
  }

  throw new Error('No se pudo extraer el texto legible del archivo PDF. Asegúrate de que el PDF contiene texto seleccionable y no es solo una imagen escaneada.');
}
