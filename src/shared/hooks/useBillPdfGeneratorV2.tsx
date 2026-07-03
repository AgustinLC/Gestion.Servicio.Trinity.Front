import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { BillDetailsDto } from '../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../core/models/dto/UserDto';
import BillPdfDocument from '../components/bill/pdf/BillPdfDocument';
import { toast } from 'react-toastify';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface BillPdfOptions {
    /** Nombre del archivo PDF (sin extensión) */
    fileName?: string;
    /** Callback cuando inicia la generación */
    onStart?: () => void;
    /** Callback cuando finaliza la generación */
    onComplete?: () => void;
    /** Callback cuando hay un error */
    onError?: (error: Error) => void;
    /** Callback de progreso (solo para múltiples facturas) */
    onProgress?: (processed: number, total: number) => void;
}

interface BillWithUser {
    bill: BillDetailsDto;
    user: UserDto;
}

interface Progress {
    processed: number;
    total: number;
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Descarga un blob como archivo
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Crea el mapeo de usuarios por ID para acceso O(1)
 */
const createUserMap = (users: UserDto[]): Map<number, UserDto> => {
    const map = new Map<number, UserDto>();
    users.forEach(user => map.set(user.idUser, user));
    return map;
};

/**
 * Filtra facturas válidas (con usuario asociado)
 */
const filterValidBills = (
    bills: BillDetailsDto[], 
    userMap: Map<number, UserDto>
): BillWithUser[] => {
    const validBills: BillWithUser[] = [];
    
    bills.forEach(bill => {
        const user = userMap.get(bill.idUser);
        if (user) {
            validBills.push({ bill, user });
        } else {
            console.warn(`Usuario no encontrado para factura ${bill.idBill}`);
        }
    });
    
    return validBills;
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para generar PDFs de facturas usando @react-pdf/renderer
 * 
 * Ventajas sobre html2canvas + jsPDF:
 * - 10-50x más rápido (genera PDF directamente, sin pasar por canvas)
 * - PDF vectorial (texto seleccionable, zoom infinito)
 * - Archivos más pequeños
 * - Mejor calidad visual
 * 
 * @example
 * const { generateSinglePdf, generateMultiplePdf, isGenerating } = useBillPdfGeneratorV2();
 * 
 * // Una factura
 * await generateSinglePdf(bill, user, { fileName: 'mi_factura' });
 * 
 * // Múltiples facturas
 * await generateMultiplePdf(bills, users, { fileName: 'facturas_enero' });
 */
export const useBillPdfGeneratorV2 = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState<Progress>({ processed: 0, total: 0 });

    /**
     * Genera un PDF de una sola factura
     */
    const generateSinglePdf = useCallback(
        async (
            bill: BillDetailsDto, 
            user: UserDto, 
            options: BillPdfOptions = {}
        ): Promise<void> => {
            const {
                fileName = `Factura_${bill.idBill}`,
                onStart,
                onComplete,
                onError,
            } = options;

            setIsGenerating(true);
            setProgress({ processed: 0, total: 1 });
            onStart?.();

            try {
                // Generar PDF usando @react-pdf/renderer
                const blob = await pdf(
                    <BillPdfDocument bills={[{ bill, user }]} />
                ).toBlob();

                // Descargar
                downloadBlob(blob, fileName);
                
                setProgress({ processed: 1, total: 1 });
                toast.success('PDF generado exitosamente');
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF:', err);
                toast.error('Error al generar PDF');
                onError?.(err);
                throw err;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    /**
     * Genera un PDF con múltiples facturas
     * Todas las facturas se incluyen en un solo documento PDF
     */
    const generateMultiplePdf = useCallback(
        async (
            bills: BillDetailsDto[],
            users: UserDto[],
            options: BillPdfOptions = {}
        ): Promise<void> => {
            const {
                fileName = `facturas_consorcio_${new Date().toISOString().split('T')[0]}`,
                onStart,
                onComplete,
                onError,
                onProgress,
            } = options;

            if (bills.length === 0) {
                throw new Error('No hay facturas para generar');
            }

            setIsGenerating(true);
            setProgress({ processed: 0, total: bills.length });
            onStart?.();

            try {
                // Crear mapeo de usuarios
                const userMap = createUserMap(users);
                
                // Filtrar facturas válidas
                const validBills = filterValidBills(bills, userMap);

                if (validBills.length === 0) {
                    throw new Error('No se encontraron facturas con usuarios válidos');
                }

                // Mostrar progreso inicial
                toast.info(`Generando PDF con ${validBills.length} facturas...`);
                onProgress?.(0, validBills.length);

                // Generar PDF con todas las facturas
                const blob = await pdf(
                    <BillPdfDocument bills={validBills} />
                ).toBlob();

                // Actualizar progreso
                setProgress({ processed: validBills.length, total: validBills.length });
                onProgress?.(validBills.length, validBills.length);

                // Descargar
                downloadBlob(blob, fileName);

                toast.success(
                    `PDF generado: ${validBills.length} factura${validBills.length > 1 ? 's' : ''} (${validBills.length} páginas)`
                );
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF:', err);
                toast.error('Error al generar PDF');
                onError?.(err);
                throw err;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    /**
     * Genera PDFs en lotes (útil para grandes volúmenes)
     * Divide las facturas en grupos y genera un PDF por grupo
     */
    const generateBatchPdfs = useCallback(
        async (
            bills: BillDetailsDto[],
            users: UserDto[],
            options: BillPdfOptions & { 
                /** Facturas por archivo PDF. Default: 50 */
                billsPerFile?: number 
            } = {}
        ): Promise<void> => {
            const {
                fileName = `facturas_consorcio`,
                billsPerFile = 50,
                onStart,
                onComplete,
                onError,
                onProgress,
            } = options;

            if (bills.length === 0) {
                throw new Error('No hay facturas para generar');
            }

            setIsGenerating(true);
            setProgress({ processed: 0, total: bills.length });
            onStart?.();

            try {
                const userMap = createUserMap(users);
                const validBills = filterValidBills(bills, userMap);

                if (validBills.length === 0) {
                    throw new Error('No se encontraron facturas con usuarios válidos');
                }

                // Dividir en lotes
                const batches: BillWithUser[][] = [];
                for (let i = 0; i < validBills.length; i += billsPerFile) {
                    batches.push(validBills.slice(i, i + billsPerFile));
                }

                toast.info(`Generando ${batches.length} archivo(s) PDF...`);

                let totalProcessed = 0;

                for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                    const batch = batches[batchIndex];
                    
                    // Generar PDF del lote
                    const blob = await pdf(
                        <BillPdfDocument bills={batch} />
                    ).toBlob();

                    // Nombre del archivo con índice si hay múltiples
                    const batchFileName = batches.length > 1 
                        ? `${fileName}_parte_${batchIndex + 1}` 
                        : fileName;

                    downloadBlob(blob, batchFileName);

                    totalProcessed += batch.length;
                    setProgress({ processed: totalProcessed, total: validBills.length });
                    onProgress?.(totalProcessed, validBills.length);

                    // Pequeña pausa entre lotes para no sobrecargar
                    if (batchIndex < batches.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }

                toast.success(
                    `${batches.length} PDF(s) generado(s): ${validBills.length} facturas en total`
                );
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDFs:', err);
                toast.error('Error al generar PDFs');
                onError?.(err);
                throw err;
            } finally {
                setIsGenerating(false);
            }
        },
        []
    );

    return {
        /** Indica si se está generando un PDF */
        isGenerating,
        /** Progreso actual de la generación */
        progress,
        /** Genera PDF de una sola factura */
        generateSinglePdf,
        /** Genera PDF con múltiples facturas en un solo archivo */
        generateMultiplePdf,
        /** Genera múltiples PDFs divididos en lotes */
        generateBatchPdfs,
    };
};

// Export por defecto para compatibilidad
export default useBillPdfGeneratorV2;
