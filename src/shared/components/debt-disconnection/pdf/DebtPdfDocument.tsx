import { Document, Page, View, Text, Font } from '@react-pdf/renderer';
import { UserDto } from '../../../../core/models/dto/UserDto';
import { styles } from './styles';

Font.registerHyphenationCallback(word => [word]);

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface DebtPdfProps {
    debts: Array<{
        user: UserDto;
        date?: string | Date;
        periodsOwed?: number;
    }>;
}

// ============================================================================
// UTILIDADES
// ============================================================================

const formatDate = (dateInput?: Date | string): string => {
    const d = dateInput
        ? (typeof dateInput === 'string' ? new Date(dateInput) : dateInput)
        : new Date();
    return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
};

const formatNumber = (value: number): string => {
    return value.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const getDebtGridData = (periodsOwed: number) => {
    const grid2025 = {
        'ENER/FEBR': 0,
        'MAR/ABR': 0,
        'MAYO/JUN': 0,
        'JULIO/AGOS': 0,
        'SEP/OCT': 0,
        'NOV/DIC': 0
    };

    const grid2024 = {
        'ENER/FEBR': 0,
        'MAR/ABR': 0,
        'MAYO/JUN': 0,
        'JULIO/AGOS': 0,
        'SEP/OCT': 0,
        'NOV/DIC': 0
    };

    let totalAmount = 0;

    // Distribución simulada para que coincida visualmente con el tipo de deuda
    if (periodsOwed === 1) {
        grid2025['JULIO/AGOS'] = 25500.00;
        totalAmount = 25500.00;
    } else if (periodsOwed === 2) {
        grid2025['MAYO/JUN'] = 12000.00;
        grid2025['JULIO/AGOS'] = 13500.00;
        totalAmount = 25500.00;
    } else if (periodsOwed >= 3) {
        grid2025['MAR/ABR'] = 10000.00;
        grid2025['MAYO/JUN'] = 12000.00;
        grid2025['JULIO/AGOS'] = 13500.00;
        totalAmount = 35500.00;
    }

    return { grid2025, grid2024, totalAmount };
};

// ============================================================================
// COMPONENTE DE PÁGINA INDIVIDUAL - INTIMACIÓN
// ============================================================================

const DebtPage = ({ user, date, periodsOwed = 1 }: { user: UserDto; date?: string | Date; periodsOwed?: number }) => {
    const userFullName = `${user.lastName} ${user.firstName}`.toUpperCase();
    const domicile = `${user.residenceDto?.street || ''} ${user.residenceDto?.number || ''}`.trim() || 'SIN DOMICILIO';

    const { grid2025, grid2024, totalAmount } = getDebtGridData(periodsOwed);
    const administrativeExpenses = 1000.00;
    const finalTotal = totalAmount + administrativeExpenses;

    return (
        <Page size="A4" style={styles.page}>
            {/* Encabezado: Logo Izquierda, Cuadro Derecho */}
            <View style={styles.headerRow}>
                <View style={styles.logoContainer}>
                    <Text style={styles.logoTextBold}>Consorcio de</Text>
                    <Text style={styles.logoTextBold}>agua potable</Text>
                    <Text style={styles.logoTextBold}>Santa Maria</Text>
                    <Text style={styles.logoTextBold}>de Oro</Text>
                    <Text style={styles.logoTextSub}>GESTIÓN DE AGUA VECINAL</Text>
                </View>
                <View style={styles.headerRightBox}>
                    <Text style={styles.headerRightTextBold}>LINIERS S/N   SANTA MARIA DE ORO</Text>
                    <Text style={styles.headerRightText}>C.P. 5577  -RVIA.- MZA</Text>
                    <Text style={styles.headerRightTextBold}>C.U.I.T. NRO: 30-65481347-3</Text>
                </View>
            </View>

            {/* Título de la Intimación y Fecha */}
            <View style={styles.titleRow}>
                <Text style={styles.titleLeft}>INTIMACIÓN DE CORTE DE SERVICIO</Text>
                <Text style={styles.dateRight}>{formatDate(date)}</Text>
            </View>

            {/* Tabla del Usuario Notificado */}
            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableHeaderCell, styles.colUsuario]}>USUARIO</Text>
                    <Text style={[styles.tableHeaderCell, styles.colNombre]}>APELLIDO Y NOMBRE</Text>
                    <Text style={[styles.tableHeaderCell, styles.colDomicilio]}>DOMICILIO</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colUsuario]}>{user.idUser}</Text>
                    <Text style={[styles.tableCell, styles.colNombre]}>{userFullName}</Text>
                    <Text style={[styles.tableCell, styles.colDomicilio]}>{domicile.toUpperCase()}</Text>
                </View>
            </View>

            {/* Línea Informativa */}
            <Text style={styles.infoLine}>
                ATENTO QUE SEGÚN NUESTROS REGISTROS SE ENCUENTRA AL DÍA DE LA FECHA IMPAGOS LOS PERÍODOS
            </Text>

            {/* Grilla Bimestral de Períodos de Deuda */}
            <View style={styles.table}>
                {/* Cabecera */}
                <View style={styles.tableRow}>
                    <Text style={[styles.tableHeaderCell, styles.colGridAnio]}>AÑO</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>ENER/FEBR</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>MAR/ABR</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>MAYO/JUN</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>JULIO/AGOS</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>SEP/OCT</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGridBimestre]}>NOV/DIC</Text>
                </View>
                {/* Fila 2025 */}
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colGridAnio, styles.bold]}>2025</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['ENER/FEBR'] > 0 ? `$ ${formatNumber(grid2025['ENER/FEBR'])}` : '-'}</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['MAR/ABR'] > 0 ? `$ ${formatNumber(grid2025['MAR/ABR'])}` : '-'}</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['MAYO/JUN'] > 0 ? `$ ${formatNumber(grid2025['MAYO/JUN'])}` : '-'}</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['JULIO/AGOS'] > 0 ? `$ ${formatNumber(grid2025['JULIO/AGOS'])}` : '-'}</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['SEP/OCT'] > 0 ? `$ ${formatNumber(grid2025['SEP/OCT'])}` : '-'}</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>{grid2025['NOV/DIC'] > 0 ? `$ ${formatNumber(grid2025['NOV/DIC'])}` : '-'}</Text>
                </View>
                {/* Fila 2024 */}
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colGridAnio, styles.bold]}>2024</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                    <Text style={[styles.tableCell, styles.colGridBimestre]}>-</Text>
                </View>
            </View>

            {/* Intereses y Gastos */}
            <View style={styles.expensesRow}>
                <Text style={styles.expensesText}>INTERESES Y GASTOS ADMINISTRATIVO</Text>
                <Text style={styles.expensesText}>$ ... {formatNumber(administrativeExpenses)}</Text>
            </View>

            {/* Alerta de Intimación de Pago */}
            <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                    <Text style={styles.bold}>POR LA PRESTACIÓN DEL SERVICIO DE AGUA POTABLE, SUMA TOTAL QUE ASCIENDE A PESOS </Text>
                    <Text style={styles.bold}>$ {formatNumber(finalTotal)}</Text> ...SE LE <Text style={styles.bold}>INTIMA</Text> PARA QUE EN UN TÉRMINO PERENTORIO E IMPRORROGABLE DE <Text style={styles.bold}>05 (CINCO) DÍAS CORRIDOS</Text> A PARTIR DE LA NOTIFICACIÓN DE LA PRESENTE, PROCEDA A CANCELAR LA TOTALIDAD DE LAS SUMAS ANTES INDICADAS, CON MAS LOS INTERESES QUE CORRESPONDAN DESDE LA FECHA DEL VENCIMIENTO HASTA EL EFECTIVO PAGO CON MAS LOS GASTOS; TODO ELLO BAJO APERCIMIENTO DE PROCEDER SIN MAS A LA SUSPENSIÓN TOTAL DEL SERVICIO DE AGUA POTABLE.
                </Text>
            </View>

            {/* Artículos Legales Ley 6044 */}
            <View>
                <Text style={styles.bodyText}>
                    SE DEJA CONSTANCIA, QUE SE PROCEDE CONFORME LAS FACULTADES Y ATRIBUCIONES CONFERIDAS POR EL ARTÍCULO 1º DE LA LEY 6511, MODIFICATORIO DEL ARTÍCULO 20º DE LA LEY 6044, QUE EXPRESA:
                </Text>
                <Text style={styles.bodyText}>
                    <Text style={styles.bold}>ARTICULO 20º RESTRICCIÓN Y SUSPENSIÓN.</Text> PODRA RESTRINGIRSE TRANSITORIAMENTE EL SERVICIO PARA USOS DOMÉSTICOS CUANDO SE HAYA PRODUCIDO EL VENCIMIENTO DE UNA FACTURA O HAYAN TRANSCURRIDO MAS DE 10 (DIEZ) DÍAS DESDE EL VENCIMIENTO ORIGINAL DE LA PRIMERA DE ELLAS O VENCIDO, IGUAL TÉRMINO DESDE EL AVISO PARA EL PAGO DE CONTRIBUCIONES DE MEJORAS, MULTAS Y LIQUIDACIONES ORIGINADAS EN LA PRESTACIÓN EN CUALQUIERA DE LOS SERVICIOS A TAL EFECTO EN CADA FACTURA QUE SE EMITA PARA EL COBRO NORMAL DE LOS SERVICIOS, SE DEBERÁ COMUNICAR LOS IMPORTES ADEUDADOS, LOS RECARGOS CORRESPONDIENTES Y LAS CONSECUENCIAS DE FALTA DE PAGO EN TÉRMINO.
                </Text>
                <Text style={styles.bodyText}>
                    PODRA SUSPENDERSE EL SERVICIO PARA USO DOMÉSTICO; O CORRIDO EL VENCIMIENTO IMPAGO Y TRASCURRIDOS 10 (DIEZ) DÍAS DEL VENCIMIENTO DEL PLAZO EN EL PÁRRAFO ANTERIOR.
                </Text>
                <Text style={styles.bodyText}>
                    PROCEDERÁ, PREVIA NOTIFICACIÓN FEHACIENTE, LA SUSPENSIÓN DEL SERVICIO A USUARIOS INDUSTRIALES Y COMERCIALES, CUANDO SE ENCUENTRE IMPAGA UNA FACTURA Y HAYAN TRANSCURRIDO 10 (DIEZ) DÍAS DE SU VENCIMIENTO ORIGINAL. EN TODOS LOS CASOS; EL RESTABLECIMIENTO DEL SERVICIO TENDRA UN VALOR <Text style={styles.bold}>$ 3.000,00</Text> SE HARÁ EN UN LAPSO DE 48 HS UNA VEZ ABONADAS LAS DEUDAS.
                </Text>
            </View>

            {/* Reclamos, CBU y Datos Bancarios */}
            <View style={{ marginTop: 8, borderTop: '1px solid #ccc', paddingTop: 6 }}>
                <Text style={styles.bodyText}>
                    Reclamos y sugerencias al cel <Text style={styles.bold}>2635036918</Text> lunes a viernes de 8hs a 11:30hs por mensaje de WhatsApp.
                </Text>
                <Text style={styles.bodyText}>
                    <Text style={styles.bold}>CBU 0110438120043811503456</Text> consorcio Vecinal de agua potable santa María de Oro. <Text style={styles.bold}>ALIAS : BOMBO.PRIMO.NUDO</Text>
                </Text>
            </View>

            {/* Sección de Firmas / Cargo */}
            <View style={styles.footerSection}>
                <View style={styles.footerColumn}>
                    <Text style={[styles.footerLabel, { textAlign: 'left', width: '100%' }]}>ATTE.</Text>
                    <View style={styles.dottedLine} />
                    <Text style={styles.footerText}>CONSORCIO DE AGUA POTABLE</Text>
                    <Text style={styles.footerSubText}>DE SANTA MARIA DE ORO</Text>
                </View>
                <View style={styles.footerColumn}>
                    <Text style={styles.footerLabel}>CONSTANCIA DE RECEPCIÓN</Text>
                    <View style={styles.dottedLine} />
                    <View style={[styles.dottedLine, { marginTop: 10 }]} />
                </View>
            </View>

            {/* Domicilio de Pago al Pie */}
            <Text style={styles.bottomNotice}>
                DICHA INTIMACIÓN PODRÁ ABONARLA EN LA OFICINA DE PAGO EN LA SEDE, UBICADO EN CALLE LINIERS S/N Y V. VILLANUEVA LOS DÍAS SÁBADOS EN HORARIO DE 8 A 12:30HS
            </Text>
        </Page>
    );
};

// ============================================================================
// DOCUMENTO PRINCIPAL
// ============================================================================

const DebtPdfDocument = ({ debts }: DebtPdfProps) => (
    <Document
        title="Cuadros de Aviso de Deuda"
        author="Consorcio Vecinal de Agua Potable - Santa María de Oro"
        subject="Aviso de deuda pendiente"
        creator="Sistema de Gestión Trinity"
    >
        {debts.map(({ user, date, periodsOwed }, index) => (
            <DebtPage key={`debt-notice-${user.idUser}-${index}`} user={user} date={date} periodsOwed={periodsOwed} />
        ))}
    </Document>
);

export default DebtPdfDocument;
