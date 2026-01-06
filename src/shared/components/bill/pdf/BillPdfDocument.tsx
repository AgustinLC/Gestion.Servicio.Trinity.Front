import { Document, Page, View, Text, Font } from '@react-pdf/renderer';
import { BillDetailsDto } from '../../../../core/models/dto/BillDetailsDto';
import { UserDto } from '../../../../core/models/dto/UserDto';
import { styles } from './styles';

// ============================================================================
// CONFIGURACIÓN DE FUENTES - Deshabilitar silabación
// ============================================================================

// Evita que las palabras se corten con guiones
Font.registerHyphenationCallback(word => [word]);

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface BillPdfProps {
    bills: Array<{
        bill: BillDetailsDto;
        user: UserDto;
    }>;
}

interface SingleBillProps {
    bill: BillDetailsDto;
    user: UserDto;
}

interface DateSeparate {
    year: string;
    month: string;
    day: string;
}

// ============================================================================
// UTILIDADES
// ============================================================================

const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
};

const separateDate = (dateInput: Date | string): DateSeparate => {
    if (!dateInput) return { year: '', month: '', day: '' };
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, '0'),
        day: String(date.getDate()).padStart(2, '0'),
    };
};

const formatNumber = (value: number): string => {
    return value.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// Convertir número a palabras
const UNIDADES = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
const DECENAS = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CENTENAS = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
const especiales: Record<number, string> = {
    10: 'DIEZ', 11: 'ONCE', 12: 'DOCE', 13: 'TRECE', 14: 'CATORCE',
    15: 'QUINCE', 16: 'DIECISÉIS', 17: 'DIECISIETE', 18: 'DIECIOCHO', 19: 'DIECINUEVE',
    20: 'VEINTE', 21: 'VEINTIUNO', 22: 'VEINTIDÓS', 23: 'VEINTITRÉS', 24: 'VEINTICUATRO',
    25: 'VEINTICINCO', 26: 'VEINTISÉIS', 27: 'VEINTISIETE', 28: 'VEINTIOCHO', 29: 'VEINTINUEVE'
};

const convertNumberToWords = (num: number): string => {
    if (num === 0) return 'CERO';
    if (num in especiales) return especiales[num];

    let letras = '';

    if (num >= 1000) {
        letras += num === 1000 ? 'MIL' : `${convertNumberToWords(Math.floor(num / 1000))} MIL `;
        num %= 1000;
    }

    if (num >= 100) {
        letras += num === 100 ? 'CIEN' : `${CENTENAS[Math.floor(num / 100)]} `;
        num %= 100;
    }

    if (num >= 30) {
        letras += DECENAS[Math.floor(num / 10)];
        if (num % 10 !== 0) letras += ` Y ${UNIDADES[num % 10]}`;
    } else if (num > 0) {
        letras += especiales[num] || UNIDADES[num];
    }

    return letras.trim();
};

// ============================================================================
// COMPONENTES - HEADER
// ============================================================================

const Header = ({ bill, user }: SingleBillProps) => (
    <View style={styles.header}>
        {/* Información del Consorcio */}
        <View style={styles.consortiumInfo}>
            <Text style={styles.consortiumTitle}>Agua Potable</Text>
            <Text style={styles.consortiumTextBold}>Consorcio Vecinal de Agua Potable</Text>
            <Text style={styles.consortiumText}>Santa María de Oro</Text>
            <Text style={styles.consortiumText}>Liniers s/n. Sta. María de Oro</Text>
            <Text style={styles.consortiumText}>C.P. 5579 - Rvia. - Mza</Text>
            <Text style={styles.consortiumTextBold}>C.U.I.T NRO.: 30-65481347-3</Text>
        </View>

        {/* Información del Usuario */}
        <View style={styles.userInfo}>
            <View style={styles.userInfoTable}>
                {/* Factura y Emisión con borde inferior */}
                <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoLabel}>N° DE FACTURA</Text>
                    <Text style={styles.userInfoValue}>0001-{bill.idBill}</Text>
                </View>
                <View style={styles.userInfoRow}>
                    <Text style={styles.userInfoLabel}>FECHA EMISIÓN</Text>
                    <Text style={styles.userInfoValue}>{formatDate(bill.dateRegister)}</Text>
                </View>
                {/* Resto sin borde inferior */}
                <View style={styles.userInfoRowNoBorder}>
                    <Text style={styles.userInfoLabel}>NOMBRE DEL USUARIO</Text>
                    <Text style={styles.userInfoValue}>{user.firstName} {user.lastName}</Text>
                </View>
                <View style={styles.userInfoRowNoBorder}>
                    <Text style={styles.userInfoLabel}>UBICACIÓN DEL INMUEBLE</Text>
                    <Text style={styles.userInfoValue}>{user.residenceDto.district}</Text>
                </View>
                <View style={styles.userInfoRowNoBorder}>
                    <Text style={styles.userInfoLabel}>DOMICILIO DEL USUARIO</Text>
                    <Text style={styles.userInfoValue}>{user.residenceDto.street}</Text>
                </View>
                <View style={styles.userInfoRowNoBorder}>
                    <Text style={styles.userInfoLabel}>CASA N°</Text>
                    <Text style={styles.userInfoValue}>{user.residenceDto.number}</Text>
                </View>
                <View style={styles.userInfoRowNoBorder}>
                    <Text style={styles.userInfoLabel}>N° CONEXIÓN</Text>
                    <Text style={styles.userInfoValue}>{user.idUser}</Text>
                </View>
            </View>
        </View>
    </View>
);

