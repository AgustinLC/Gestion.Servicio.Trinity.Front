import html2canvas, { Options } from "html2canvas";

export interface CaptureImageOptions extends Partial<Options> {
  /** Calidad de imagen (0-1). Menor = más rápido pero menos calidad. Default: 0.8 */
  imageQuality?: number;
  /** Escala para html2canvas. Menor = más rápido. Default: 1.25 */
  scale?: number;
}

/**
 * Captura un elemento HTML como imagen optimizada para PDFs
 * Incluye optimizaciones de memoria y rendimiento
 */
export async function captureElementAsImage(
  element: HTMLElement,
  options: CaptureImageOptions = {}
) {
  const {
    imageQuality = 0.8,
    scale = 1.25,
    useCORS = true,
    backgroundColor = "#fff",
    logging = false,
    ...restOptions
  } = options;

  const canvas = await html2canvas(element, {
    scale,
    useCORS,
    backgroundColor,
    logging,
    // Optimizaciones para mejor rendimiento
    removeContainer: true,
    ...restOptions,
  });

  const imgData = canvas.toDataURL("image/jpeg", imageQuality);
  const ratio = canvas.height / canvas.width;

  // Liberar memoria inmediatamente
  canvas.width = 0;
  canvas.height = 0;
  
  // Forzar garbage collection si es posible
  if (global.gc) {
    global.gc();
  }

  return { imgData, ratio };
}

/**
 * Procesa múltiples elementos en lotes para evitar bloqueos del navegador
 */
export async function captureElementsInBatches(
  elements: HTMLElement[],
  options: CaptureImageOptions = {},
  batchSize: number = 10
): Promise<Array<{ imgData: string; ratio: number }>> {
  const results: Array<{ imgData: string; ratio: number }> = [];

  for (let i = 0; i < elements.length; i += batchSize) {
    const batch = elements.slice(i, i + batchSize);
    const batchPromises = batch.map((element) =>
      captureElementAsImage(element, options)
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Yield después de cada lote para no bloquear el navegador
    if (i + batchSize < elements.length) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return results;
}