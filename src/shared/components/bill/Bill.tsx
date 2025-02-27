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
        <div className="container mt-3 p-3" ref={ref}>
            <div className="row border border-dark">
                {/* Sección Izquierda informacion del consorcio */}
                <div className="col-md-6 d-flex">
                    <div className="row w-100">
                        <div className="col w-100">
                            <h3 className="fw-bold text-uppercase">Agua <br></br> Potable</h3>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-0 fw-bold">Consorcio Vecinal de Agua Potable</p>
                            <p className="mb-0">Santa Maria de Oro</p>
                            <p className="mb-0">Liniers s/n. Sta. Maria de Oro</p>
                            <p className="mb-0">C.P. 5579 - Rvia. - Mza</p>
                            <p className="mb-0"><strong>C.U.I.T NRO.:</strong> 30-65481347-3</p>
                            <p className="mb-0"><strong>ING. BRUTOS:</strong></p>
                            <p className="mb-0"><strong>I.V.A. Resp. Inscripto NRO. E.P.A.S.</strong></p>
                        </div>
                    </div>
                </div>
                {/* Sección Derecha informacion del usuario */}
                <div className="col-md-6 p-0 border-start border-dark">
                    <div className="border-bottom border-dark">
                        <p className="mb-0"><strong>NÚMERO DE FACTURA:</strong> 0001-000{bill.idBill}</p>
                        <p className="mb-2"><strong>FECHA EMISIÓN:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                    </div>
                    <table className="w-100">
                        <tbody>
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
                                <td><strong>C.U.I.T. DEL USUARIO</strong></td>
                                <td>C. Final</td>
                            </tr>
                            <tr>
                                <td><strong>N. SOCIO</strong></td>
                                <td>{user.idUser}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="row mt-1">
                {/* Fila numero 1 */}
                <table className="border border-dark text-center text-nowrap" >
                    <tbody>
                        {/* Primera fila */}
                        <tr>
                            <td className='border border-dark'><strong>NÚMERO DE USUARIO</strong></td>
                            <td className="border border-dark">{user.idUser}</td>
                            <td className='border border-dark'><strong>PERIODO FACTURADO</strong></td>
                            <td className='border border-dark' colSpan={5}></td>
                            <td className='border border-dark'><strong>VENCIMIENTO</strong></td>
                            <td className='border border-dark'><strong>PRÓXIMO VENCIMIENTO</strong></td>
                        </tr>
                        {/* Segunda fila */}
                        <tr>
                            <td className='border border-dark'><strong>CATEGORÍA</strong></td>
                            <td className='border border-dark'>{user.residenceDto.idFee}</td>
                            <td className="border border-dark">{bill.periodName}</td>
                            <td className='border border-dark' colSpan={5}></td>
                            <td className="border border-dark">{formatDate(new Date(bill.expirationDate))}</td>
                            <td className='border border-dark'>-</td>
                        </tr>
                        {/* Tercera fila (Encabezados) */}
                        <tr>
                            <th className="align-middle border border-dark" rowSpan={2}>NÚMERO DE MEDIDOR</th>
                            <th className='border border-dark' colSpan={4}>FECHA DE LECTURA Y ESTADO ACTUAL</th>
                            <th className='border border-dark' colSpan={4}>FECHA DE LECTURA Y ESTADO ANTERIOR</th>
                            <th className="align-middle border border-dark" rowSpan={2}>TOTAL CONSUMO REGISTRADO</th>
                        </tr>
                        {/* Cuarta fila (Subencabezados) */}
                        <tr>
                            <th className='border border-dark'>DÍA</th>
                            <th className='border border-dark'>MES</th>
                            <th className='border border-dark'>AÑO</th>
                            <th className='border border-dark'>ESTADO ACTUAL</th>
                            <th className='border border-dark'>DÍA</th>
                            <th className='border border-dark'>MES</th>
                            <th className='border border-dark'>AÑO</th>
                            <th className='border border-dark'>ESTADO ANTERIOR</th>
                        </tr>
                        {/* Quinta fila (Datos) */}
                        <tr>
                            <td className='border border-dark'>{bill.idMeter}</td>
                            <td className='border border-dark'>{currentReadingDateSeparate.day}</td>
                            <td className='border border-dark'>{currentReadingDateSeparate.month}</td>
                            <td className='border border-dark'>{currentReadingDateSeparate.year}</td>
                            <td className="border border-dark">{bill.readingsBillDto.currentReading}</td>
                            <td className='border border-dark'>{previousReadingDateSeparate.day}</td>
                            <td className='border border-dark'>{previousReadingDateSeparate.month}</td>
                            <td className='border border-dark'>{previousReadingDateSeparate.year}</td>
                            <td className="border border-dark">{bill.readingsBillDto.previousReading}</td>
                            <td className="border border-dark">{bill.consumption}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="row mt-1">
                <table className="table-bordered">
                    {/* Conceptos */}
                    <thead>
                        <tr>
                            <th>RUBRO</th>
                            <th>CONCEPTO</th>
                            <th>CANT.</th>
                            <th>PRECIO UNITARIO ($)</th>
                            <th>IMPORTES PARCIALES ($)</th>
                        </tr>
                    </thead>
                    {/* Filas con datos */}
                    <tbody>
                        {/* Consumo normal */}
                        <tr>
                            <td>01</td>
                            <td className="concepto">Consumo Normal</td>
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
                                        <td className="concepto">Cuota Social {bill.periodName}</td>
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
                            <td className="concepto">Excedentes servicio medido (En metros cúbicos)</td>
                            <td>{bill.surplus}</td>
                            <td className="text-end">{bill.surplusChargePerUnit},00</td>
                            <td className="text-end">{bill.surplusPrice},00</td>
                        </tr>
                        <tr>
                            <td>04</td>
                            <td className="concepto">Intereses</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        <tr>
                            <td>05</td>
                            <td className="concepto">Multas</td>
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
                                    <td className="concepto">{concepto}</td>
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
                            <td className="concepto">Varios</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                        <tr>
                            <td>10</td>
                            <td className="concepto fw-bold">Descuento</td>
                            <td>0</td>
                            <td className="text-end">0,00</td>
                            <td className="text-end">0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="row mt-1">
                <table className="table-bordered">
                    <tbody>
                        <tr>
                            <td>
                                <h4>RESUMEN DE DEUDA AL: {formatDate(new Date(bill.dateRegister))}</h4>
                            </td>
                            <td style={{ width: "270px" }}>SUBTOTAL</td>
                            <td className="text-end" style={{ width: "315px" }}>{bill.total}</td>
                        </tr>
                        <tr>
                            <td>Señor Usuario: </td>
                            <td style={{ width: "270px" }}>IVA 21,00 %</td>
                            <td className="text-end" style={{ width: "315px" }}>0,00</td>
                        </tr>
                        <tr>
                            <td> A dicha fecha Ud. no registra conceptos facturados pendientes de pago</td>
                            <td style={{ width: "270px" }}>IVA R.N.I. 10,50 %</td>
                            <td className="text-end" style={{ width: "315px" }}>0,00</td>
                        </tr>
                        <tr>
                            <td>PAGUE EN TERMINO. EVITE INCONVENIENTES</td>
                            <td style={{ width: "270px" }}>Descuento</td>
                            <td className="text-end" style={{ width: "315px" }}>0,00</td>
                        </tr>
                        <tr>
                            <td> CANTIDAD DE PERIODOS IMPAGOS HASTA LA FECHA: 0</td>
                            <td style={{ width: "270px" }}>TOTAL A PAGAR -</td>
                            <td className="text-end fw-bold" style={{ width: "315px" }}>{bill.total}</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>Son Pesos: {convertNumberToWords(bill.total)}</td>
                        </tr>
                        <tr>
                            <td colSpan={3}>CUENTA BANCARIA: Bico Nacion Soc. Rivadavia Cuenta Corriente 1150345</td>
                        </tr>
                    </tbody>
                </table>

                <div className="notes-section border border-dark mt-1">
                    <p className="fw-bold">El pago fuera de término puede ocasionar la suspensión del servicio y costos
                        extras
                        en concepto de reconexión del mismo.</p>
                    <p className="mb-1">Reclamos en 2a. Instancia</p>

                    <div className="row mt-3">
                        <div className="col-md-6">
                            <p className="mb-1"><strong>Cat. 1 - Unidad Simple</strong></p>
                            <p className="mb-1"><strong>Cat. 2 - Unidad Doble</strong></p>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-1">Llámenos al Centro de Atención al Usuario</p>
                            <p className="mb-1">EL ENTE REGULADOR PROTEGE SUS DERECHOS</p>
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col-md-6">
                            <p className="mb-1"><strong>Cat. 3 - Industrial</strong></p>
                            <p className="mb-1"><strong>Cat. 4 - Grandes consumidores</strong></p>
                        </div>
                        <div className="col-md-6">
                            <p className="mb-1">Llámenos al Centro de Atención al Usuario</p>
                            <p className="mb-1">0-800-666-0600</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-2">
                {/* Primera parte de la factura */}
                <div className="col-md-6">
                    <div className="row border">
                        <h5 className="text-center text-bold">Consorcio Vecinal de Agua Potable</h5>
                        <p className="text-center">Santa Maria de Oro</p>
                        <div className="d-flex justify-content-center gap-5">
                            <p><strong>C.U.I.T. NRO:</strong> 30-65481347-3</p>
                            <p><strong>I.V.A Resp. Inscripto NRO.E.P.A.S</strong></p>
                        </div>
                    </div>
                    <div className="row border">
                        <div className="col">
                            <p className="mt-2"><strong>Factura Nº:</strong> <span
                                className="border p-1">0001-000{bill.idBill}</span></p>
                            <p><strong>Fecha de Emisión:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                            <p><strong>Conexión:</strong> {user.idUser}</p>
                            <p><strong>Periodo:</strong> <span className="border p-1">{bill.periodName}</span></p>
                        </div>
                        <div className="col border-start">
                            <div className="d-flex gap-2">
                                <p className="mt-2"><strong>C.FINAL</strong></p>
                                <p className="mt-2"><strong>CUIT:</strong>
                                    <span className="border p-1">____/_________________/____</span>
                                </p>
                            </div>
                            <p><strong>Cliente:</strong> <span className="border p-1">{user.firstName} {user.lastName}</span></p>
                            <p><strong>Fecha de Emisión:</strong> {formatDate(new Date(bill.dateRegister))}</p>
                            <p><strong>Fecha de vencimiento:</strong> {formatDate(new Date(bill.expirationDate))}</p>

                        </div>
                    </div>
                    <div className="row border">
                        <div className="col-3 text-center">
                            <p className="text-bold">IMP. SERVICIO</p>
                            <div className="amount-box border">$ {bill.total}</div>
                        </div>
                        <div className="col-3 text-center">
                            <p className="text-bold">I.V.A.</p>
                            <div className="amount-box border">21%</div>
                        </div>
                        <div className="col-2 text-center">
                            <p className="text-bold">.</p>
                            <div className="amount-box border">$ 0,00</div>
                        </div>
                        <div className="col-3 text-center">
                            <p className="text-bold">TOTAL A PAGAR</p>
                            <div className="amount-box border">$ {bill.total}</div>
                        </div>
                        <p className="mt-3 text-center">Bco Nacion Suc. Rivadavia Cuenta Corriente 11503/45</p>
                    </div>
                    <p className="text-center">TALON PARA EL OPERADOR-FIRMA Y SELLO AL DORSO</p>
                </div>
                {/* Segunda parte de la factura */}
                <div className="col-md-6">
                    <div className="row border">
                        <h5 className="text-center text-bold">Consorcio Vecinal de Agua Potable</h5>
                        <p className="text-center">Santa Maria de Oro</p>
                    </div>
                    <div className="row border">
                        <div className="col">
                            <p className="mt-2"><strong>Factura Nº:</strong> <span
                                className="border p-1">0001-000{bill.idBill}</span></p>
                            <p><span className="border p-1">{user.firstName} {user.lastName}</span></p>
                            <p><strong>N° de usuario: </strong>{user.firstName} {user.lastName}</p>
                            <p><strong>Fecha de Emisión: </strong>{formatDate(new Date(bill.dateRegister))}</p>
                            <p><strong>Son pesos: </strong></p>
                            <p><span className="border p-1">{convertNumberToWords(bill.total)}</span></p>
                        </div>
                        <div className="col border-start">
                            <p className="my-2"><strong>CONEXION: </strong>{user.idUser}</p>
                            <p className="mt-5"><strong>Periodo:</strong> {bill.periodName}</p>
                            <p><strong>Fecha de vencimiento:</strong> {formatDate(new Date(bill.expirationDate))}</p>
                            <p><strong>TOTAL A PAGAR:</strong></p>
                            <p><span className="border p-1">$ {bill.total}</span></p>
                        </div>
                    </div>
                    <div className="row border ">
                        <p className="text-center" style={{ marginTop: "29px", marginBottom: "29px" }}>Bco Nacion Suc. Rivadavia
                            Cuenta Corriente 11503/45</p>
                    </div>
                    <p className="text-center">TALON PARA EL BANCO-FIRMA Y SELLO AL DORSO</p>
                </div>
            </div>
        </div>
    );
});

export default ConsorcioInvoice;