// ============================================================================
// COMPONENTES - READING DETAILS (Tablas de Lectura)
// ============================================================================

const ReadingDetailsTable1 = ({ bill, user }: SingleBillProps) => (
    <View style={styles.readingTable1}>
        {/* Header */}
        <View style={styles.readingTable1HeaderRow}>
            <Text style={[styles.readingCell, styles.readingCellFirst, styles.readingCellTop, { width: '20%' }]}>
                NÚMERO DE USUARIO
            </Text>
            <Text style={[styles.readingCell, styles.readingCellTop, { width: '12%' }]}>
                {user.idUser}
            </Text>
            <Text style={[styles.readingCell, styles.readingCellTop, { width: '28%' }]}>
                PERIODO FACTURADO
            </Text>
            <Text style={[styles.readingCell, styles.readingCellTop, { width: '20%' }]}>
                VENCIMIENTO
            </Text>
            <Text style={[styles.readingCell, styles.readingCellTop, { width: '20%' }]}>
                PRÓXIMO VENCIMIENTO
            </Text>
        </View>
        {/* Body */}
        <View style={styles.readingTable1BodyRow}>
            <Text style={[styles.readingCell, styles.readingCellFirst, { width: '20%' }]}>
                CATEGORÍA
            </Text>
            <Text style={[styles.readingCell, { width: '12%' }]}>
                {user.residenceDto.idFee}
            </Text>
            <Text style={[styles.readingCell, { width: '28%' }]}>
                {bill.periodName}
            </Text>
            <Text style={[styles.readingCell, { width: '20%' }]}>
                {formatDate(bill.expirationDate)}
            </Text>
            <Text style={[styles.readingCell, { width: '20%' }]}>
                -
            </Text>
        </View>
    </View>
);

