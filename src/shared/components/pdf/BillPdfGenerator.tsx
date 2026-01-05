import { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { BillDetailsDto } from '../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../core/models/dto/UserDto';
import { useBillPdfGenerator, BillPdfOptions } from '../../../shared/hooks/useBillPdfGenerator';
import ConsorcioInvoice from '../bill/Bill';

export interface BillPdfGeneratorProps {
    /** Una sola factura para generar */
    bill?: BillDetailsDto;
    /** Usuario asociado a la factura */
    user?: UserDto;
    /** Múltiples facturas para generar */
    bills?: BillDetailsDto[];
    /** Usuarios asociados a las facturas (requerido si bills está definido) */
    users?: UserDto[];
    /** Nombre del archivo PDF */
    fileName?: string;
    /** Callback cuando cambia el estado de generación */
    onGenerate?: (isGenerating: boolean) => void;
    /** Opciones adicionales para la generación */
    options?: Omit<BillPdfOptions, 'fileName' | 'onStart' | 'onComplete' | 'onError'>;
    /** Auto-generar cuando se monta el componente (solo para una factura) */
    autoGenerate?: boolean;
}

export interface BillPdfGeneratorRef {
    /** Genera el PDF manualmente */
    generate: () => Promise<void>;
}

/**
 * Componente reutilizable para generar PDFs de facturas
 * Soporta una o múltiples facturas con optimizaciones automáticas
 */
const BillPdfGenerator = forwardRef<BillPdfGeneratorRef, BillPdfGeneratorProps>(
    (
        {
            bill,
            user,
            bills,
            users,
            fileName,
            onGenerate,
            options,
            autoGenerate = false,
        },
        ref
    ) => {
        const { isGenerating, generateSinglePdf, generateMultiplePdf } = useBillPdfGenerator();
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
                        onStart: () => {
                            options?.onStart?.();
                        },
                        onComplete: () => {
                            options?.onComplete?.();
                        },
                        onError: (error: any) => {
                            options?.onError?.(error);
                        },
                    });
                } else if (bill && user) {
                    // Generar PDF de una sola factura
                    await generateSinglePdf(bill, user, {
                        fileName,
                        ...options,
                        onStart: () => {
                            options?.onStart?.();
                        },
                        onComplete: () => {
                            options?.onComplete?.();
                        },
                        onError: (error: any) => {
                            options?.onError?.(error);
                        },
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

        // Para compatibilidad con el componente anterior (renderizar factura oculta)
        if (bill && user && !autoGenerate) {
            return (
                <div style={{ position: 'fixed', left: '-9999px' }}>
                    <ConsorcioInvoice user={user} bill={bill} />
                    <button
                        onClick={handleGenerate}
                        style={{ display: 'none' }}
                        id="pdf-trigger"
                    />
                </div>
            );
        }

        // Si es auto-generación o múltiples facturas, no renderizar nada
        return null;
    }
);

BillPdfGenerator.displayName = 'BillPdfGenerator';

export default BillPdfGenerator;

