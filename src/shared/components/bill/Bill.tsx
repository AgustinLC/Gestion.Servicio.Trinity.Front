import { forwardRef } from 'react';
import { BillDetailsDto } from "../../../core/models/dto/BillDetailsDto";
import { UserDto } from "../../../core/models/dto/UserDto";
import { formatDate } from "../../../core/utils/formatters";
import "./Bill.css";
import { DateSeparate } from '../../../core/models/types/DateSeparate';
import { convertNumberToWords } from '../../../core/utils/convertNumberToWords';

// Props para hacer la factura
interface ConsorcioInvoiceProps {
    user: UserDto;
    bill: BillDetailsDto;
}

// Funcion para separar la fecha en dia, mes y año
const separateDate = (dateInput: Date | string): DateSeparate => {
    if (!dateInput) return { year: '', month: '', day: '' };
    const date = typeof dateInput === 'string'
        ? new Date(dateInput)
        : dateInput;
    return {
        year: String(date.getFullYear()),
        month: String(date.getMonth() + 1).padStart(2, '0'), // Meses son 0-based
        day: String(date.getDate()).padStart(2, '0')
    };
};

const ConsorcioInvoice = forwardRef<HTMLDivElement, ConsorcioInvoiceProps>(({
    user,
    bill,
}, ref) => {

    // Separamos la fecha de registro y vencimiento
    const currentReadingDateSeparate = separateDate(bill.readingsBillDto.currentReadingDate);
    const previousReadingDateSeparate = separateDate(bill.readingsBillDto.previousReadingDate);

    // Render
    return (
        <div className="invoice-container" ref={ref}>
            {/* Encabezado */}
            <div className="invoice-header">
                {/* Información del Consorcio */}
                <div className="consortium-info border">
                    <h3>Agua Potable</h3>
                    <table>
                        <tbody>
                            <tr>
                                <td><strong>Consorcio Vecinal de Agua Potable</strong></td>
                            </tr>
                            <tr>
                                <td>Santa Maria de Oro</td>
                            </tr>
                            <tr>
                                <td>Liniers s/n. Sta. Maria de Oro</td>
                            </tr>
                            <tr>
                                <td>C.P. 5579 - Rvia. - Mza</td>
                            </tr>
                            <tr>
                                <td><strong>C.U.I.T NRO.:</strong> 30-65481347-3  <strong>ING.BRUTOS:</strong></td>
                            </tr>
                            <tr>
                                <td>I.V.A. Resp.Inscripto NRO. E.P.A.S.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Información del Usuario */}
                <div className="user-info border">
                    <table>
                        <tbody>
                            <tr>
                                <td><strong>NÚMERO DE FACTURA</strong></td>
                                <td>0001-000{bill.idBill}</td>
                            </tr>
                            <tr className='border-bottom'>
                                <td><strong>FECHA EMISIÓN</strong></td>
                                <td>{formatDate(new Date(bill.dateRegister))}</td>
                            </tr>
                            <tr>
                                <td><strong>NOMBRE DEL USUARIO</strong></td>
                                <td>{user.firstName} {user.lastName}</td>
                            </tr>
                            <tr>
                                <td><strong>UBICACIÓN DEL INMUEBLE</strong></td>
                                <td>{user.residenceDto.street}</td>
                            </tr>
                            <tr>
                                <td><strong>CASA N°</strong></td>
                                <td>{user.residenceDto.number}</td>
                            </tr>
                            <tr>
                                <td><strong>N°. SOCIO</strong></td>
                                <td>{user.idUser}</td>
                            </tr>
                            <tr>
                                <td><strong>DOMICILIO DEL USUARIO</strong></td>
                                <td>{user.residenceDto.street}</td>
                            </tr>
                            <tr>
                                <td><strong>C.U.I.T. DEL USUARIO</strong></td>
                                <td>0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detalles de Lectura */}
            <div className="reading-details">
                <table className='mb-0'>
                    <thead>
                        <tr>
                            <th className='fw-normal'>NÚMERO DE USUARIO</th>
                            <th className='border-left-0'>{user.idUser}</th>
                            <th className='border-left-0'>PERIODO FACTURADO</th>
                            <th className='border-left-0'>VENCIMIENTO</th>
                            <th className='border-left-0'>PRÓXIMO VENCIMIENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border-top-0'>CATEGORÍA</td>
                            <td className='border-left-0 border-top-0'>{user.residenceDto.idFee}</td>
                            <td className='border-left-0 border-top-0'>{bill.periodName}</td>
                            <td className='border-left-0 border-top-0'>{bill.readingsBillDto.currentReading}</td>
                            <td className='border-left-0 border-top-0'>-</td>
                        </tr>
                    </tbody>
                </table>

                <table>
                    <thead>
                        <tr>
                            <th className='border-bottom-0'>NÚMERO DE</th>
                            <th colSpan={4} className='border-left-0'>FECHA DE LECTURA Y ESTADO ACTUAL</th>
                            <th colSpan={4} className='border-left-0'>FECHA DE LECTURA Y ESTADO ANTERIOR</th>
                            <th className='border-left-0 border-bottom-0'>TOTAL CONSUMO REGISTRADO</th>
                        </tr>
                        <tr>
                            <th className='border-top-0'>MEDIDOR</th>
                            <th className='border-left-0 border-top-0'>DÍA</th>
                            <th className='border-left-0 border-top-0'>MES</th>
                            <th className='border-left-0 border-top-0'>AÑO</th>
                            <th className='border-left-0 border-top-0'>ESTADO ACTUAL</th>
                            <th className='border-left-0 border-top-0'>DÍA</th>
                            <th className='border-left-0 border-top-0'>MES</th>
                            <th className='border-left-0 border-top-0'>AÑO</th>
                            <th className='border-left-0 border-top-0'>ESTADO ANTERIOR</th>
                            <th className='border-top-0  border-left-0'>EN m3</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border-top-0'>{bill.idMeter}</td>
                            <td className='border-left-0 border-top-0'>{currentReadingDateSeparate.day}</td>
                            <td className='border-left-0 border-top-0'>{currentReadingDateSeparate.month}</td>
                            <td className='border-left-0 border-top-0'>{currentReadingDateSeparate.year}</td>
                            <td className='border-left-0 border-top-0'>{bill.readingsBillDto.currentReading}</td>
                            <td className='border-left-0 border-top-0'>{previousReadingDateSeparate.day}</td>
                            <td className='border-left-0 border-top-0'>{previousReadingDateSeparate.month}</td>
                            <td className='border-left-0 border-top-0'>{previousReadingDateSeparate.year}</td>
                            <td className='border-left-0 border-top-0'>{bill.readingsBillDto.previousReading}</td>
                            <td className='border-top-0'>{bill.consumption}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Conceptos Facturados */}
            <div className="billing-concepts">
                <table>
                    <thead>
                        <tr>
                            <th>RUBRO</th>
                            <th>CONCEPTO</th>
                            <th>CANT.</th>
                            <th>PRECIO UNITARIO ($)</th>
                            <th>IMPORTES PARCIALES ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>01</td>
                            <td className="text-start">Consumo Normal</td>
                            <td>1</td>
                            <td className="text-end">{bill.feePrice},00</td>
                            <td className="text-end">{bill.feePrice},00</td>
                        </tr>
                        {/* Cuota social */}
                        {bill.details
                            .filter(detail => detail.billingParameterName === "Cuota Social")
                            .map(detail => {
                                // Sumamos todos los valores de "Cuota Social" si hay múltiples
                                const totalCuotaSocial = bill.details
                                    .filter(d => d.billingParameterName === "Cuota Social")
                                    .reduce((total, d) => total + d.value, 0);

                                return (
                                    <tr key={detail.idBillDetail}>
                                        <td>02</td>
                                        <td className="text-start">Cuota Social {bill.periodName}</td>
                                        <td>1</td>
                                        <td className="text-end">
                                            {totalCuotaSocial.toLocaleString('es-AR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td className="text-end">
                                            {totalCuotaSocial.toLocaleString('es-AR', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                    </tr>
                                );
                            })
                            .slice(0, 1) // Nos aseguramos de renderizar solo 1 fila
                        }
                        {/* Excedentes */}
                        <tr>
                            <td>03</td>
                            <td className="text-start">Excedentes servicio medido (En metros cúbicos)</td>
                            <td>{bill.surplus}</td>
                            <td className="text-end">{bill.surplusChargePerUnit},00</td>
                            <td className="text-end">{bill.surplusPrice},00</td>
                        </tr>
                        <tr>
                            <td>04</td>
                            <td className="text-start">Intereses</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        <tr>
                            <td>05</td>
                            <td className="text-start">Multas</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        {['Reconexión', 'Conexiones', 'Materiales'].map((concepto, index) => {
                            const detail = bill.details.find(d =>
                                d.billingParameterName.toLowerCase() === concepto.toLowerCase()
                            );
                            const codigo = String(6 + index).padStart(2, '0'); // Genera 06, 07, 08
                            const cantidad = concepto === 'Conexiones' ? 0 : 0; // Cantidad estática
                            return (
                                <tr key={codigo}>
                                    <td>{codigo}</td>
                                    <td className="text-start">{concepto}</td>
                                    <td>{cantidad}</td>
                                    <td className="text-end">
                                        {(detail?.value || 0).toLocaleString('es-AR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </td>
                                    <td className="text-end">
                                        {(detail?.value || 0).toLocaleString('es-AR', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td>09</td>
                            <td className="text-start">Varios</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td className="text-start">Descuento</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Resumen de Deuda */}
            <div className="debt-summary">
                <table>
                    {/* Colgroup para definir el ancho de las columnas */}
                    <colgroup>
                        <col style={{ width: '40px' }} />
                        <col style={{ width: '376px' }} />
                        <col style={{ width: '152px' }} />
                    </colgroup>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <strong>RESUMEN DE DEUDA AL:</strong> {formatDate(new Date(bill.dateRegister))}
                            </td>
                            <td><strong>SUBTOTAL</strong></td>
                            <td>{bill.total}</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0' colSpan={2}>
                                Señor Usuario: A dicha fecha Ud. no registra conceptos facturados pendientes de pago
                            </td>
                            <td><strong>IVA 21,00 %</strong></td>
                            <td>0,00</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0 border-top-0' colSpan={2}>
                                PAGUE EN TÉRMINO. EVITE INCONVENIENTES
                            </td>
                            <td><strong>IVA R.N.I. 10.50 %</strong></td>
                            <td>0,00</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0 border-top-0' colSpan={2}>
                                CANTIDAD DE BIMESTRES IMPAGOS HASTA LA FECHA: 0
                            </td>
                            <td><strong>Descuento</strong></td>
                            <td>0,00</td>
                        </tr>
                        <tr>
                            <td className='border-top-0' colSpan={2}>
                                CUENTA BANCARIA. Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45
                            </td>
                            <td><strong>TOTAL A PAGAR</strong></td>
                            <td>{bill.total}</td>
                        </tr>
                        <tr>
                            <td colSpan={4}>
                                Son Pesos: <strong>{convertNumberToWords(bill.total)}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Notas Finales */}
            <div className="notes-section">
                <h6 className='text-center mb-5'>Notas de interes General</h6>
                <p className='text-center mt-5'><strong>El pago fuera de término puede ocasionar la suspensión del servicio y costos extras en concepto de reconexión del mismo.</strong></p>
                <div className='d-flex justify-content-between'>
                    <div>
                        <p>Cat. 1 - Unidad Simple</p>
                        <p>Cat. 2 - Undidad Doble</p>
                        <p>Cat. 3 - Industrial</p>
                        <p>Cat. 4 - Grandes consumidore</p>

                    </div>
                    <div>
                        <p className='text-center'>Reclamos en 2a. Instancia</p>
                        <table className='mb-0 text-center border border-dark'>
                            <thead>
                                <tr>
                                    <th className='fw-normal'>Llámenos al Centro de Atención al Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='border-top border-dark'>EL ENTE REGULADOR PROTEGE SUS DERECHOS</td>
                                </tr>
                                <tr>
                                    <td className='border-top border-dark'>Llámenos al Centro de Atención al Usuario</td>
                                </tr>
                                <tr>
                                    <td className='border-top border-dark'>0-800-666-0600</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Talones para recortar */}
            <div className="bead-section">
                <table className="bead-table">
                    <tbody>
                        <tr>
                            {/* Primer talonario */}
                            <td className="bead-ticket">
                                <table className="bead-inner-table">
                                    <tbody>
                                        <tr>
                                            <td colSpan={2} className="bead-header border-bottom">
                                                <h5>Consorcio Vecinal de Agua Potable</h5>
                                                <p>Santa Maria de Oro</p>
                                                <div className="bead-cuit">
                                                    <p><strong>C.U.I.T. NRO:</strong> 30-65481347-3</p>
                                                    <p><strong>I.V.A Resp. Inscripto NRO.E.P.A.S</strong></p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bead-info">
                                                <p><strong>Factura Nº:</strong> <span>0001-000{bill.idBill}</span></p>
                                                <p><strong>Fecha de Emisión:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                                                <p><strong>Conexión:</strong> {user.idUser}</p>
                                                <p><strong>Periodo:</strong> <span>{bill.periodName}</span></p>
                                            </td>
                                            <td className="bead-info">
                                                <p><strong>C.FINAL</strong></p>
                                                <p><strong>CUIT:</strong> <span>____/_________________/____</span></p>
                                                <p><strong>Cliente:</strong> <span>{user.firstName} {user.lastName}</span></p>
                                                <p><strong>Fecha de Emisión:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                                                <p><strong>Fecha de vencimiento:</strong> {formatDate(new Date(bill.expirationDate))}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="bead-totals border-top">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <p>IMP. SERVICIO</p>
                                                                <div>$ {bill.total}</div>
                                                            </td>
                                                            <td>
                                                                <p>I.V.A.</p>
                                                                <div>21%</div>
                                                            </td>
                                                            <td>
                                                                <p>.</p>
                                                                <div>$ 0,00</div>
                                                            </td>
                                                            <td>
                                                                <p>TOTAL A PAGAR</p>
                                                                <div>$ {bill.total}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <p>Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="bead-footer-text">TALON PARA EL OPERADOR-FIRMA Y SELLO AL DORSO</p>
                            </td>

                            {/* Segundo talonario */}
                            <td className="bead-ticket">
                                <table className="bead-inner-table">
                                    <tbody>
                                        <tr>
                                            <td colSpan={2} className="bead-header border-bottom">
                                                <h5>Consorcio Vecinal de Agua Potable</h5>
                                                <p>Santa Maria de Oro</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bead-info">
                                                <p><strong>Factura Nº:</strong> <span>0001-000{bill.idBill}</span></p>
                                                <p>Cliente: <span>{user.firstName} {user.lastName}</span></p>
                                                <p><strong>N° de usuario: </strong>{user.firstName} {user.lastName}</p>
                                                <p><strong>Fecha de Emisión: </strong>{formatDate(new Date(bill.dateRegister))}</p>
                                            </td>
                                            <td className="bead-info">
                                                <p><strong>CONEXION: </strong>{user.idUser}</p>
                                                <p><strong>Periodo:</strong> {bill.periodName}</p>
                                                <p><strong>Fecha de vencimiento:</strong> {formatDate(new Date(bill.expirationDate))}</p>
                                                <p><strong>TOTAL A PAGAR:</strong><span>$ {bill.total}</span></p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="text-center">
                                                <p><strong>Son pesos: </strong><span>{convertNumberToWords(bill.total)}</span></p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="bead-footer border-top text-center">
                                                <p>Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p className="bead-footer-text">TALON PARA EL BANCO-FIRMA Y SELLO AL DORSO</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
});
export default ConsorcioInvoice;