const ReadingDetailsTable2 = ({ bill }: { bill: BillDetailsDto }) => {
    const currentDate = separateDate(bill.readingsBillDto.currentReadingDate);
    const previousDate = separateDate(bill.readingsBillDto.previousReadingDate);

    return (
        <View style={styles.readingTable2}>
            {/* Header Row 1 */}
            <View style={styles.readingTable2Row}>
                <Text style={[styles.readingCell, styles.readingCellFirst, { width: '10%', borderBottom: 'none' }]}>
                    NÚMERO DE
                </Text>
                <Text style={[styles.readingCell, { width: '40%' }]}>
                    FECHA DE LECTURA Y ESTADO ACTUAL
                </Text>
                <Text style={[styles.readingCell, { width: '36%' }]}>
                    FECHA DE LECTURA Y ESTADO ANTERIOR
                </Text>
                <Text style={[styles.readingCell, { width: '14%' }]}>
                    TOTAL CONSUMO REGISTRADO
                </Text>
            </View>
            {/* Header Row 2 */}
            <View style={styles.readingTable2Row}>
                <Text style={[styles.readingCell, styles.readingCellFirst, { width: '10%' }]}>
                    MEDIDOR
                </Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>DÍA</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>MES</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>AÑO</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>ESTADO ACTUAL</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>DÍA</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>MES</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>AÑO</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>ESTADO ANTERIOR</Text>
                <Text style={[styles.readingCell, { width: '14%' }]}>EN m³</Text>
            </View>
            {/* Data Row */}
            <View style={styles.readingTable2Row}>
                <Text style={[styles.readingCell, styles.readingCellFirst, { width: '10%' }]}>
                    {bill.idMeter}
                </Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>{currentDate.day}</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>{currentDate.month}</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>{currentDate.year}</Text>
                <Text style={[styles.readingCell, { width: '10%' }]}>{bill.readingsBillDto.currentReading}</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>{previousDate.day}</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>{previousDate.month}</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>{previousDate.year}</Text>
                <Text style={[styles.readingCell, { width: '9%' }]}>{bill.readingsBillDto.previousReading}</Text>
                <Text style={[styles.readingCell, { width: '14%' }]}>{bill.consumption}</Text>
            </View>
        </View>
    );
};

// ============================================================================
// COMPONENTES - BILLING CONCEPTS (Conceptos Facturados)
// ============================================================================

const BillingConcepts = ({ bill }: { bill: BillDetailsDto }) => {
    const conceptos = [
        'Consumo Normal', 'Reconexión', 'Conexión', 'Materiales',
        'Boletas faltantes', 'Multas', 'Otros'
    ];

    return (
        <View style={styles.conceptsSection}>
            <View style={styles.conceptsTable}>
                {/* Header */}
                <View style={styles.conceptsHeaderRow}>
                    <Text style={[styles.conceptsCell, styles.conceptsCellHeader, styles.colRubro]}>RUBRO</Text>
                    <Text style={[styles.conceptsCell, styles.conceptsCellHeader, styles.colConcepto]}>CONCEPTO</Text>
                    <Text style={[styles.conceptsCell, styles.conceptsCellHeader, styles.colCant]}>CANT.</Text>
                    <Text style={[styles.conceptsCell, styles.conceptsCellHeader, styles.colPrecio]}>PRECIO UNITARIO ($)</Text>
                    <Text style={[styles.conceptsCell, styles.conceptsCellHeader, styles.colImporte]}>IMPORTES PARCIALES ($)</Text>
                </View>

                {/* Cuota Social */}
                <View style={styles.conceptsRow}>
                    <Text style={[styles.conceptsCell, styles.colRubro]}>01</Text>
                    <Text style={[styles.conceptsCell, styles.colConcepto, styles.conceptsCellLeft]}>Cuota Social</Text>
                    <Text style={[styles.conceptsCell, styles.colCant]}>1</Text>
                    <Text style={[styles.conceptsCell, styles.colPrecio, styles.conceptsCellRight]}>{bill.feePrice},00</Text>
                    <Text style={[styles.conceptsCell, styles.colImporte, styles.conceptsCellRight]}>{bill.feePrice},00</Text>
                </View>

                {/* Excedentes */}
                <View style={styles.conceptsRow}>
                    <Text style={[styles.conceptsCell, styles.colRubro]}>02</Text>
                    <Text style={[styles.conceptsCell, styles.colConcepto, styles.conceptsCellLeft]}>Excedentes servicio medido (En metros cúbicos)</Text>
                    <Text style={[styles.conceptsCell, styles.colCant]}>{bill.surplus}</Text>
                    <Text style={[styles.conceptsCell, styles.colPrecio, styles.conceptsCellRight]}>{bill.feeSurplusChargePerUnit},00</Text>
                    <Text style={[styles.conceptsCell, styles.colImporte, styles.conceptsCellRight]}>{bill.surplusPrice},00</Text>
                </View>

                {/* Otros conceptos */}
                {conceptos.map((concepto, index) => {
                    const detail = bill.details.find(d =>
                        d.billingParameterName.toLowerCase() === concepto.toLowerCase()
                    );
                    const codigo = String(3 + index).padStart(2, '0');

                    return (
                        <View key={codigo} style={styles.conceptsRow}>
                            <Text style={[styles.conceptsCell, styles.colRubro]}>{codigo}</Text>
                            <Text style={[styles.conceptsCell, styles.colConcepto, styles.conceptsCellLeft]}>{concepto}</Text>
                            <Text style={[styles.conceptsCell, styles.colCant]}>0</Text>
                            <Text style={[styles.conceptsCell, styles.colPrecio, styles.conceptsCellRight]}>
                                {formatNumber(detail?.value || 0)}
                            </Text>
                            <Text style={[styles.conceptsCell, styles.colImporte, styles.conceptsCellRight]}>
                                {formatNumber(detail?.value || 0)}
                            </Text>
                        </View>
                    );
                })}

                {/* Descuentos */}
                <View style={styles.conceptsRow}>
                    <Text style={[styles.conceptsCell, styles.colRubro]}>10</Text>
                    <Text style={[styles.conceptsCell, styles.colConcepto, styles.conceptsCellLeft]}>Descuentos</Text>
                    <Text style={[styles.conceptsCell, styles.colCant]}>{bill.discountCounter}</Text>
                    <Text style={[styles.conceptsCell, styles.colPrecio, styles.conceptsCellRight]}>0,00</Text>
                    <Text style={[styles.conceptsCell, styles.colImporte, styles.conceptsCellRight]}>{bill.totalDiscounts},00</Text>
                </View>
            </View>
        </View>
    );
};

