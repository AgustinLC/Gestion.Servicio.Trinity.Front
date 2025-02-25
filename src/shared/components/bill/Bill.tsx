import { forwardRef } from 'react';
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { formatCurrency, formatDate } from "../../../core/utils/formatters";
import "./Bill.css";

interface ConsorcioInvoiceProps {
    user: UserDto;
    bill: BillDetailsDto;
    periodo: string;
    numeroFactura: string;
    fechaEmision: Date;
    fechaVencimiento: Date;
}

const ConsorcioInvoice = forwardRef<HTMLDivElement, ConsorcioInvoiceProps>(({
    user,
    bill,
    periodo,
    numeroFactura,
    fechaEmision,
    fechaVencimiento,
}, ref) => {
    return (
        <div className="invoice-container p-3" ref={ref}>
            {/* Encabezado */}
            <div className="invoice-header">
                <h2>Consorcio Vecinal de Agua Potable</h2>
                <p>Santa Maria de Oro</p>
                <p>C.U.I.T.NRO.: 30-65481347-3</p>
                <p>I.V.A. Resp.Inscripto NRO. E.P.A.S.</p>
            </div>

            {/* Datos del usuario */}
            <div className="user-data-section">
                <div className="user-data-flex">
                    <div>
                        <p><strong>NOMBRE DEL USUARIO:</strong> {user.firstName} {user.lastName}</p>
                        <p><strong>UBICACIÓN DEL INMUEBLE:</strong> {user.residenceDto.street}</p>
                        <p><strong>DOMICILIO DEL USUARIO:</strong> {user.residenceDto.district}</p>
                    </div>
                    <div>
                        <p><strong>FECHA EMISION:</strong> {formatDate(fechaEmision)}</p>
                        <p><strong>FACTURA Nº:</strong> {numeroFactura}</p>
                        <p><strong>Nº DE USUARIO:</strong> {user.idUser}</p>
                    </div>
                </div>
            </div>

            {/* Detalles del periodo */}
            <div className="billing-period">
                <h3>PERIODO FACTURADO: {periodo}</h3>
                <div className="reading-data">
                    <div>
                        <p><strong>LECTURA ANTERIOR:</strong> {bill.previousReadingDate}</p>
                        <p><strong>LECTURA ACTUAL:</strong> {bill.currentReadingDate}</p>
                    </div>
                    <div>
                        <p><strong>CONSUMO (m³):</strong> {bill.consumption}</p>
                        <p><strong>EXCEDENTES (m³):</strong> {bill.surplus}</p>
                    </div>
                </div>
            </div>

            {/* Tabla de conceptos */}
            <table className="concepts-table">
                <thead>
                    <tr>
                        <th>CONCEPTO</th>
                        <th>CANT.</th>
                        <th>UNITARIO ($)</th>
                        <th>IMPORTES ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {bill.details.map((detail, index) => (
                        <tr key={index}>
                            <td>{detail.billingParameterName}</td>
                            <td className="align-center">1</td>
                            <td className="align-right">{formatCurrency(detail.value)}</td>
                            <td className="align-right">{formatCurrency(detail.value)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={3} className="text-right text-bold">SUBTOTAL:</td>
                        <td className="align-right">{formatCurrency(bill.total)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Sección de pago */}
            <div className="payment-section">
                <div className="payment-flex">
                    <div>
                        <p><span className="text-bold">FECHA VTO.:</span> {formatDate(fechaVencimiento)}</p>
                        <p><span className="text-bold">TOTAL A PAGAR:</span> {formatCurrency(bill.total)}</p>
                    </div>
                    <div>
                        <p className="text-bold">CUENTA BANCARIA:</p>
                        <p>Bco Nacion Suc. Rivadavia</p>
                        <p>Cuenta Corriente 11503/45</p>
                    </div>
                </div>
            </div>

            {/* Notas y observaciones */}
            <div className="notes-section">
                <div className="notes-list">
                    <p className="text-bold">Notas de Interés General:</p>
                    <ul>
                        <li>El pago fuera de término puede ocasionar la suspensión del servicio</li>
                        <li>Reclamos en 2da. Instancia</li>
                        <li>Llámenos al Centro de Atención al Usuario: 0-800-666-0600</li>
                    </ul>
                </div>
                <p className="legal-notice">EL ENTE REGULADOR PROTEGE SUS DERECHOS</p>
            </div>
            <div className="payment-stubs">
                <div className="bank-stub">
                    <h4>TALON PARA EL BANCO</h4>
                    <div className="stub-content">
                        <p><span className="text-bold">Consorcio Vecinal de Agua Potable</span></p>
                        <p>Santa Maria de Oro</p>
                        <div className="stub-details">
                            <p>FACTURA Nº: {numeroFactura}</p>
                            <p>FECHA VTO.: {formatDate(fechaVencimiento)}</p>
                            <p>TOTAL A PAGAR: {formatCurrency(bill.total)}</p>
                        </div>
                        <div className="bank-info">
                            <p>Bco Nacion Suc. Rivadavia</p>
                            <p>Cuenta Corriente 11503/45</p>
                            <p>C.U.I.T.NRO.: 30-65481347-3</p>
                        </div>
                        <div className="payment-barcode">
                            {/* Espacio para código de barras */}
                            <div style={{ height: "50px", border: "1px dashed #000" }}></div>
                        </div>
                    </div>
                </div>

                <div className="operator-stub">
                    <h4>TALON PARA EL OPERADOR</h4>
                    <div className="stub-content">
                        <p><span className="text-bold">Consorcio Vecinal de Agua Potable</span></p>
                        <p>Santa Maria de Oro</p>
                        <div className="stub-details">
                            <p>FACTURA Nº: {numeroFactura}</p>
                            <p>Nº USUARIO: {user.idUser}</p>
                            <p>TOTAL A PAGAR: {formatCurrency(bill.total)}</p>
                        </div>
                        <div className="signature-box">
                            <p>FIRMA Y SELLO:</p>
                            <div style={{ height: "40px", border: "1px solid #000" }}></div>
                            <p>FECHA: ___________________</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ConsorcioInvoice;