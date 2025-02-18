import React, { useEffect, useState } from "react";
import "./bill.css";
import { getData } from "../../../core/services/apiService";
import { BillDataDto } from "../../../core/models/dto/BillDataDto";
import html2pdf from "html2pdf.js"; // Importar la librería para exportar a PDF

const billComponent: React.FC = () => {
  const [billData, setBillData] = useState<BillDataDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const data = await getData<BillDataDto>("/operator/bill/2/1");
      setBillData(data);
    } catch (error) {
      console.error(error);
      setError("Error al obtener la factura");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar la impresión
  const handlePrint = () => {
    window.print();
  };

  // Función para manejar la exportación a PDF
  const handleExportToPDF = () => {
    const element = document.getElementById("invoice-container");
    if (element) {
      html2pdf().from(element).save("factura.pdf");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!billData) return <p>No se encontraron datos.</p>;

  const { user, concept, details } = billData;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "100px", marginBottom: "50px" }}>
      {/* Contenedor de la factura */}
      <div id="invoice-container" className="invoice-container">
        <div className="wrapper text-center bold text-20" style={{ width: "100%", borderBottom: "0" }}>
          ORIGINAL
        </div>

        <div className="flex relative">
          <div className="wrapper inline-block w50 flex" style={{ borderRight: "0" }}>
            <h3 className="text-center" style={{ fontSize: "24px", marginBottom: "3px", width: "100%" }}>
              {user.userFirstName} {user.userLastName}
            </h3>
            <p style={{ fontSize: "13px", lineHeight: "1.5", marginBottom: "0", alignSelf: "flex-end" }}>
              <b>Razón Social:</b> {user.userFirstName} {user.userLastName}
              <br />
              <b>Domicilio Comercial:</b> {user.address}
              <br />
              <b>Condición frente al IVA:</b> Responsable Monotributo
            </p>
          </div>
          <div className="wrapper inline-block w50">
            <h3 className="text-center" style={{ fontSize: "24px", marginBottom: "3px" }}>
              FACTURA
            </h3>
            <p style={{ fontSize: "13px", lineHeight: "1.5", marginBottom: "0", textAlign: "right" }}>
              <b>Punto de Venta: 00001 Comp. Nro: 00000111</b>
              <br />
              <b>Fecha de Emisión:</b> {details.dateBill}
              <br />
              <b>CUIT:</b> 11234567899
              <br />
              <b>Ingresos Brutos:</b> exento
              <br />
              <b>Fecha de Inicio de Actividades:</b> 01/01/1930
            </p>
          </div>
          <div className="wrapper floating-mid">
            <h3 className="no-margin text-center" style={{ fontSize: "36px" }}>
              C
            </h3>
            <h5 className="no-margin text-center">COD. 007</h5>
          </div>
        </div>

        <div className="wrapper flex space-around" style={{ marginTop: "1px" }}>
          <span>
            <b>Período Facturado Desde:</b> {details.dateBill}
          </span>
          <span>
            <b>Hasta:</b> {details.dateBill}
          </span>
          <span>
            <b>Fecha de Vto. para el pago:</b> {details.dateBill}
          </span>
        </div>

        <div className="wrapper" style={{ marginTop: "2px", fontSize: "12px" }}>
          <div className="flex" style={{ marginBottom: "15px" }}>
            <span style={{ width: "30%" }}>
              <b>CUIT:</b> 11234567899
            </span>
            <span>
              <b>Apellido y Nombre / Razón Social:</b> {user.userFirstName} {user.userLastName}
            </span>
          </div>
          <div className="flex" style={{ flexWrap: "nowrap", marginBottom: "5px" }}>
            <span style={{ width: "70%" }}>
              <b>Condición frente al IVA:</b> IVA Responsable Inscripto
            </span>
            <span>
              <b>Domicilio:</b> {user.address}
            </span>
          </div>
          <div className="flex">
            <span>
              <b>Condición de venta:</b> Otra
            </span>
          </div>
        </div>

        <table style={{ marginTop: "5px" }}>
          <thead>
            <tr>
              <th className="text-left">Código</th>
              <th className="text-left">Producto / Servicio</th>
              <th>Cantidad</th>
              <th>U. Medida</th>
              <th>Precio Unit.</th>
              <th>% Bonif</th>
              <th>Subtotal</th>
              <th>Alicuota IVA</th>
              <th>Subtotal c/IVA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-left">1</td>
              <td className="text-left">Servicios Profesionales</td>
              <td className="text-right">1,00</td>
              <td className="text-center">otras unidades</td>
              <td className="text-right">100,00</td>
              <td className="text-center">0,00</td>
              <td className="text-center">100,00</td>
              <td className="text-right">1,21</td>
              <td className="text-right">121,00</td>
            </tr>
          </tbody>
        </table>

        <div className="footer" style={{ marginTop: "300px" }}>
          <div className="flex wrapper space-between">
            <div style={{ width: "55%" }}>
              <p className="bold">Otros tributos</p>
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Detalle</th>
                    <th className="text-right">Alíc. %</th>
                    <th className="text-right">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Per./Ret. de Impuesto a las Ganancias</td>
                    <td></td>
                    <td></td>
                    <td className="text-right">0,00</td>
                  </tr>
                  <tr>
                    <td>Per./Ret. de IVA</td>
                    <td></td>
                    <td></td>
                    <td className="text-right">0,00</td>
                  </tr>
                  <tr>
                    <td>Impuestos Internos</td>
                    <td></td>
                    <td></td>
                    <td className="text-right">0,00</td>
                  </tr>
                  <tr>
                    <td>Impuestos Municipales</td>
                    <td></td>
                    <td></td>
                    <td className="text-right">0,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ width: "40%", marginTop: "40px" }} className="flex wrapper">
              <span className="text-right" style={{ width: "60%" }}>
                <b>Importe Neto Gravado: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 27%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 21%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 10.5%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 5%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 2.5%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>IVA 0%: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>Importe Otros Tributos: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>0,00</b>
              </span>
              <span className="text-right" style={{ width: "60%" }}>
                <b>Importe Total: $</b>
              </span>
              <span className="text-right" style={{ width: "40%" }}>
                <b>{details.total}</b>
              </span>
            </div>
          </div>
          <div className="flex relative" style={{ marginTop: "20px" }}>
            <div className="qr-container" style={{ padding: "0 20px 20px 20px", width: "20%" }}>
              <img src="qr.png" style={{ maxWidth: "100%" }} alt="QR Code" />
            </div>
            <div style={{ paddingLeft: "10px", width: "45%" }}>
              <img src="afip-logo.png" style={{ maxWidth: "130px" }} alt="AFIP Logo" />
              <h4 className="italic bold">Comprobante Autorizado</h4>
              <p className="small italic bold" style={{ fontSize: "9px" }}>
                Esta Administración Federal no se responsabiliza por los datos ingresados en el detalle de la operación
              </p>
            </div>
            <div className="flex" style={{ alignSelf: "flex-start", width: "35%" }}>
              <span className="text-right" style={{ width: "50%" }}>
                <b>CAE N°:</b>
              </span>
              <span className="text-left" style={{ paddingLeft: "10px" }}>
                12345678901234
              </span>
              <span className="text-right" style={{ width: "50%" }}>
                <b>Fecha de Vto. de CAE:</b>
              </span>
              <span className="text-left" style={{ paddingLeft: "10px" }}>
                {details.dateBill}
              </span>
            </div>
            <span className="floating-mid bold">Pág 1/1</span>
          </div>
        </div>
      </div>

      {/* Botones de impresión y exportación a PDF */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }} className="no-print">
        <a className="bi bi-printer-fill btn btn-success btn-lg mt-4" onClick={handlePrint} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}> Imprimir</a>
        <a className="bi bi-file-earmark-pdf-fill btn btn-danger  btn-lg mt-4" onClick={handleExportToPDF} style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}> Exportar a PDF</a>
      </div>
    </div>
  );
};

export default billComponent;