// ============================================================================
// COMPONENTES - DEBT SUMMARY (Resumen de Deuda)
// ============================================================================

const DebtSummary = ({ bill }: { bill: BillDetailsDto }) => (
    <View style={styles.summarySection}>
        <View style={styles.summaryTable}>
            {/* Fila 1 - Resumen + Subtotal */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLeftCell}>
                    <Text style={styles.bold}>RESUMEN DE DEUDA AL: </Text>{formatDate(bill.dateRegister)}
                </Text>
                <Text style={styles.summaryLabelCell}>SUBTOTAL</Text>
                <Text style={styles.summaryValueCell}>$ {bill.subTotal}</Text>
            </View>

            {/* Fila 2 - Deuda + IVA 21% */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLeftCell}>
                    {bill.amountUnpaidInvoices > 0
                        ? `Señor Usuario: A dicha fecha Ud. registra un monto pendiente de pago de $ ${bill.amountUnpaidInvoices}`
                        : 'Señor Usuario: A dicha fecha Ud. no registra conceptos facturados pendientes de pago.'}
                </Text>
                <Text style={styles.summaryLabelCell}>IVA 21,00 %</Text>
                <Text style={styles.summaryValueCell}>$ {bill.iva}</Text>
            </View>

            {/* Fila 3 - Pague en término + IVA RNI */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLeftCell}>PAGUE EN TÉRMINO. EVITE INCONVENIENTES</Text>
                <Text style={styles.summaryLabelCell}>IVA R.N.I. 10.50 %</Text>
                <Text style={styles.summaryValueCell}>$ 0,00</Text>
            </View>

            {/* Fila 4 - Bimestres + Descuento */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLeftCell}>CANTIDAD DE BIMESTRES IMPAGOS HASTA LA FECHA: 0</Text>
                <Text style={styles.summaryLabelCell}>Descuento</Text>
                <Text style={styles.summaryValueCell}>- $ {bill.totalDiscounts}</Text>
            </View>

            {/* Fila 5 - Cuenta Bancaria + Total */}
            <View style={styles.summaryRow}>
                <Text style={styles.summaryLeftCell}>CUENTA BANCARIA. Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45</Text>
                <Text style={styles.summaryLabelCell}>TOTAL A PAGAR</Text>
                <Text style={styles.summaryValueCell}>$ {bill.total}</Text>
            </View>

            {/* Fila 6 - Son Pesos */}
            <View style={styles.summaryFullRow}>
                <Text style={styles.summaryFullCell}>
                    Son Pesos: <Text style={styles.bold}>{convertNumberToWords(bill.total)}</Text>
                </Text>
            </View>

            {/* Fila 7 - Monto Vencido */}
            <View style={styles.summaryFullRow}>
                <Text style={styles.summaryFullCell}>
                    PASADA LA FECHA DE VENCIMIENTO DEBERA PAGAR: <Text style={styles.bold}>$ {bill.maturityAmount}</Text>
                </Text>
            </View>
        </View>
    </View>
);

