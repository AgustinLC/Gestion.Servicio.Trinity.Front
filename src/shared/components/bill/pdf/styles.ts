import { StyleSheet } from '@react-pdf/renderer';

// ============================================================================
// ESTILOS PRINCIPALES - Factura PDF (@react-pdf/renderer)
// ============================================================================

export const styles = StyleSheet.create({
    // ========================================================================
    // PÁGINA Y CONTENEDOR
    // ========================================================================
    page: {
        padding: 20,
        fontSize: 9,
        fontFamily: 'Helvetica',
        backgroundColor: '#FFFFFF',
    },

    // ========================================================================
    // HEADER - Encabezado con info del consorcio y usuario
    // ========================================================================
    header: {
        flexDirection: 'row',
        marginBottom: 5,
        paddingBottom: 2,
    },

    // Info del Consorcio (izquierda)
    consortiumInfo: {
        flex: 1,
        border: '1px solid #000',
        padding: 5,
    },
    consortiumTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 3,
    },
    consortiumText: {
        textAlign: 'center',
        marginBottom: 1,
    },
    consortiumTextBold: {
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        marginBottom: 1,
    },

    // Info del Usuario (derecha)
    userInfo: {
        flex: 1,
        border: '1px solid #000',
        borderLeft: 'none',
    },
    userInfoTable: {
        width: '100%',
    },
    userInfoRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000',
    },
    userInfoRowNoBorder: {
        flexDirection: 'row',
    },
    userInfoLabel: {
        width: '50%',
        padding: 2,
        fontFamily: 'Helvetica-Bold',
    },
    userInfoValue: {
        width: '50%',
        padding: 2,
    },

    // ========================================================================
    // READING DETAILS - Tablas de lectura
    // ========================================================================
    readingSection: {
        marginBottom: 5,
    },

    // Primera tabla (Usuario, Periodo, Vencimiento)
    readingTable1: {
        width: '100%',
        marginBottom: 0,
    },
    readingTable1HeaderRow: {
        flexDirection: 'row',
    },
    readingTable1BodyRow: {
        flexDirection: 'row',
    },

    // Segunda tabla (Medidor, Lecturas)
    readingTable2: {
        width: '100%',
    },
    readingTable2Row: {
        flexDirection: 'row',
    },

    // Celdas genéricas de lectura
    readingCell: {
        padding: 2,
        textAlign: 'center',
        fontSize: 8,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
    },
    readingCellFirst: {
        borderLeft: '1px solid #000',
    },
    readingCellTop: {
        borderTop: '1px solid #000',
    },
    readingCellBold: {
        fontFamily: 'Helvetica-Bold',
    },

    // ========================================================================
    // BILLING CONCEPTS - Conceptos Facturados
    // ========================================================================
    conceptsSection: {
        marginBottom: 5,
    },
    conceptsTable: {
        width: '100%',
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
    },
    conceptsHeaderRow: {
        flexDirection: 'row',
    },
    conceptsRow: {
        flexDirection: 'row',
    },
    conceptsCell: {
        padding: 2,
        textAlign: 'center',
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
        fontSize: 8,
    },
    conceptsCellHeader: {
        fontFamily: 'Helvetica-Bold',
    },
    conceptsCellLeft: {
        textAlign: 'left',
    },
    conceptsCellRight: {
        textAlign: 'right',
    },
    // Anchos de columnas de conceptos
    colRubro: { width: '8%' },
    colConcepto: { width: '42%' },
    colCant: { width: '10%' },
    colPrecio: { width: '20%' },
    colImporte: { width: '20%' },

    // ========================================================================
    // DEBT SUMMARY - Resumen de Deuda
    // ========================================================================
    summarySection: {
        marginBottom: 10,
    },
    summaryTable: {
        width: '100%',
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryTotalRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    summaryLeftCell: {
        width: '55%',
        padding: 2,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        fontSize: 8,
    },
    summaryLabelCell: {
        width: '22.5%',
        padding: 2,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
    },
    summaryValueCell: {
        width: '22.5%',
        padding: 2,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        textAlign: 'right',
        fontSize: 8,
    },
    summaryLeftCellView: {
        width: '55%',
        padding: 4,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        justifyContent: 'center',
    },
    summarySideCellView: {
        width: '22.5%',
        padding: 4,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        justifyContent: 'center',
    },
    summaryDebtCellView: {
        width: '55%',
        padding: 4,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
    },
    summaryDebtText: {
        fontSize: 9,
    },
    summaryDebtAmountText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginTop: 2,
    },
    summarySideLabelText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    summarySideValueText: {
        fontSize: 8,
        textAlign: 'right',
    },
    summaryTotalLabelView: {
        width: '22.5%',
        padding: 4,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
    },
    summaryTotalValueView: {
        width: '22.5%',
        padding: 4,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        backgroundColor: '#E8E8E8',
        justifyContent: 'center',
    },
    summaryTotalText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },
    summaryTotalValueText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'right',
    },
    highlightAmount: {
        fontFamily: 'Helvetica-Bold',
    },
    summaryFullRow: {
        flexDirection: 'row',
    },
    summaryFullCell: {
        width: '100%',
        padding: 2,
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        textAlign: 'right',
        fontSize: 8,
    },

    // ========================================================================
    // NOTES SECTION - Notas Finales
    // ========================================================================
    notesSection: {
        border: '1px solid #000',
        paddingTop: 2,
        paddingHorizontal: 5,
        marginBottom: 5,
    },
    notesText: {
        textAlign: 'center',
        marginBottom: 1,
        fontSize: 8,
    },
    notesTextBold: {
        textAlign: 'center',
        marginBottom: 1,
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    notesBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 3,
        paddingBottom: 3,
    },
    categoriesCol: {
        width: '35%',
    },
    categoryText: {
        fontSize: 8,
        marginBottom: 1,
    },
    reclamosCol: {
        width: '50%',
    },
    reclamosTitle: {
        textAlign: 'center',
        fontSize: 8,
        marginBottom: 2,
    },
    reclamosTable: {
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
    },
    reclamosCell: {
        borderBottom: '1px solid #000',
        borderRight: '1px solid #000',
        padding: 2,
        textAlign: 'center',
        fontSize: 7,
    },

    // ========================================================================
    // BEAD SECTION - Talones
    // ========================================================================
    beadSection: {
        flexDirection: 'row',
        marginTop: 5,
    },
    beadTicket: {
        width: '50%',
        paddingHorizontal: 1,
    },
    beadInner: {
        border: '1px solid #000',
    },

    // Header del talón
    beadHeader: {
        padding: 5,
        textAlign: 'center',
        borderBottom: '1px solid #000',
    },
    beadHeaderTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 1,
    },
    beadHeaderSubtitle: {
        fontSize: 8,
        marginBottom: 1,
    },
    beadHeaderCuit: {
        fontSize: 8,
        marginTop: 2,
    },

    // Info del talón (2 columnas)
    beadInfoSection: {
        flexDirection: 'row',
    },
    beadInfoCol: {
        width: '50%',
        padding: 5,
    },
    beadInfoText: {
        fontSize: 7,
        marginBottom: 2,
    },

    // Totales del talón
    beadTotalsSection: {
        padding: 5,
        borderTop: '1px solid #000',
    },
    beadTotalsTable: {
        flexDirection: 'row',
        borderTop: '1px solid #000',
        borderLeft: '1px solid #000',
        borderBottom: '1px solid #000',
    },
    beadTotalCell: {
        flex: 1,
        padding: 2,
        textAlign: 'center',
        borderRight: '1px solid #000',
    },
    beadTotalLabel: {
        fontSize: 6,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    beadTotalValue: {
        fontSize: 7,
    },
    beadTotalValueHighlight: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
    },
    beadDebtAmount: {
        fontFamily: 'Helvetica-Bold',
    },

    // Footer del talón
    beadFooterText: {
        textAlign: 'center',
        fontFamily: 'Helvetica-Bold',
        fontSize: 7,
        marginTop: 3,
        paddingBottom: 2,
    },

    // ========================================================================
    // UTILIDADES
    // ========================================================================
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    textCenter: {
        textAlign: 'center',
    },
    textRight: {
        textAlign: 'right',
    },
    textLeft: {
        textAlign: 'left',
    },
});
