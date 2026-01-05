import { useState, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactDOM from 'react-dom/client';
import { BillDetailsDto } from '../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../core/models/dto/UserDto';
import ConsorcioInvoice from '../components/bill/Bill';
import { toast } from 'react-toastify';

export interface BillPdfOptions {
    /** Nombre del archivo PDF (sin extensión) */
    fileName?: string;
    /** Calidad de imagen (0-1). Menor = más rápido pero menos calidad. Default: 0.8 */
    imageQuality?: number;
    /** Escala para html2canvas. Menor = más rápido. Default: 1.25 */
    scale?: number;
    /** Tamaño del lote para procesar facturas. Default: 10 */
    batchSize?: number;
    /** Callback cuando se actualiza el progreso (procesadas, total) */
    onProgress?: (processed: number, total: number) => void;
    /** Callback cuando inicia la generación */
    onStart?: () => void;
    /** Callback cuando finaliza la generación */
    onComplete?: () => void;
    /** Callback cuando hay un error */
    onError?: (error: Error) => void;
}

interface BillWithUser {
    bill: BillDetailsDto;
    user: UserDto;
}

/**
 * Hook para generar PDFs de facturas de forma optimizada
 * Soporta una o múltiples facturas con optimizaciones para grandes volúmenes
 */
export const useBillPdfGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [progress, setProgress] = useState({ processed: 0, total: 0 });

    /**
     * Genera un PDF de una sola factura
     */
    const generateSinglePdf = useCallback(
        async (bill: BillDetailsDto, user: UserDto, options: BillPdfOptions = {}) => {
            const {
                fileName = `Factura_${bill.idBill}`,
                imageQuality = 0.8,
                scale = 1.25,
                onStart,
                onComplete,
                onError,
            } = options;

            setIsGenerating(true);
            setProgress({ processed: 0, total: 1 });
            onStart?.();

            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-10000px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '794px';
            document.body.appendChild(tempContainer);

            const invoiceWrapper = document.createElement('div');
            tempContainer.appendChild(invoiceWrapper);

            const root = ReactDOM.createRoot(invoiceWrapper);

            try {
                // Renderizar la factura
                root.render(<ConsorcioInvoice user={user} bill={bill} />);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const invoiceElement = invoiceWrapper.querySelector(
                    '.invoice-container'
                ) as HTMLElement;

                if (!invoiceElement) {
                    throw new Error('No se pudo encontrar el elemento de la factura');
                }

                // Capturar como imagen
                const canvas = await html2canvas(invoiceElement, {
                    scale,
                    useCORS: true,
                    backgroundColor: '#fff',
                    logging: false,
                });

                const imgData = canvas.toDataURL('image/jpeg', imageQuality);
                const ratio = canvas.height / canvas.width;

                // Liberar memoria
                canvas.width = 0;
                canvas.height = 0;

                // Crear PDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210;
                const imgHeight = 297;
                const finalHeight = imgWidth * ratio;

                // Si la factura es más alta que una página, dividirla
                if (finalHeight > imgHeight) {
                    let y = 0;
                    while (y < finalHeight) {
                        if (y > 0) {
                            pdf.addPage();
                        }
                        pdf.addImage(imgData, 'JPEG', 0, -y, imgWidth, finalHeight);
                        y += imgHeight;
                    }
                } else {
                    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, finalHeight);
                }

                pdf.save(`${fileName}.pdf`);
                setProgress({ processed: 1, total: 1 });
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF:', err);
                onError?.(err);
                throw err;
            } finally {
                root.unmount();
                document.body.removeChild(tempContainer);
                setIsGenerating(false);
            }
        },
        []
    );

    /**
     * Genera un PDF con múltiples facturas de forma optimizada
     * Procesa en lotes para evitar bloqueos del navegador
     */
    const generateMultiplePdf = useCallback(
        async (
            bills: BillDetailsDto[],
            users: UserDto[],
            options: BillPdfOptions = {}
        ) => {
            const {
                fileName = `facturas_consorcio_${new Date().toISOString().split('T')[0]}`,
                imageQuality = 0.8,
                scale = 1.25,
                batchSize = 10,
                onProgress,
                onStart,
                onComplete,
                onError,
            } = options;

            if (bills.length === 0) {
                throw new Error('No hay facturas para generar');
            }

            setIsGenerating(true);
            setProgress({ processed: 0, total: bills.length });
            onStart?.();

            // Crear mapeo de usuarios para acceso rápido
            const userMap = new Map<number, UserDto>();
            users.forEach((user) => userMap.set(user.idUser, user));

            // Filtrar facturas válidas
            const validBills: BillWithUser[] = [];
            bills.forEach((bill) => {
                const user = userMap.get(bill.idUser);
                if (user) {
                    validBills.push({ bill, user });
                } else {
                    console.warn(`Usuario no encontrado para factura ${bill.idBill}`);
                }
            });

            if (validBills.length === 0) {
                throw new Error('No se encontraron facturas con usuarios válidos');
            }

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const imgHeight = 297;

            // Contenedor oculto
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-10000px';
            tempContainer.style.top = '0';
            tempContainer.style.width = '794px';
            document.body.appendChild(tempContainer);

            const invoiceWrapper = document.createElement('div');
            tempContainer.appendChild(invoiceWrapper);

            const root = ReactDOM.createRoot(invoiceWrapper);
            
            // ✅ Contador de páginas totales agregadas al PDF
            let totalPagesAdded = 0;

            try {
                for (let i = 0; i < validBills.length; i++) {
                    const { bill, user } = validBills[i];

                    // Renderizar factura
                    root.render(<ConsorcioInvoice user={user} bill={bill} />);
                    await new Promise((resolve) => setTimeout(resolve, 100));

                    const invoiceElement = invoiceWrapper.querySelector(
                        '.invoice-container'
                    ) as HTMLElement;

                    if (!invoiceElement) {
                        console.warn(`Elemento no encontrado para factura ${i + 1}`);
                        continue;
                    }

                    // Capturar como imagen
                    const canvas = await html2canvas(invoiceElement, {
                        scale,
                        useCORS: true,
                        backgroundColor: '#fff',
                        logging: false,
                    });

                    const imgData = canvas.toDataURL('image/jpeg', imageQuality);
                    const ratio = canvas.height / canvas.width;
                    const finalHeight = imgWidth * ratio;

                    // Liberar memoria del canvas
                    canvas.width = 0;
                    canvas.height = 0;

                    // ✅ LÓGICA SIMPLIFICADA Y CORREGIDA
                    if (finalHeight > imgHeight) {
                        // Factura dividida en múltiples páginas
                        let y = 0;
                        
                        while (y < finalHeight) {
                            // Agregar página solo si ya hay páginas en el PDF
                            if (totalPagesAdded > 0) {
                                pdf.addPage();
                            }
                            
                            pdf.addImage(imgData, 'JPEG', 0, -y, imgWidth, finalHeight);
                            totalPagesAdded++;
                            y += imgHeight;
                        }
                    } else {
                        // Factura cabe en una página
                        // Agregar página solo si ya hay páginas en el PDF
                        if (totalPagesAdded > 0) {
                            pdf.addPage();
                        }
                        
                        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, finalHeight);
                        totalPagesAdded++;
                    }

                    // Actualizar progreso
                    const processed = i + 1;
                    setProgress({ processed, total: validBills.length });
                    onProgress?.(processed, validBills.length);

                    // Yield cada batchSize facturas para no bloquear
                    if (processed % batchSize === 0) {
                        await new Promise((resolve) => setTimeout(resolve, 0));
                        toast.info(`Procesando ${processed}/${validBills.length}`, {
                            autoClose: 500,
                        });
                    }
                }

                pdf.save(`${fileName}.pdf`);
                toast.success(`PDF generado: ${validBills.length} facturas (${totalPagesAdded} páginas)`);
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF:', err);
                toast.error('Error al generar PDF');
                onError?.(err);
                throw err;
            } finally {
                root.unmount();
                document.body.removeChild(tempContainer);
                setIsGenerating(false);
            }
        },
        []
    );
    
    return {
        isGenerating,
        progress,
        generateSinglePdf,
        generateMultiplePdf,
    };
};