// ============================================================================
// COMPONENTES - NOTES SECTION (Notas Finales)
// ============================================================================

const NotesSection = () => (
    <View style={styles.notesSection}>
        <Text style={styles.notesText}>
            RECUERDE USUARIO QUE CUANDO TENGA UNA BOLETA VENCIDA CORRE EL RIESGO QUE EL CONSORCIO LE SUSPENDA EL SERVICIO DE AGUA POTABLE, Y LUEGO DEBA REALIZAR UNA RECONEXIÓN DEL SERVICIO.
        </Text>
        <Text style={styles.notesTextBold}>
            CBU 0110438120043811503456 consorcio Vecinal de agua potable santa María de Oro. ALIAS: BOMBO.PRIMO.NUDO
        </Text>
        <Text style={styles.notesTextBold}>
            RESTRICCIÓN DE USOS DEL AGUA POTABLE DE 8 A 20HS. Está prohibido utilizar agua potable para regar jardines, calles, lavar veredas, autos y llenar pileta. Disposición de DIRCAS para que no le aplique multa por derroche. Hagamos un uso responsable
        </Text>

        <View style={styles.notesBottom}>
            {/* Categorías */}
            <View style={styles.categoriesCol}>
                <Text style={styles.categoryText}>Cat. 1 - Unidad Simple</Text>
                <Text style={styles.categoryText}>Cat. 2 - Unidad Doble</Text>
                <Text style={styles.categoryText}>Cat. 3 - Industrial</Text>
                <Text style={styles.categoryText}>Cat. 4 - Grandes consumidores</Text>
            </View>

            {/* Reclamos */}
            <View style={styles.reclamosCol}>
                <Text style={styles.reclamosTitle}>Reclamos en 2a. Instancia</Text>
                <View style={styles.reclamosTable}>
                    <Text style={styles.reclamosCell}>Comuníquese al Centro de Atención al Usuario</Text>
                    <Text style={styles.reclamosCell}>EL ENTE REGULADOR PROTEGE SUS DERECHOS</Text>
                    <Text style={styles.reclamosCell}>Comunicarse al Centro de Atención al Usuario</Text>
                    <Text style={styles.reclamosCell}>correo: dircas@irrigacion.gov.ar</Text>
                </View>
            </View>
        </View>
    </View>
);

// ============================================================================
// COMPONENTES - BEAD SECTION (Talones)
// ============================================================================

