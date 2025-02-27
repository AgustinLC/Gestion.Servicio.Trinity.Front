import { useState, useEffect, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import SearchBar from "../../../shared/components/searcher/SearchBar";
import { addData, getData } from "../../../core/services/apiService";
import { toast } from "react-toastify";
import { UserDto } from "../../../core/models/dto/UserDto";
import { TableColumnDefinition } from "../../../core/models/types/TableTypes";
import ReusableTable from "../../../shared/components/table/ReusableTable";
import BillActiveModal from "./BillActiveModal";
import BillNullModal from "./BillNullModal";
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import ConsorcioInvoice from "../../../shared/components/bill/Bill";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BillManagementPage = () => {
    // Estados existentes
    const [users, setUsers] = useState<UserDto[]>([]);
    const [filteredData, setFilteredData] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showBillActiveModal, setShowBillActiveModal] = useState(false);
    const [showBillNullModal, setShowBillNullModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
    const [isSending, setIsSending] = useState(false);

    // Nuevos estados para PDF
    const [pdfBills, setPdfBills] = useState<BillDetailsDto[]>([]);
    const [pdfLoading, setPdfLoading] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    // Obtener datos al cargar el componente
    useEffect(() => {
        fetchData();
    }, []);

    // Obtener datos de la api
    const fetchData = async () => {
        setLoading(true);
        try {
            const users = await getData<UserDto[]>("/operator/users");
            setUsers(users);
            setFilteredData(users);
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    // Manejar error genérico
    const handleError = (error: unknown) => {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        toast.error(errorMessage);
        setError("Error al cargar la información principal");
    };

    // Manejar búsqueda
    const handleSearch = (query: string) => {
        const filtered = users.filter((user) =>
            Object.values(user).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
        setFilteredData(filtered);
    };

    // Generar PDF
    const handleGeneratePdf = async () => {
        try {
            setPdfLoading(true);
            console.log('[Inicio] Obteniendo facturas...');

            const bills = await getData<BillDetailsDto[]>("/operator/latest-bill/active-users");
            console.log('[Facturas obtenidas]', bills.length);

            if (bills.length === 0) {
                toast.warning("No existen facturas para generar");
                return;
            }

            // Verificar usuarios correspondientes
            const missingUsers = bills.filter(bill =>
                !users.some(user => user.idUser === bill.idUser)
            );
            console.log('[Usuarios faltantes]', missingUsers.length);

            if (missingUsers.length > 0) {
                console.log('[Obteniendo usuarios faltantes]');
                const allUsers = await getData<UserDto[]>("/operator/users");
                setUsers(allUsers);
            }

            // Actualizar estado solo si hay datos válidos
            setPdfBills(bills.filter(bill =>
                users.some(user => user.idUser === bill.idUser)
            ));
        } catch (error) {
            console.error('[Error crítico]', error);
            toast.error("Error en conexión con el servidor");
        } finally {
            setPdfLoading(false);
        }
    };

    // Función para generar y descargar el PDF
    const downloadPdf = async () => {
        if (!componentRef.current) {
            toast.error("No hay contenido para generar el PDF");
            return;
        }

        try {
            const pdf = new jsPDF("p", "mm", "a4");
            const element = componentRef.current;

            // Capturar el contenido HTML como imagen
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            // Añadir la imagen al PDF
            const imgWidth = 210; // Ancho de A4 en mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Dividir la imagen en varias páginas si es necesario
            let position = 0;
            const pageHeight = (imgWidth * 297) / 210; // Altura de A4 en mm

            while (position < imgHeight) {
                pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight);
                position += pageHeight;

                if (position < imgHeight) {
                    pdf.addPage(); // Agregar una nueva página si hay más contenido
                }
            }

            // Descargar el PDF
            pdf.save("facturas_consorcio.pdf");
            toast.success("PDF generado y descargado correctamente");
        } catch (error) {
            console.error('[Error al generar PDF]', error);
            toast.error("Error al generar el PDF");
        }
    };
    
    const handleSendBillNotifications = async () => {
        setIsSending(true);
        try {
            await addData(`/operator/bill/send-notifications`, {});
            toast.success("Envío de correos electrónicos realizado exitosamente");
        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Error al enviar correos electrónicos");
        } finally {
            setIsSending(false);
        }
    };


    // Efecto para generar el PDF cuando haya facturas
    useEffect(() => {
        if (pdfBills.length > 0) {
            downloadPdf();
            setPdfBills([]); // Limpiar el estado después de generar el PDF
        }
    }, [pdfBills]);

    // Columnas para ReusableTable
    const columns: TableColumnDefinition<UserDto>[] = [
        { key: "idUser", label: "ID", sortable: true },
        { key: "firstName", label: "Nombre", sortable: false },
        { key: "lastName", label: "Apellido", sortable: false },
        { key: "dni", label: "DNI", sortable: false },
        { key: "phone", label: "Teléfono", sortable: false },
        {
            key: "actions", label: "Facturas", actions: (row: UserDto) => (
                <div className="d-flex gap-2 justify-content-center overflow-auto text-nowrap">
                    <Button variant="success" onClick={() => { setSelectedUser(row); setShowBillActiveModal(true); }}>
                        Activas
                    </Button>
                    <Button variant="danger" onClick={() => { setSelectedUser(row); setShowBillNullModal(true); }}>
                        Anuladas
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <h1 className="text-center">Gestión de Facturas</h1>
            {loading ? (
                <div className="d-flex flex-column justify-content-center align-items-center vh-100">
                    <span className="mb-2 fw-bold">CARGANDO...</span>
                    <Spinner animation="border" role="status"></Spinner>
                </div>
            ) : error ? (
                <div className="text-center py-5">{error}</div>
            ) : (
                <div>
                    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 mb-1">
                        <SearchBar onSearch={handleSearch} />
                        <Button
                    variant="primary"
                    onClick={handleSendBillNotifications}
                    disabled={isSending}
                >
                    {isSending ? "Enviando..." : "Enviar notificaciones de facturas"}
                </Button>
                        <Button
                            onClick={handleGeneratePdf}
                            disabled={pdfLoading}
                            variant="primary"
                        >
                            {pdfLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Generando PDF...
                                </>
                            ) : "Generar PDF de facturas"}
                        </Button>
                    </div>

                    {/* Tabla principal */}
                    <ReusableTable<UserDto>
                        data={filteredData}
                        columns={columns}
                        defaultSort="idUser"
                    />

                    {/* Contenedor oculto para las facturas PDF */}
                    <div
                        ref={componentRef}
                        style={{
                            position: 'absolute',
                            left: '-9999px',
                            top: '0',
                            visibility: pdfBills.length > 0 ? 'visible' : 'hidden'
                        }}
                    >
                        {pdfBills.map((bill) => {
                            const user = users.find(u => u.idUser === bill.idUser);
                            return user ? (
                                <ConsorcioInvoice
                                    key={`${bill.idBill}-${Date.now()}`}
                                    user={user}
                                    bill={bill}
                                />
                            ) : null;
                        })}
                    </div>

                    {/* Modales */}
                    <BillActiveModal
                        show={showBillActiveModal}
                        onHide={() => setShowBillActiveModal(false)}
                        user={selectedUser}
                    />

                    <BillNullModal
                        show={showBillNullModal}
                        onHide={() => setShowBillNullModal(false)}
                        user={selectedUser}
                    />
                </div>
            )}
        </div>
    );
};

export default BillManagementPage;