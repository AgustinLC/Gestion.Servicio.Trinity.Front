import { Document, Page, View, Text, Font } from '@react-pdf/renderer';
import { UserDto } from '../../../../core/models/dto/UserDto';
import { styles } from './styles';

// ============================================================================
// CONFIGURACIÓN DE FUENTES - Deshabilitar silabación
// ============================================================================
Font.registerHyphenationCallback(word => [word]);

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

export interface DisconnectionPdfProps {
    disconnections: Array<{
        user: UserDto;
        date?: string | Date;
    }>;
}

interface SingleDisconnectionProps {
    user: UserDto;
    date?: string | Date;
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

// ============================================================================
// COMPONENTES DE LA PÁGINA
// ============================================================================

const HeaderBox = () => (
    <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>CONSORCIO VECINAL DE AGUA POTABLE SANTA MARIA DE ORO</Text>
        <Text style={styles.headerText}>LINIERS S/N SANTA MARIA DE ORO C.P 5577 -RVIA.-</Text>
        <Text style={styles.headerText}>MZA C.U.I.T. NRO: 30-65481347-3</Text>
    </View>
);

const Title = () => (
    <Text style={styles.title}>ORDEN DE CORTE DE SERVICIO DE AGUA POTABLE</Text>
);

const DateLine = ({ date }: { date?: string | Date }) => (
    <Text style={styles.dateText}>{formatDate(date)}</Text>
);

const UserTable = ({ user }: { user: UserDto }) => {
    const userFullName = `${user.lastName} ${user.firstName}`.toUpperCase();
    const domicile = `${user.residenceDto?.street || ''} ${user.residenceDto?.number || ''}`.trim() || 'SIN DOMICILIO';

    return (
        <View style={styles.table}>
            {/* Headers */}
            <View style={styles.tableRow}>
                <Text style={[styles.tableHeaderCell, styles.colUsuario]}>USUARIO</Text>
                <Text style={[styles.tableHeaderCell, styles.colNombre]}>APELLIDO Y NOMBRE</Text>
                <Text style={[styles.tableHeaderCell, styles.colDomicilio]}>DOMICILIO</Text>
            </View>
            {/* Values */}
            <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colUsuario]}>{user.idUser}</Text>
                <Text style={[styles.tableCell, styles.colNombre]}>{userFullName}</Text>
                <Text style={[styles.tableCell, styles.colDomicilio]}>{domicile.toUpperCase()}</Text>
            </View>
        </View>
    );
};

const BodyText = () => (
    <View>
        <Text style={styles.bodyText}>
            POR LA PRESENTE LE COMUNICAMOS QUE EN LA FECHA HEMOS PROCEDIDO AL CORTE DEL SERVICIO AL INMUEBLE DE REFERENCIA.
        </Text>
        <Text style={styles.bodyText}>
            ESTA MEDIDA OBEDECE A LA MOROSIDAD QUE REGISTRA LA CUENTA CORRIENTE CORRESPONDIENTE AL INMUEBLE, CUYO DETALLE FUERA COMUNICADO POR INTIMACION DE CORTE DE FECHA Y EN CADA FACTURAS QUE SE DISTRIBUYE BIMESTRAL CONFORME, LO ESTABLECE EL ART. DE LA LEY 6044.
        </Text>
        <Text style={styles.bodyText}>
            PARA SOLICITAR LA REHABILITACION DEL SERVICIO DEBERA RECURRIR EN EL DOMICILIO SITA EN CALLE VALENTIN VILLANUEVA S/N SANTA MARIA DE ORO RVIA. -MZA..., O CELULAR <Text style={styles.phoneText}>2635036918</Text>, PARA ACORDAR LAS FACTURAS DE LOS PERIODOS VENCIDOS E IMPAGOS DEL SERVICIO.
        </Text>
        <Text style={styles.bodyText}>
            PODRA TENER ACCESO AL SUMINISTRO DE AGUA POTABLE EN LA NUEVA PLAZA DE SANTA MARIA DE ORO Y EN LAS INSTALACIONES DEL CONSORCIO VECINAL, UBICADO EN CALLE VALENTIN VILLANUEVA Y CALLE LINIER DE SANTA MARIA DE ORO RVIA. MZA.
        </Text>
    </View>
);

const ImportantSection = () => (
    <View style={styles.importantSection}>
        <Text style={styles.importantTitle}>IMPORTANTE</Text>
        <Text style={styles.importantText}>
            A PARTIR DE LA FECHA EN CASO DE DETECTAR QUE EL SERVICIO HA SIDO RECONECTADO EN FORMA ILICITA O SIN LA CONSTANCIA DE REHABILITACION REGISTRADA EN NUESTRA INSTITUCION, SE INICIARA LAS ACCIONES LEGALES QUE CORRESPONDAN Y LA GESTION DE COBRO DE LA DEUDA POR ACCION JUDICIAL.
        </Text>
    </View>
);

const FooterSignatures = () => (
    <View style={styles.footerSection}>
        {/* Columna Izquierda: ATT: Consorcio */}
        <View style={styles.footerColumn}>
            <Text style={[styles.footerLabel, { textAlign: 'left', width: '100%' }]}>ATT:</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.footerText}>CONSORCIO DE AGUA</Text>
            <Text style={styles.footerSubText}>COMISION</Text>
        </View>

        {/* Columna Derecha: Constancia de Recepcion */}
        <View style={styles.footerColumn}>
            <Text style={styles.footerLabel}>CONSTANCIA DE RECEPCION</Text>
            <View style={styles.dottedLine} />
            <Text style={styles.footerText}>FIRMA Y ACLARACION</Text>
        </View>
    </View>
);

// ============================================================================
// COMPONENTE PÁGINA INDIVIDUAL
// ============================================================================

const DisconnectionPage = ({ user, date }: SingleDisconnectionProps) => (
    <Page size="A4" style={styles.page}>
        <HeaderBox />
        <Title />
        <DateLine date={date} />
        <UserTable user={user} />
        <BodyText />
        <ImportantSection />
        <FooterSignatures />
    </Page>
);

// ============================================================================
// COMPONENTE PRINCIPAL (EXPORTACIÓN POR DEFECTO)
// ============================================================================

const DisconnectionPdfDocument = ({ disconnections }: DisconnectionPdfProps) => (
    <Document
        title="Avisos de Corte Consorcio de Agua"
        author="Consorcio Vecinal de Agua Potable - Santa María de Oro"
        subject="Orden de corte de servicio de agua potable"
        creator="Sistema de Gestión Trinity"
    >
        {disconnections.map(({ user, date }, index) => (
            <DisconnectionPage key={`disconnection-${user.idUser}-${index}`} user={user} date={date} />
        ))}
    </Document>
);

export default DisconnectionPdfDocument;