const BeadTicket = ({ bill, user, footer }: SingleBillProps & { footer: string }) => (
    <View style={styles.beadTicket}>
        <View style={styles.beadInner}>
            {/* Header */}
            <View style={styles.beadHeader}>
                <Text style={styles.beadHeaderTitle}>Consorcio Vecinal de Agua Potable</Text>
                <Text style={styles.beadHeaderSubtitle}>Santa María de Oro</Text>
                <Text style={styles.beadHeaderCuit}>
                    <Text style={styles.bold}>C.U.I.T. NRO: </Text>30-65481347-3
                </Text>
            </View>

            {/* Info en 2 columnas */}
            <View style={styles.beadInfoSection}>
                <View style={styles.beadInfoCol}>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Factura Nº: </Text>0001-{bill.idBill}</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>N° Conexión: </Text>{user.idUser}</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Cliente: </Text>{user.firstName} {user.lastName}</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Periodo: </Text>{bill.periodName}</Text>
                </View>
                <View style={styles.beadInfoCol}>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Consumidor final</Text></Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Consumo: </Text>{bill.consumption}m³</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Monto deuda: </Text>${bill.amountUnpaidInvoices}</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Fecha de Emisión: </Text>{formatDate(bill.dateRegister)}</Text>
                    <Text style={styles.beadInfoText}><Text style={styles.bold}>Fecha de vencimiento: </Text>{formatDate(bill.expirationDate)}</Text>
                </View>
            </View>

            {/* Totales */}
            <View style={styles.beadTotalsSection}>
                <View style={styles.beadTotalsTable}>
                    <View style={styles.beadTotalCell}>
                        <Text style={styles.beadTotalLabel}>IMP. SERVICIO</Text>
                        <Text style={styles.beadTotalValue}>$ {bill.subTotal}</Text>
                    </View>
                    <View style={styles.beadTotalCell}>
                        <Text style={styles.beadTotalLabel}>I.V.A.</Text>
                        <Text style={styles.beadTotalValue}>$ {bill.iva}</Text>
                    </View>
                    <View style={styles.beadTotalCell}>
                        <Text style={styles.beadTotalLabel}>DESCUENTO</Text>
                        <Text style={styles.beadTotalValue}>- $ {bill.totalDiscounts}</Text>
                    </View>
                    <View style={styles.beadTotalCell}>
                        <Text style={styles.beadTotalLabel}>TOTAL</Text>
                        <Text style={styles.beadTotalValue}>$ {bill.total}</Text>
                    </View>
                    <View style={styles.beadTotalCell}>
                        <Text style={styles.beadTotalLabel}>T. VENCIDA</Text>
                        <Text style={styles.beadTotalValue}>$ {bill.maturityAmount}</Text>
                    </View>
                </View>
            </View>
        </View>
        <Text style={styles.beadFooterText}>{footer}</Text>
    </View>
);

const BeadSection = ({ bill, user }: SingleBillProps) => (
    <View style={styles.beadSection}>
        <BeadTicket bill={bill} user={user} footer="TALON PARA EL OPERADOR-FIRMA Y SELLO AL DORSO" />
        <BeadTicket bill={bill} user={user} footer="TALON PARA EL BANCO-FIRMA Y SELLO AL DORSO" />
    </View>
);

// ============================================================================
// COMPONENTE PRINCIPAL - PÁGINA DE FACTURA
// ============================================================================

const BillPage = ({ bill, user }: SingleBillProps) => (
    <Page size="A4" style={styles.page}>
        <Header bill={bill} user={user} />
        <View style={styles.readingSection}>
            <ReadingDetailsTable1 bill={bill} user={user} />
            <ReadingDetailsTable2 bill={bill} />
        </View>
        <BillingConcepts bill={bill} />
        <DebtSummary bill={bill} />
        <NotesSection />
        <BeadSection bill={bill} user={user} />
    </Page>
);

// ============================================================================
// DOCUMENTO PDF - EXPORTACIÓN PRINCIPAL
// ============================================================================

const BillPdfDocument = ({ bills }: BillPdfProps) => (
    <Document
        title="Facturas Consorcio de Agua"
        author="Consorcio Vecinal de Agua Potable - Santa María de Oro"
        subject="Facturas de servicio de agua potable"
        creator="Sistema de Gestión Trinity"
    >
        {bills.map(({ bill, user }, index) => (
            <BillPage key={`bill-${bill.idBill}-${index}`} bill={bill} user={user} />
        ))}
    </Document>
);

export default BillPdfDocument;
