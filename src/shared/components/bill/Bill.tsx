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
                                <td><strong>C.U.I.T NRO.:</strong> 30-65481347-3</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {/* Información del Usuario */}
                <div className="user-info border">
                    <table>
                        <tbody>
                            <tr>
                                <td><strong>N° DE FACTURA</strong></td>
                                <td>0001-{bill.idBill}</td>
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
                                <td>{user.residenceDto.district}</td>
                            </tr>
                            <tr>
                                <td><strong>DOMICILIO DEL USUARIO</strong></td>
                                <td>{user.residenceDto.street}</td>
                            </tr>
                            <tr>
                                <td><strong>CASA N°</strong></td>
                                <td>{user.residenceDto.number}</td>
                            </tr>
                            <tr>
                                <td><strong>N° CONEXIÓN</strong></td>
                                <td>{user.idUser}</td>
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
                            <th className='fw-normal border border-dark'>NÚMERO DE USUARIO</th>
                            <th className='border-top border-bottom border-dark'>{user.idUser}</th>
                            <th className='border border-dark'>PERIODO FACTURADO</th>
                            <th className='border-top border-bottom border-end border-dark'>VENCIMIENTO</th>
                            <th className='border-top border-bottom border-end border-dark'>PRÓXIMO VENCIMIENTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border-bottom border-start border-end border-dark'>CATEGORÍA</td>
                            <td className='border-bottom border-dark'>{user.residenceDto.idFee}</td>
                            <td className='border-bottom border-start border-end border-dark'>{bill.periodName}</td>
                            <td className='border-bottom border-end border-dark'>{formatDate(new Date(bill.expirationDate))}</td>
                            <td className='border-bottom border-end border-dark'>-</td>
                        </tr>
                    </tbody>
                </table>

                <table>
                    <thead>
                        <tr>
                            <th className='border-start border-end border-dark'>NÚMERO DE</th>
                            <th colSpan={4} className='border-bottom border-dark'>FECHA DE LECTURA Y ESTADO ACTUAL</th>
                            <th colSpan={4} className='border-bottom border-start border-end border-dark'>FECHA DE LECTURA Y ESTADO ANTERIOR</th>
                            <th className='border-bottom border-end border-dark'>TOTAL CONSUMO REGISTRADO</th>
                        </tr>
                        <tr>
                            <th className='border-bottom border-start border-end border-dark'>MEDIDOR</th>
                            <th className='border-bottom border-dark'>DÍA</th>
                            <th className='border-bottom border-start border-dark'>MES</th>
                            <th className='border-bottom border-start border-dark'>AÑO</th>
                            <th className='border-bottom border-start border-dark'>ESTADO ACTUAL</th>
                            <th className='border-bottom border-start border-dark'>DÍA</th>
                            <th className='border-bottom border-start border-dark'>MES</th>
                            <th className='border-bottom border-start border-dark'>AÑO</th>
                            <th className='border-bottom border-start border-end border-dark'>ESTADO ANTERIOR</th>
                            <th className='border-bottom border-end border-dark'>EN m³</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border-bottom border-start border-end border-dark'>{bill.idMeter}</td>
                            <td className='border-bottom border-dark'>{currentReadingDateSeparate.day}</td>
                            <td className='border-bottom border-start border-dark'>{currentReadingDateSeparate.month}</td>
                            <td className='border-bottom border-start border-dark'>{currentReadingDateSeparate.year}</td>
                            <td className='border-bottom border-start border-dark'>{bill.readingsBillDto.currentReading}</td>
                            <td className='border-bottom border-start border-dark'>{previousReadingDateSeparate.day}</td>
                            <td className='border-bottom border-start border-dark'>{previousReadingDateSeparate.month}</td>
                            <td className='border-bottom border-start border-dark'>{previousReadingDateSeparate.year}</td>
                            <td className='border-bottom border-start border-end border-dark'>{bill.readingsBillDto.previousReading}</td>
                            <td className='border-bottom border-end border-dark'>{bill.consumption}</td>
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
                        {['Reconexión', 'Conexión', 'Materiales', 'Multas'].map((concepto, index) => {
                            const detail = bill.details.find(d =>
                                d.billingParameterName.toLowerCase() === concepto.toLowerCase()
                            );
                            const codigo = String(4 + index).padStart(2, '0'); // Genera 04, 05, 06, 07
                            const cantidad = concepto === 'Conexión' ? 0 : 0; // Cantidad estática
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
                            <td>08</td>
                            <td className="text-start">Varios</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        <tr>
                            <td>09</td>
                            <td className="text-start">Descuentos</td>
                            <td>{bill.discountCounter}</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">{bill.totalDiscounts},00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Resumen de Deuda */}
            <div className="debt-summary">
                <table className='mb-1'>
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
                            <td>$ {bill.subTotal}</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0' colSpan={2}>
                                {bill.amountUnpaidInvoices > 0 ? (
                                    <>
                                        Señor Usuario: A dicha fecha Ud. registra un monto pendiente de pago de <strong>$ {bill.amountUnpaidInvoices}</strong>
                                    </>
                                ) : (
                                    <>
                                        Señor Usuario: A dicha fecha Ud. no registra conceptos facturados pendientes de pago.
                                    </>
                                )}
                            </td>
                            <td><strong>IVA 21,00 %</strong></td>
                            <td>$ {bill.iva}</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0 border-top-0' colSpan={2}>
                                PAGUE EN TÉRMINO. EVITE INCONVENIENTES
                            </td>
                            <td><strong>IVA R.N.I. 10.50 %</strong></td>
                            <td>$ 0,00</td>
                        </tr>
                        <tr>
                            <td className='border-bottom-0 border-top-0' colSpan={2}>
                                CANTIDAD DE BIMESTRES IMPAGOS HASTA LA FECHA: 0
                            </td>
                            <td><strong>Descuento</strong></td>
                            <td>$ - {bill.totalDiscounts}</td>
                        </tr>
                        <tr>
                            <td className='border-top-0' colSpan={2}>
                                CUENTA BANCARIA. Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45
                            </td>
                            <td><strong>TOTAL A PAGAR</strong></td>
                            <td>$ {bill.total}</td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='text-end'>
                                Son Pesos: <strong>{convertNumberToWords(bill.total)}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={4} className='text-end'>
                                PASADA LA FECHA DE VENCIMIENTO DEBERA PAGAR: <strong>$ {bill.maturityAmount}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Notas Finales */}
            <div className="notes-section">
                <p className='text-center mx-0'>RECUERDE USUARIO QUE CUANDO TENGA UNA BOLETA VENCIDA CORRE EL RIESGO QUE EL CONSORCIO LE SUSPENDA EL SERVICIO DE AGUA POTABLE, Y LUEGO DEBA REALIZAR UNA RECONEXIÓN DEL SERVICIO.</p>
                <p className='text-center fw-bold fs-6'>CBU 0110438120043811503456 consorcio Vecinal de agua potable santa María de Oro. ALIAS: BOMBO.PRIMO.NUDO</p>
                <p className='text-center fw-bold'>RESTRICCIÓN DE USOS DEL AGUA POTABLE DE 8 A 20HS. Está prohibido utilizar agua potable para regar jardines, calles, lavar veredas, autos y llenar pileta. Disposición de DIRCAS para que no le aplique multa por derroche. Hagamos un uso responsable</p>
                <div className='d-flex justify-content-between'>
                    <div>
                        <p>Cat. 1 - Unidad Simple</p>
                        <p>Cat. 2 - Undidad Doble</p>
                        <p>Cat. 3 - Industrial</p>
                        <p>Cat. 4 - Grandes consumidores</p>
                    </div>
                    <div>
                        <p className='text-center'>Reclamos en 2a. Instancia</p>
                        <table className='mb-0 text-center border-top border-start border-dark'>
                            <thead>
                                <tr>
                                    <th className='fw-normal'>Comuniquese al Centro de Atención al Usuario</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='border-top border-dark'>EL ENTE REGULADOR PROTEGE SUS DERECHOS</td>
                                </tr>
                                <tr>
                                    <td className='border-top border-dark'>Comunicarse al Centro de Atención al Usuario</td>
                                </tr>
                                <tr>
                                    <td className='border-top border-dark'>correo: dircas@irrigacion.gov.ar</td>
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
                                                <p>Santa María de Oro</p>
                                                <div className="bead-cuit">
                                                    <p><strong>C.U.I.T. NRO:</strong> 30-65481347-3</p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bead-info">
                                                <p><strong>Factura Nº:</strong> <span>0001-{bill.idBill}</span></p>
                                                <p><strong>N° Conexión:</strong> {user.idUser}</p>
                                                <p><strong>Cliente:</strong> <span>{user.firstName} {user.lastName}</span></p>
                                                <p><strong>Periodo:</strong> <span>{bill.periodName}</span></p>
                                            </td>
                                            <td className="bead-info">
                                                <p><strong>Consumidor final</strong></p>
                                                <p><strong>Consumo:</strong> {bill.consumption}m³</p>
                                                <p><strong>Monto deuda:</strong> ${bill.amountUnpaidInvoices}</p>
                                                <p><strong>Fecha de Emisión:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                                                <p><strong>Fecha de vencimiento:</strong> {formatDate(new Date(bill.expirationDate))}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="bead-totals">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                <p>IMP. SERVICIO</p>
                                                                <div>$ {bill.subTotal}</div>
                                                            </td>
                                                            <td>
                                                                <p>I.V.A.</p>
                                                                <div>$ {bill.iva}</div>
                                                            </td>
                                                            <td>
                                                                <p>DESCUENTO</p>
                                                                <div>- $ {bill.totalDiscounts}</div>
                                                            </td>
                                                            <td>
                                                                <p>TOTAL A PAGAR</p>
                                                                <div>$ {bill.total}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="text-center">
                                                <p><strong>Son pesos: </strong><span>{convertNumberToWords(bill.total)}</span></p>
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
                                                <p>Santa María de Oro</p>
                                                <div className="bead-cuit">
                                                    <p><strong>C.U.I.T. NRO:</strong> 30-65481347-3</p>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="bead-info">
                                                <p><strong>Factura Nº:</strong> <span>0001-{bill.idBill}</span></p>
                                                <p><strong>N° Conexión:</strong> {user.idUser}</p>
                                                <p><strong>Cliente:</strong> <span>{user.firstName} {user.lastName}</span></p>
                                                <p><strong>Periodo:</strong> <span>{bill.periodName}</span></p>
                                            </td>
                                            <td className="bead-info">
                                                <p><strong>Consumidor final</strong></p>
                                                <p><strong>Consumo:</strong> {bill.consumption}m³</p>
                                                <p><strong>Monto deuda:</strong> ${bill.amountUnpaidInvoices}</p>
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
                                                                <div>$ {bill.subTotal}</div>
                                                            </td>
                                                            <td>
                                                                <p>I.V.A.</p>
                                                                <div>$ {bill.iva}</div>
                                                            </td>
                                                            <td>
                                                                <p>DESCUENTO</p>
                                                                <div>- $ {bill.totalDiscounts}</div>
                                                            </td>
                                                            <td>
                                                                <p>TOTAL A PAGAR</p>
                                                                <div>$ {bill.total}</div>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2} className="text-center">
                                                <p><strong>Son pesos: </strong><span>{convertNumberToWords(bill.total)}</span></p>
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