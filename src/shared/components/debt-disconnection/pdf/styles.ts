import { StyleSheet } from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 8,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },
    // Contenedores del encabezado (Disconnection)
    headerBox: {
        border: '1px solid #000',
        padding: 8,
        marginBottom: 15,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    headerText: {
        fontSize: 8,
        textAlign: 'center',
        marginBottom: 2,
    },
    // Contenedores del encabezado en fila (Debt)
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    logoContainer: {
        width: '45%',
    },
    logoTextBold: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#000',
        lineHeight: 1.2,
    },
    logoTextSub: {
        fontSize: 9,
        fontFamily: 'Helvetica',
        color: '#333',
        marginTop: 2,
    },
    headerRightBox: {
        width: '50%',
        border: '1px solid #000',
        padding: 6,
        alignItems: 'center',
    },
    headerRightText: {
        fontSize: 8,
        fontFamily: 'Helvetica',
        marginBottom: 2,
        textAlign: 'center',
    },
    headerRightTextBold: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
    },
    // Fila de título y fecha alineados
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        borderBottom: '1px solid #ccc',
        paddingBottom: 4,
    },
    titleLeft: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    dateRight: {
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    // Título principal centrado
    title: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginVertical: 12,
        textTransform: 'uppercase',
    },
    // Contenedor de la fecha
    dateText: {
        textAlign: 'right',
        fontSize: 8,
        marginBottom: 5,
        paddingRight: 5,
    },
    // Estilos de la Tabla (Común)
    table: {
        width: '100%',
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
        marginBottom: 15,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeaderCell: {
        padding: 5,
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        textTransform: 'uppercase',
        backgroundColor: '#F3F4F6',
    },
    tableCell: {
        padding: 5,
        textAlign: 'center',
        fontSize: 8,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        textTransform: 'uppercase',
    },
    colUsuario: {
        width: '20%',
    },
    colNombre: {
        width: '40%',
    },
    colDomicilio: {
        width: '40%',
    },
    // Columnas de grilla de deuda bimestral
    colGridAnio: {
        width: '16%',
    },
    colGridBimestre: {
        width: '14%',
    },
    // Texto explicativo e intereses
    infoLine: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        marginVertical: 8,
        textTransform: 'uppercase',
    },
    expensesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
        paddingHorizontal: 5,
    },
    expensesText: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
    },
    // Contenedor destacado para la intimación
    alertBox: {
        backgroundColor: '#FFFBEB',
        borderLeft: '3px solid #D97706',
        padding: 8,
        marginVertical: 10,
    },
    alertText: {
        fontSize: 8.5,
        lineHeight: 1.4,
        textAlign: 'justify',
    },
    // Párrafos del cuerpo
    bodyText: {
        fontSize: 8,
        lineHeight: 1.4,
        textAlign: 'justify',
        marginBottom: 8,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    phoneText: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    // Sección importante
    importantSection: {
        marginVertical: 10,
        alignItems: 'center',
    },
    importantTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
        marginBottom: 4,
        textAlign: 'center',
    },
    importantText: {
        fontSize: 8,
        lineHeight: 1.4,
        textAlign: 'justify',
    },
    // Firmas
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 40,
        paddingHorizontal: 10,
    },
    footerColumn: {
        width: '45%',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 25,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    dottedLine: {
        width: '100%',
        borderBottom: '1px dotted #000',
        marginBottom: 4,
    },
    footerText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    footerSubText: {
        fontSize: 7.5,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    // Nota al pie extrema
    bottomNotice: {
        borderTop: '1px solid #ccc',
        marginTop: 25,
        paddingTop: 5,
        fontSize: 7.5,
        fontFamily: 'Helvetica-Oblique',
        textAlign: 'center',
        textTransform: 'uppercase',
    }
});
