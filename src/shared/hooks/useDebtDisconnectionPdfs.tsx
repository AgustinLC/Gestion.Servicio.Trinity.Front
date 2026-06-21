import { useState, useCallback, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import { UserDebtDto } from '../../core/models/dto/UserDebtDto';
import { DisconnectionPdfDocument, DebtPdfDocument, PdfParameters, DEFAULT_PARAMS } from '../components/debt-disconnection/pdf';
import { toast } from 'react-toastify';
import { getData } from '../../core/services/apiService';

export interface PdfGeneratorOptions {
    fileName?: string;
    onStart?: () => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
}

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

export const useDebtDisconnectionPdfs = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [pdfParameters, setPdfParameters] = useState<PdfParameters | null>(null);

    useEffect(() => {
        const fetchParameters = async () => {
            try {
                const data = await getData<PdfParameters>("/info/pdf-parameters");
                setPdfParameters(data);
            } catch (error) {
                console.error("Error al obtener los parámetros del PDF, usando valores por defecto:", error);
            }
        };
        fetchParameters();
    }, []);

    const currentParams = pdfParameters || DEFAULT_PARAMS;

    /**
     * Genera la Orden de Corte de Servicio (cuando adeudan >= 2 períodos)
     */
    const generateDisconnectionPdf = useCallback(
        async (
            user: UserDebtDto,
            options: PdfGeneratorOptions = {}
        ): Promise<void> => {
            const {
                fileName = `Orden_Corte_Usuario_${user.idUser}_${new Date().toISOString().split('T')[0]}`,
                onStart,
                onComplete,
                onError,
            } = options;

            setIsGenerating(true);
            onStart?.();

            try {
                const blob = await pdf(
                    <DisconnectionPdfDocument disconnections={[{ user, date: new Date() }]} pdfParameters={currentParams} />
                ).toBlob();

                downloadBlob(blob, fileName);
                toast.success('Orden de corte generada exitosamente');
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF de orden de corte:', err);
                toast.error('Error al generar PDF de orden de corte');
                onError?.(err);
                throw err;
            } finally {
                setIsGenerating(false);
            }
        },
        [currentParams]
    );

    /**
     * Genera el Cuadro de Aviso de Corte / Advertencia de Deuda
     */
    const generateWarningPdf = useCallback(
        async (
            user: UserDebtDto,
            periodsOwed: number,
            options: PdfGeneratorOptions = {}
        ): Promise<void> => {
            const {
                fileName = `Aviso_Deuda_Usuario_${user.idUser}_${new Date().toISOString().split('T')[0]}`,
                onStart,
                onComplete,
                onError,
            } = options;

            setIsGenerating(true);
            onStart?.();

            try {
                const blob = await pdf(
                    <DebtPdfDocument debts={[{ user, date: new Date(), periodsOwed }]} pdfParameters={currentParams} />
                ).toBlob();

                downloadBlob(blob, fileName);
                toast.success('Cuadro de aviso de corte generado exitosamente');
                onComplete?.();
            } catch (error) {
                const err = error instanceof Error ? error : new Error('Error desconocido');
                console.error('Error generando PDF de aviso de deuda:', err);
                toast.error('Error al generar PDF de aviso de deuda');
                onError?.(err);
                throw err;
            } finally {
                setIsGenerating(false);
            }
        },
        [currentParams]
    );

    return {
        isGenerating,
        generateDisconnectionPdf,
        generateWarningPdf,
    };
};

export default useDebtDisconnectionPdfs;
