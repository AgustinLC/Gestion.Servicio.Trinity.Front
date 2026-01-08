import { forwardRef, useImperativeHandle, useEffect, useRef } from 'react';
import { BillDetailsDto } from '../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../core/models/dto/UserDto';
import { useBillPdfGeneratorV2, BillPdfOptions } from '../../hooks/useBillPdfGeneratorV2';

export interface BillPdfGeneratorProps {
    /** Una sola factura para generar */
    bill?: BillDetailsDto;
    /** Usuario asociado a la factura */
    user?: UserDto;
    /** Múltiples facturas para generar */
    bills?: BillDetailsDto[];
    /** Usuarios asociados a las facturas (requerido si bills está definido) */
    users?: UserDto[];
    /** Nombre del archivo PDF (si no se proporciona, se genera automáticamente) */
    fileName?: string;
    /** Incluir nombre del usuario en el nombre del archivo (solo para facturas individuales) */
    includeUserName?: boolean;
    /** Incluir período en el nombre del archivo (solo para facturas individuales) */
    includePeriod?: boolean;
    /** Callback cuando cambia el estado de generación */
    onGenerate?: (isGenerating: boolean) => void;
    /** Opciones adicionales para la generación */
    options?: Omit<BillPdfOptions, 'fileName'>;
    /** Auto-generar cuando se monta el componente (solo para una factura) */
    autoGenerate?: boolean;
}

export interface BillPdfGeneratorRef {
    /** Genera el PDF manualmente */
    generate: () => Promise<void>;
}

/**
 * Genera un nombre de archivo descriptivo para el PDF
 */
const buildAutoFileName = (
    bill: BillDetailsDto,
    user: UserDto,
    includeUserName: boolean,
    includePeriod: boolean
): string => {
    const parts: string[] = ['Factura', String(bill.idBill)];

    if (includeUserName) {
        // Limpiar el nombre para que sea válido como nombre de archivo
        const cleanName = `${user.firstName}_${user.lastName}`
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]/g, '');
        parts.push(cleanName);
    }

    if (includePeriod && bill.periodName) {
        const cleanPeriod = bill.periodName
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '');
        parts.push(cleanPeriod);
    }

    return parts.join('_');
};

/**
 * Componente reutilizable para generar PDFs de facturas
 * Usa @react-pdf/renderer para generación rápida y eficiente
 * 
 * @example
 * // Factura individual con nombre de usuario y período
 * <BillPdfGenerator
 *   bill={bill}
 *   user={user}
 *   includeUserName
 *   includePeriod
 *   ref={pdfRef}
 * />
 * 
 * // Luego llamar: pdfRef.current?.generate()
 */
const BillPdfGenerator = forwardRef<BillPdfGeneratorRef, BillPdfGeneratorProps>(
    (
        {
            bill,
            user,
            bills,
            users,
            fileName,
            includeUserName = true,
            includePeriod = true,
            onGenerate,
            options,
            autoGenerate = false,
        },
        ref
    ) => {
        const { isGenerating, generateSinglePdf, generateMultiplePdf } = useBillPdfGeneratorV2();
        const hasGeneratedRef = useRef(false);

        // Notificar cambios en el estado de generación
        useEffect(() => {
            onGenerate?.(isGenerating);
        }, [isGenerating, onGenerate]);

        // Auto-generar si está habilitado (solo para una factura)
        useEffect(() => {
            if (autoGenerate && bill && user && !hasGeneratedRef.current) {
                hasGeneratedRef.current = true;
                handleGenerate();
            }
        }, [autoGenerate, bill, user]);

        const handleGenerate = async () => {
            try {
                if (bills && users) {
                    // Generar PDF de múltiples facturas
                    await generateMultiplePdf(bills, users, {
                        fileName,
                        ...options,
                        onStart: () => options?.onStart?.(),
                        onComplete: () => options?.onComplete?.(),
                        onError: (error: Error) => options?.onError?.(error),
                    });
                } else if (bill && user) {
                    // Determinar nombre del archivo
                    const finalFileName = fileName || buildAutoFileName(
                        bill,
                        user,
                        includeUserName,
                        includePeriod
                    );

                    // Generar PDF de una sola factura
                    await generateSinglePdf(bill, user, {
                        fileName: finalFileName,
                        ...options,
                        onStart: () => options?.onStart?.(),
                        onComplete: () => options?.onComplete?.(),
                        onError: (error: Error) => options?.onError?.(error),
                    });
                } else {
                    throw new Error('Debe proporcionar (bill y user) o (bills y users)');
                }
            } catch (error) {
                console.error('Error en BillPdfGenerator:', error);
            }
        };

        // Exponer método generate a través del ref
        useImperativeHandle(ref, () => ({
            generate: handleGenerate,
        }));

        // El componente no necesita renderizar nada visible
        // La generación de PDF se hace completamente en memoria
        return null;
    }
);

BillPdfGenerator.displayName = 'BillPdfGenerator';

export default BillPdfGenerator;
