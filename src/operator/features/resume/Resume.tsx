import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ResumeDto } from "../../../core/models/dto/ResumeDto";
import { getData } from "../../../core/services/apiService";
import { PeriodSelectorDto } from "../../../core/models/dto/PeriodSelectorDto";
import { BillCountsDto } from "../../../core/models/dto/BillCountDto";
import { UserDebtDto } from "../../../core/models/dto/UserDebtDto";
import { ReadingMatrixDto } from "../../../core/models/dto/ReadingMatrixDto";
import CustomSelect from "../../../shared/components/custom-select/CustomSelect";
import PageHeader from "../../../shared/components/PageHeader";
import "./Resume.css";

// Rediseño "2a: Flujo del período" (ver design_handoff_resumen_1a/README.md,
// sección final): el ciclo Lecturas → Facturación → Cobranza es la columna
// vertebral de la pantalla y cada cifra aparece una sola vez. Paleta y
// espaciados son los del handoff (hi-fi, marcados como finales), no los
// tokens globales del resto del sistema — de ahí las clases "rr-*" con sus
// propios colores. La tarjeta de "Facturación" (donut + leyenda) se
// mantiene igual a como estaba en la iteración anterior (pedido explícito),
// solo cambia de lugar dentro del layout nuevo.

type PeriodState = "notStarted" | "inProgress" | "invoiced";

const PERIOD_STATE_CONFIG: Record<
    PeriodState,
    { label: string; badgeClass: string }
> = {
    notStarted: { label: "Sin iniciar", badgeClass: "rr-badge-warning" },
    inProgress: { label: "Lecturas en curso", badgeClass: "rr-badge-info" },
    invoiced: { label: "Facturado", badgeClass: "rr-badge-success" },
};

type CtaKey = "start" | "continue" | "emit" | "view";

// Colores de la barra apilada de usuarios y de las barras de "Usuarios por
// tarifa": van del más al menos saturado según la posición (1°, 2°, 3°+),
// igual que en el handoff.
const FEE_BAR_COLORS = ["#0F6BFF", "#4E93FF", "#8FB8FF"];

const formatCurrencyCompact = (value: number): string =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    }).format(value);

// "hoy 09:40" / "25/08 09:40" — para la bajada del header ("Información
// general del sistema · {esto}").
const formatShortTimeLabel = (date: Date): string => {
    const time = date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
    });
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) return `hoy ${time}`;
    const day = date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
    });
    return `${day} ${time}`;
};

const Resume = () => {
    // Estados
    const navigate = useNavigate();
    const [data, setData] = useState<ResumeDto | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [periods, setPeriods] = useState<PeriodSelectorDto[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
    const [billChartData, setBillChartData] = useState<BillCountsDto | null>(
        null
    );
    const [loadingChart, setLoadingChart] = useState(false);
    const [debtors, setDebtors] = useState<UserDebtDto[]>([]);
    const [debtorsLoaded, setDebtorsLoaded] = useState(false);
    const [readingMatrix, setReadingMatrix] = useState<ReadingMatrixDto | null>(
        null
    );
    const [readingMatrixLoaded, setReadingMatrixLoaded] = useState(false);

    // Función para obtener el resumen de los datos
    const fetchResume = async () => {
        setLoading(true);
        try {
            const resume = await getData<ResumeDto>(
                "/operator/resume-supplier"
            );
            setData(resume);
            setLastUpdated(new Date());
        } catch (error) {
            setError("Error al cargar la información principal");
            alert("Error al obtener los datos" + error);
        } finally {
            setLoading(false);
        }
    };

    // Función para obtener los periodos al cargar el componente
    const fetchPeriods = async () => {
        try {
            const response =
                await getData<PeriodSelectorDto[]>("/operator/periods");
            setPeriods(response);
            const activePeriod = response.find((p) => p.active);
            if (activePeriod) {
                setSelectedPeriod(activePeriod.idPeriod);
            }
        } catch (error) {
            console.error(error);
            alert("Error al obtener los períodos");
        }
    };

    // Función para obtener las facturas por periodo
    const fetchBillChart = async (idPeriod: number) => {
        setLoadingChart(true);
        try {
            const response = await getData<BillCountsDto>(
                `/operator/bill-counts/${idPeriod}`
            );
            setBillChartData(response);
        } catch (error) {
            console.error(error);
            alert("Error al obtener gráfico de facturas");
        } finally {
            setLoadingChart(false);
        }
    };

    // Función para obtener el estado de deuda ("Deuda acumulada"). Mismo
    // endpoint que usa Gestión de Deudores (rol operador) — no el de Balance
    // (ese sí es exclusivo de administrador). Se degrada en silencio (sin
    // alert) si falla, en vez de interrumpir la carga del resto del resumen
    // por un dato secundario.
    const fetchDebtors = async () => {
        try {
            const response = await getData<UserDebtDto[]>("/operator/debtors");
            setDebtors(response);
        } catch (error) {
            console.error(error);
        } finally {
            setDebtorsLoaded(true);
        }
    };

    // Función para obtener la matriz de lecturas (misma fuente que usa
    // "Lecturas > Controlar" para detectar "Lectura sin medidor"). Se usa acá
    // solo para contar medidores rotos/sin instalar en el padrón — ver
    // "missingMeters" más abajo. Se degrada en silencio si falla, igual que
    // fetchDebtors: es un dato secundario, no debería tumbar el resto del
    // resumen.
    const fetchReadingMatrix = async () => {
        try {
            const response = await getData<ReadingMatrixDto>(
                "/operator/reading-matrix"
            );
            setReadingMatrix(response);
        } catch (error) {
            console.error(error);
        } finally {
            setReadingMatrixLoaded(true);
        }
    };

    useEffect(() => {
        fetchResume();
        fetchPeriods();
        fetchDebtors();
        fetchReadingMatrix();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            fetchBillChart(selectedPeriod);
        }
    }, [selectedPeriod]);

    // Paso 1 del pipeline: lecturas del período activo.
    const doneReadings = data?.fullReadings ?? 0;
    const pendingReadings = data?.incompleteReadings ?? 0;
    const totalReadings = doneReadings + pendingReadings;
    const readingsPct =
        totalReadings > 0
            ? Math.round((doneReadings / totalReadings) * 100)
            : 0;

    // Pasos 2 y 3 del pipeline: facturación/cobranza del período elegido en
    // el selector del header (mismo estado que usa la card "Facturación").
    const paidBills = billChartData?.paidBills ?? 0;
    const unpaidBills = billChartData?.unpaidBills ?? 0;
    const emittedBills = paidBills + unpaidBills;
    const hasInvoiceData = emittedBills > 0;
    const pagasPct = hasInvoiceData
        ? Math.round((paidBills / emittedBills) * 100)
        : 0;
    const impagasPct = hasInvoiceData
        ? Math.round((unpaidBills / emittedBills) * 100)
        : 0;
    const invoicesData = useMemo(
        () => [
            { name: "Pagas", value: paidBills, color: "#18A957" },
            { name: "Impagas", value: unpaidBills, color: "#E5484D" },
        ],
        [paidBills, unpaidBills]
    );
    // Texto de período mostrado en la cabecera de la card (no interactivo —
    // el selector real vive en el header de la página).
    const selectedPeriodInfo = periods.find(
        (period) => period.idPeriod === selectedPeriod
    );

    // doneReadings/totalReadings salen de /operator/resume-supplier, que no
    // admite período: siempre reflejan el período ACTIVO, sin importar cuál
    // esté elegido en el selector de arriba. Para cualquier otro período, ni
    // siquiera "totalReadings" (el total de HOY) es necesariamente el de ese
    // período — pudo tener otra cantidad de usuarios/medidores en su momento.
    // La cantidad de facturas emitidas de ESE período es un proxy más fiel
    // (cada factura emitida necesitó su lectura), así que "de cuántas" pasa a
    // ser esa cifra en vez de la de hoy — parche de frente hasta que el back
    // exponga lecturas por período (ver lista pendiente).
    const isViewingActivePeriod = selectedPeriodInfo?.active ?? true;
    const effectiveTotalReadings = isViewingActivePeriod
        ? totalReadings
        : emittedBills > 0
          ? emittedBills
          : totalReadings;
    const effectiveDoneReadings = isViewingActivePeriod
        ? doneReadings
        : effectiveTotalReadings;
    const effectiveReadingsPct = isViewingActivePeriod
        ? readingsPct
        : effectiveTotalReadings > 0
          ? 100
          : 0;

    // Estado general del período + paso activo del pipeline: el primer paso
    // incompleto es el activo, los anteriores quedan "done", los
    // posteriores "pending".
    const periodState: PeriodState =
        effectiveDoneReadings === 0
            ? "notStarted"
            : !hasInvoiceData
              ? "inProgress"
              : "invoiced";
    const periodStateConfig = PERIOD_STATE_CONFIG[periodState];
    const pipelineStep =
        effectiveDoneReadings === 0 ||
        effectiveDoneReadings < effectiveTotalReadings
            ? 1
            : !hasInvoiceData
              ? 2
              : 3;
    // No se puede emitir con lecturas incompletas: el botón "Emitir facturas"
    // del estado vacío se deshabilita mientras falten.
    const readingsIncomplete =
        effectiveTotalReadings === 0 ||
        effectiveDoneReadings < effectiveTotalReadings;
    const stepStateClass = (step: number): string =>
        step < pipelineStep
            ? "rr-pipeline-step-done"
            : step === pipelineStep
              ? "rr-pipeline-step-active"
              : "rr-pipeline-step-pending";

    const CTA_CONFIG: Record<CtaKey, { label: string; onClick: () => void }> = {
        start: {
            label: "Comenzar carga de lecturas",
            onClick: () => navigate("/dashboard/operator/readings/take"),
        },
        continue: {
            label: "Continuar carga",
            onClick: () => navigate("/dashboard/operator/readings/take"),
        },
        emit: {
            label: "Emitir facturas",
            onClick: () => navigate("/dashboard/operator/bills/generate"),
        },
        view: {
            label: "Ver cobranza",
            onClick: () => navigate("/dashboard/operator/bills/management"),
        },
    };
    const ctaKey: CtaKey =
        effectiveDoneReadings === 0
            ? "start"
            : effectiveDoneReadings < effectiveTotalReadings
              ? "continue"
              : !hasInvoiceData
                ? "emit"
                : "view";
    const ctaConfig = CTA_CONFIG[ctaKey];

    // Padrón de usuarios: total + barra apilada (fracción exacta) + leyenda.
    const activeUsers = data?.activeUsers ?? 0;
    const suspendedUsers = data?.suspendedUsers ?? 0;
    const inactiveUsers = data?.inactiveUsers ?? 0;
    const totalUsers = activeUsers + suspendedUsers + inactiveUsers;
    const activeFrac = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const suspendedFrac =
        totalUsers > 0 ? (suspendedUsers / totalUsers) * 100 : 0;
    const inactiveFrac =
        totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;

    // "Medidores faltantes": NO es data.missingMeters (ese campo del back
    // refleja si la unidad tiene un medidor asignado, y hoy siempre da 0 acá).
    // La definición real, la misma que usa "Lecturas > Controlar" para marcar
    // "Lectura sin medidor" (ver getReadingAlert en ReadingControlPage.tsx):
    // si las dos últimas lecturas CARGADAS de una conexión son ambas cero, su
    // medidor está roto/ausente/sin instalar — igual se carga 0 para poder
    // facturar. Importante: son las dos últimas que tengan un valor (no
    // null), no las dos últimas columnas de período — recién arrancado un
    // período casi nadie tiene lectura ahí todavía (null, no cero), así que
    // comparar por posición de período daría falsos negativos hasta que el
    // período avance. Con menos de 2 lecturas cargadas en total no hay forma
    // de saberlo todavía.
    //
    // A propósito NO depende del período elegido en el selector del header
    // (a diferencia de la card "Facturación"): es "estado actual", igual
    // que las cards de Padrón de usuarios y Deuda acumulada, que tampoco
    // recalculan por período — un medidor roto es un problema de HOY que
    // hay que resolver, no algo que tenga sentido consultar en pasado.
    const missingMeters = useMemo(() => {
        if (!readingMatrix) return 0;
        return readingMatrix.rows.filter((row) => {
            const recorded = row.readings.filter((reading) => reading !== null);
            if (recorded.length < 2) return false;
            const [previous, current] = recorded.slice(-2);
            return current === 0 && previous === 0;
        }).length;
    }, [readingMatrix]);

    // Deuda acumulada: cantidad + % del padrón + monto adeudado (si el
    // endpoint trae el detalle de facturas por usuario). "debts" es opcional
    // en el DTO — si ningún deudor lo trae poblado, se omite el monto en vez
    // de mostrar un "$0" engañoso.
    const debtorsCount = debtors.length;
    const hasDebtAmountData = debtors.some(
        (debtor) => (debtor.debts?.length ?? 0) > 0
    );
    const debtorsTotalAmount = debtors.reduce(
        (total, debtor) =>
            total +
            (debtor.debts?.reduce((sum, item) => sum + item.amount, 0) ?? 0),
        0
    );
    const debtorsPctOfPadron =
        totalUsers > 0 ? (debtorsCount / totalUsers) * 100 : 0;

    // Usuarios por tarifa: orden descendente por cantidad (el back no lo
    // garantiza), ancho de barra proporcional al máximo (no al total), y
    // porcentaje mostrado sobre el total del padrón.
    const feeRows = useMemo(() => {
        const rows = (data?.usersForFee ?? [])
            .slice()
            .sort((a, b) => b.count - a.count);
        const maxCount = Math.max(1, ...rows.map((row) => row.count));
        return rows.map((row, index) => ({
            fee: row.fee,
            count: row.count,
            widthPct: (row.count / maxCount) * 100,
            pctOfTotal:
                totalUsers > 0 ? Math.round((row.count / totalUsers) * 100) : 0,
            color: FEE_BAR_COLORS[Math.min(index, FEE_BAR_COLORS.length - 1)],
        }));
    }, [data, totalUsers]);

    return (
        <div className="content-fade-in">
            <PageHeader
                title="Resumen"
                subtitle={`Información general del sistema · ${lastUpdated ? formatShortTimeLabel(lastUpdated) : "actualizando…"}`}
                icon="bi bi-person-lines-fill"
            >
                <div className="rr-header-controls">
                    <div className="rr-info-chip">
                        {data?.activeModality || "—"}
                    </div>
                    <div className="rr-info-chip">
                        {data?.activeUnitService || "—"}
                    </div>
                    <CustomSelect
                        className="rr-header-period-select"
                        fullWidth={false}
                        value={
                            selectedPeriod !== null
                                ? String(selectedPeriod)
                                : ""
                        }
                        onChange={(v) => setSelectedPeriod(Number(v))}
                        options={periods.map((period) => ({
                            value: String(period.idPeriod),
                            label: `${period.label}${period.active ? " (Actual)" : ""}`,
                        }))}
                    />
                </div>
            </PageHeader>
            <div className="rr-shell">
                {loading ? (
                    <>
                        {/* Pipeline */}
                        <div className="rr-card rr-pipeline-card">
                            <div
                                className="skeleton skeleton-line"
                                style={{ width: 160, height: 17 }}
                            ></div>
                            <div className="rr-pipeline-steps">
                                {[0, 1, 2].map((step) => (
                                    <div
                                        key={step}
                                        className={`rr-pipeline-step ${step === 2 ? "rr-pipeline-step-last" : ""}`}
                                    >
                                        <div
                                            className="skeleton skeleton-line"
                                            style={{ width: 90, height: 14 }}
                                        ></div>
                                        <div
                                            className="skeleton"
                                            style={{
                                                width: "100%",
                                                height: 6,
                                                borderRadius: 999,
                                            }}
                                        ></div>
                                        <div
                                            className="skeleton skeleton-line"
                                            style={{ width: 110, height: 11 }}
                                        ></div>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="skeleton skeleton-line"
                                style={{
                                    width: 190,
                                    height: 46,
                                    borderRadius: 10,
                                }}
                            ></div>
                        </div>

                        {/* Padrón */}
                        <div className="rr-padron-row">
                            {[0, 1, 2].map((card) => (
                                <div key={card} className="rr-padron-card">
                                    <div className="rr-padron-head">
                                        <div
                                            className="skeleton skeleton-line"
                                            style={{ width: 110, height: 11 }}
                                        ></div>
                                        <div
                                            className="skeleton"
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 7,
                                            }}
                                        ></div>
                                    </div>
                                    <div
                                        className="skeleton skeleton-line"
                                        style={{ width: 90, height: 44 }}
                                    ></div>
                                    <div
                                        className="skeleton"
                                        style={{
                                            width: "100%",
                                            height: 8,
                                            borderRadius: 999,
                                        }}
                                    ></div>
                                </div>
                            ))}
                        </div>

                        {/* Fila de análisis */}
                        <div className="rr-analysis-row">
                            <div className="rr-card rr-fee-card">
                                <div className="rr-fee-head">
                                    <div
                                        className="skeleton skeleton-line"
                                        style={{ width: 140, height: 16 }}
                                    ></div>
                                    <div
                                        className="skeleton skeleton-line"
                                        style={{ width: 120, height: 11 }}
                                    ></div>
                                </div>
                                <div className="rr-fee-rows">
                                    {[100, 40, 20, 20].map((width, index) => (
                                        <div key={index} className="rr-fee-row">
                                            <div
                                                className="skeleton skeleton-line"
                                                style={{
                                                    width: "80%",
                                                    height: 12,
                                                }}
                                            ></div>
                                            <div
                                                className="skeleton"
                                                style={{
                                                    width: `${width}%`,
                                                    height: 10,
                                                    borderRadius: 999,
                                                }}
                                            ></div>
                                            <div
                                                className="skeleton skeleton-line"
                                                style={{
                                                    width: "100%",
                                                    height: 12,
                                                }}
                                            ></div>
                                            <div
                                                className="skeleton skeleton-line"
                                                style={{
                                                    width: "100%",
                                                    height: 12,
                                                }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rr-card rr-billing-card">
                                <div className="rr-billing-head">
                                    <div
                                        className="skeleton skeleton-line"
                                        style={{ width: 100, height: 16 }}
                                    ></div>
                                    <div className="d-flex align-items-center gap-2">
                                        <div
                                            className="skeleton skeleton-line"
                                            style={{ width: 80, height: 12 }}
                                        ></div>
                                        <div
                                            className="skeleton"
                                            style={{
                                                width: 26,
                                                height: 26,
                                                borderRadius: 7,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="rr-billing-main">
                                    <div className="rr-donut-row">
                                        <div
                                            className="skeleton rr-donut rr-donut-lg"
                                            style={{ borderRadius: "50%" }}
                                        ></div>
                                        <div className="rr-billing-stats">
                                            <div
                                                className="skeleton"
                                                style={{
                                                    height: 78,
                                                    borderRadius: 12,
                                                }}
                                            ></div>
                                            <div
                                                className="skeleton"
                                                style={{
                                                    height: 78,
                                                    borderRadius: 12,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : error ? (
                    <div className="text-center py-5">{error}</div>
                ) : (
                    <>
                        {/* Pipeline: "Estado del período" */}
                        <div className="rr-card rr-pipeline-card">
                            <div className="rr-pipeline-title">
                                <div className="rr-pipeline-title-text">
                                    Estado del período
                                </div>
                                <div
                                    className={`rr-badge ${periodStateConfig.badgeClass}`}
                                >
                                    <div className="rr-badge-dot"></div>
                                    <span>{periodStateConfig.label}</span>
                                </div>
                            </div>

                            <div className="rr-pipeline-steps">
                                <div
                                    className={`rr-pipeline-step ${stepStateClass(1)}`}
                                >
                                    <div className="rr-pipeline-step-head">
                                        <div className="rr-pipeline-step-circle">
                                            {pipelineStep > 1 ? (
                                                <i className="bi bi-check-lg"></i>
                                            ) : (
                                                "1"
                                            )}
                                        </div>
                                        <div className="rr-pipeline-step-name">
                                            Lecturas
                                        </div>
                                    </div>
                                    <div className="rr-pipeline-step-track">
                                        <div
                                            className="rr-pipeline-step-fill"
                                            style={{
                                                width: `${effectiveReadingsPct}%`,
                                                backgroundColor: "#0F6BFF",
                                            }}
                                        ></div>
                                    </div>
                                    <div className="rr-pipeline-step-caption">
                                        {effectiveDoneReadings} de{" "}
                                        {effectiveTotalReadings} registradas
                                    </div>
                                </div>

                                <div
                                    className={`rr-pipeline-step ${stepStateClass(2)}`}
                                >
                                    <div className="rr-pipeline-step-head">
                                        <div className="rr-pipeline-step-circle">
                                            {pipelineStep > 2 ? (
                                                <i className="bi bi-check-lg"></i>
                                            ) : (
                                                "2"
                                            )}
                                        </div>
                                        <div className="rr-pipeline-step-name">
                                            Facturación
                                        </div>
                                    </div>
                                    <div className="rr-pipeline-step-track">
                                        <div
                                            className="rr-pipeline-step-fill"
                                            style={{
                                                width: hasInvoiceData
                                                    ? "100%"
                                                    : "0%",
                                                backgroundColor: "#0F6BFF",
                                            }}
                                        ></div>
                                    </div>
                                    <div className="rr-pipeline-step-caption">
                                        {emittedBills} facturas emitidas
                                    </div>
                                </div>

                                <div
                                    className={`rr-pipeline-step rr-pipeline-step-last ${stepStateClass(3)}`}
                                >
                                    <div className="rr-pipeline-step-head">
                                        <div className="rr-pipeline-step-circle">
                                            3
                                        </div>
                                        <div className="rr-pipeline-step-name">
                                            Cobranza
                                        </div>
                                    </div>
                                    <div className="rr-pipeline-step-track">
                                        <div
                                            className="rr-pipeline-step-fill"
                                            style={{
                                                width: `${pagasPct}%`,
                                                backgroundColor: "#18A957",
                                            }}
                                        ></div>
                                    </div>
                                    <div className="rr-pipeline-step-caption">
                                        {paidBills} de {emittedBills} cobradas
                                    </div>
                                </div>
                            </div>

                            <div
                                className="rr-btn rr-btn-primary rr-pipeline-cta"
                                onClick={ctaConfig.onClick}
                            >
                                {ctaConfig.label}
                            </div>
                        </div>

                        {/* Padrón: 3 tarjetas, ninguna repite el pipeline. Sin pie: el destino
                            viaja como ícono junto al eyebrow, y ese ícono es el <a> real que
                            cubre toda la card (ver rr-padron-icon-link en el CSS). */}
                        <div className="rr-padron-row">
                            <div className="rr-padron-card">
                                <div className="rr-padron-head">
                                    <div className="rr-padron-eyebrow">
                                        Padrón de usuarios
                                    </div>
                                    <Link
                                        to="/dashboard/operator/users"
                                        aria-label="Ver usuarios"
                                        className="rr-padron-icon-link"
                                    >
                                        <i className="bi bi-arrow-up-right"></i>
                                    </Link>
                                </div>
                                <div className="rr-padron-figure">
                                    <div className="rr-padron-value">
                                        {totalUsers}
                                    </div>
                                </div>
                                <div className="rr-stack-track">
                                    <div
                                        className="rr-stack-seg"
                                        style={{
                                            width: `${activeFrac}%`,
                                            backgroundColor: "#18A957",
                                        }}
                                    ></div>
                                    <div
                                        className="rr-stack-seg"
                                        style={{
                                            width: `${suspendedFrac}%`,
                                            backgroundColor: "#E8890C",
                                        }}
                                    ></div>
                                    <div
                                        className="rr-stack-seg"
                                        style={{
                                            width: `${inactiveFrac}%`,
                                            backgroundColor: "#8B97A8",
                                        }}
                                    ></div>
                                </div>
                                <div className="rr-legend">
                                    <div className="rr-legend-item">
                                        <div
                                            className="rr-legend-dot"
                                            style={{
                                                backgroundColor: "#18A957",
                                            }}
                                        ></div>
                                        <span>
                                            <b>{activeUsers}</b> activos
                                        </span>
                                    </div>
                                    <div className="rr-legend-item">
                                        <div
                                            className="rr-legend-dot"
                                            style={{
                                                backgroundColor: "#E8890C",
                                            }}
                                        ></div>
                                        <span>
                                            <b>{suspendedUsers}</b> suspendidos
                                        </span>
                                    </div>
                                    <div className="rr-legend-item">
                                        <div
                                            className="rr-legend-dot"
                                            style={{
                                                backgroundColor: "#8B97A8",
                                            }}
                                        ></div>
                                        <span>
                                            <b>{inactiveUsers}</b> inactivos
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rr-padron-card">
                                <div className="rr-padron-head">
                                    <div className="rr-padron-eyebrow">
                                        Medidores faltantes
                                    </div>
                                    <Link
                                        to="/dashboard/operator/readings/control"
                                        aria-label="Ver lecturas sin medidor"
                                        className="rr-padron-icon-link"
                                    >
                                        <i className="bi bi-arrow-up-right"></i>
                                    </Link>
                                </div>
                                <div className="rr-padron-figure">
                                    <div className="rr-padron-value">
                                        {readingMatrixLoaded
                                            ? missingMeters
                                            : "—"}
                                    </div>
                                    {missingMeters === 0 ? (
                                        <div className="rr-tile-pill rr-tile-pill-success">
                                            <div className="rr-tile-pill-dot"></div>
                                            <span>Padrón completo</span>
                                        </div>
                                    ) : (
                                        <div className="rr-tile-pill rr-tile-pill-danger">
                                            <div className="rr-tile-pill-dot"></div>
                                            <span>Padrón incompleto</span>
                                        </div>
                                    )}
                                </div>
                                <div className="rr-padron-note">
                                    {missingMeters === 0
                                        ? "No hay medidores rotos, ausentes o sin instalar detectados."
                                        : "Se detectaron medidores rotos, ausentes o sin instalar. \nRevise las lecturas cargadas en cero para corregir."}
                                </div>
                            </div>

                            <div className="rr-padron-card">
                                <div className="rr-padron-head">
                                    <div className="rr-padron-eyebrow">
                                        Deuda acumulada
                                    </div>
                                    <Link
                                        to="/dashboard/operator/debt-disconnection"
                                        aria-label="Ver deudores"
                                        className="rr-padron-icon-link"
                                    >
                                        <i className="bi bi-arrow-up-right"></i>
                                    </Link>
                                </div>
                                <div className="rr-padron-figure">
                                    <div className="rr-padron-value">
                                        {debtorsLoaded ? debtorsCount : "—"}
                                    </div>
                                    <div className="rr-padron-sub">
                                        deudores
                                        {totalUsers > 0
                                            ? ` · ${debtorsPctOfPadron.toLocaleString("es-AR", { maximumFractionDigits: 1 })}% del padrón`
                                            : ""}
                                    </div>
                                </div>
                                <div className="rr-padron-debt-row">
                                    <div className="rr-padron-debt-track">
                                        <div
                                            className="rr-padron-debt-fill"
                                            style={{
                                                width: `${debtorsPctOfPadron}%`,
                                            }}
                                        ></div>
                                    </div>
                                    {hasDebtAmountData && (
                                        <div className="rr-padron-debt-amount">
                                            {formatCurrencyCompact(
                                                debtorsTotalAmount
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fila de análisis: Usuarios por tarifa + Facturación */}
                        <div className="rr-analysis-row">
                            <div className="rr-card rr-fee-card">
                                <div className="rr-fee-head">
                                    <div className="rr-card-title">
                                        Usuarios por tarifa
                                    </div>
                                    <div className="rr-card-title-sub">
                                        Distribución del padrón
                                    </div>
                                </div>
                                <div className="rr-fee-rows">
                                    {feeRows.map((row) => (
                                        <div
                                            key={row.fee}
                                            className="rr-fee-row"
                                        >
                                            <div className="rr-fee-label">
                                                {row.fee}
                                            </div>
                                            <div className="rr-fee-track">
                                                <div
                                                    className="rr-fee-fill"
                                                    style={{
                                                        width: `${row.widthPct}%`,
                                                        backgroundColor:
                                                            row.color,
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="rr-fee-value">
                                                {row.count}
                                            </div>
                                            <div className="rr-fee-pct">
                                                {row.pctOfTotal}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Facturación (variante "4c"): el selector de período vive en el
                                header de la página; acá solo se muestra como texto. Dos layouts
                                según el ancho (rr-billing-wide / rr-billing-narrow), mostrados u
                                ocultos por CSS — ver reglas en Resume.css. El monto por estado que
                                pide el diseño no existe todavía en la API: el porcentaje ocupa ese
                                lugar (decisión explícita, no es un dato inventado). */}
                            <div className="rr-card rr-billing-card">
                                <div className="rr-billing-head">
                                    <div className="rr-card-title">
                                        Facturación
                                    </div>
                                    <div className="rr-billing-head-right">
                                        <div className="rr-billing-period">
                                            {selectedPeriodInfo?.label ?? "—"}
                                            {selectedPeriodInfo?.active && (
                                                <span className="rr-billing-period-actual">
                                                    {" "}
                                                    (actual)
                                                </span>
                                            )}
                                        </div>
                                        {/* El destino "Gestionar facturas" vive acá como ícono (mismo
                                            patrón que Padrón/Medidores/Deuda) solo cuando hay algo que
                                            gestionar; en el estado vacío la acción es otra (emitir), y
                                            ahí sigue siendo un botón — ver más abajo. */}
                                        {hasInvoiceData && (
                                            <Link
                                                to="/dashboard/operator/bills/management"
                                                aria-label="Gestionar facturas"
                                                className="rr-padron-icon-link"
                                            >
                                                <i className="bi bi-arrow-up-right"></i>
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {loadingChart ? (
                                    <div className="d-flex align-items-center justify-content-center flex-grow-1 gap-3">
                                        <div
                                            className="skeleton flex-shrink-0"
                                            style={{
                                                width: 150,
                                                height: 150,
                                                borderRadius: "50%",
                                            }}
                                        ></div>
                                        <div className="d-flex flex-column gap-2 flex-grow-1">
                                            <div
                                                className="skeleton"
                                                style={{
                                                    height: 78,
                                                    borderRadius: 12,
                                                }}
                                            ></div>
                                            <div
                                                className="skeleton"
                                                style={{
                                                    height: 78,
                                                    borderRadius: 12,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ) : hasInvoiceData ? (
                                    <div className="rr-billing-body">
                                        {/* ≥1000px: dona grande + cajas tintadas */}
                                        <div className="rr-billing-main rr-billing-wide">
                                            <div className="rr-donut-row">
                                                <div className="rr-donut rr-donut-lg">
                                                    <ResponsiveContainer
                                                        width={150}
                                                        height={150}
                                                    >
                                                        <PieChart>
                                                            <Pie
                                                                data={
                                                                    invoicesData
                                                                }
                                                                dataKey="value"
                                                                nameKey="name"
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={47}
                                                                outerRadius={72}
                                                                paddingAngle={3}
                                                                cornerRadius={7}
                                                                stroke="none"
                                                            >
                                                                {invoicesData.map(
                                                                    (entry) => (
                                                                        <Cell
                                                                            key={
                                                                                entry.name
                                                                            }
                                                                            fill={
                                                                                entry.color
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Pie>
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                    <div className="rr-donut-center rr-donut-center-lg">
                                                        <div className="rr-donut-pct rr-donut-pct-lg">
                                                            {pagasPct}%
                                                        </div>
                                                        <div className="rr-donut-caption">
                                                            cobrado
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="rr-billing-stats">
                                                    <div className="rr-billing-stat rr-billing-stat-success">
                                                        <div className="rr-billing-stat-head">
                                                            <div className="rr-billing-stat-label">
                                                                <div
                                                                    className="rr-billing-legend-dot"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#18A957",
                                                                    }}
                                                                ></div>
                                                                <span>
                                                                    Pagas
                                                                </span>
                                                            </div>
                                                            <div className="rr-billing-stat-pct">
                                                                {pagasPct}%
                                                            </div>
                                                        </div>
                                                        <div className="rr-billing-stat-value">
                                                            {paidBills}
                                                        </div>
                                                    </div>
                                                    <div className="rr-billing-stat rr-billing-stat-danger">
                                                        <div className="rr-billing-stat-head">
                                                            <div className="rr-billing-stat-label">
                                                                <div
                                                                    className="rr-billing-legend-dot"
                                                                    style={{
                                                                        backgroundColor:
                                                                            "#E5484D",
                                                                    }}
                                                                ></div>
                                                                <span>
                                                                    Impagas
                                                                </span>
                                                            </div>
                                                            <div className="rr-billing-stat-pct">
                                                                {impagasPct}%
                                                            </div>
                                                        </div>
                                                        <div className="rr-billing-stat-value">
                                                            {unpaidBills}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* <1000px: dona chica + lista con divisor */}
                                        <div className="rr-billing-narrow">
                                            <div className="rr-donut rr-donut-sm">
                                                <ResponsiveContainer
                                                    width={96}
                                                    height={96}
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={invoicesData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={32}
                                                            outerRadius={48}
                                                            paddingAngle={3}
                                                            cornerRadius={5}
                                                            stroke="none"
                                                        >
                                                            {invoicesData.map(
                                                                (entry) => (
                                                                    <Cell
                                                                        key={
                                                                            entry.name
                                                                        }
                                                                        fill={
                                                                            entry.color
                                                                        }
                                                                    />
                                                                )
                                                            )}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="rr-donut-center rr-donut-center-sm">
                                                    <div className="rr-donut-pct rr-donut-pct-sm">
                                                        {pagasPct}%
                                                    </div>
                                                    <div className="rr-donut-caption">
                                                        cobrado
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rr-billing-list">
                                                <div className="rr-billing-list-item">
                                                    <div
                                                        className="rr-billing-legend-dot"
                                                        style={{
                                                            backgroundColor:
                                                                "#18A957",
                                                        }}
                                                    ></div>
                                                    <span className="rr-billing-list-label">
                                                        Pagas
                                                    </span>
                                                    <span className="rr-billing-list-value">
                                                        {paidBills}
                                                    </span>
                                                </div>
                                                <div className="rr-billing-divider"></div>
                                                <div className="rr-billing-list-item">
                                                    <div
                                                        className="rr-billing-legend-dot"
                                                        style={{
                                                            backgroundColor:
                                                                "#E5484D",
                                                        }}
                                                    ></div>
                                                    <span className="rr-billing-list-label">
                                                        Impagas
                                                    </span>
                                                    <span className="rr-billing-list-value">
                                                        {unpaidBills}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rr-empty-billing">
                                        <div className="rr-empty-rule"></div>
                                        <div className="rr-empty-title">
                                            Todavía no hay facturas emitidas
                                        </div>
                                        <div className="rr-empty-body">
                                            Las estadísticas de cobranza
                                            aparecen al emitir el primer lote
                                            del período.
                                        </div>
                                        <div
                                            className={`rr-btn rr-btn-secondary align-self-start ${readingsIncomplete ? "rr-btn-disabled" : ""}`}
                                            onClick={
                                                readingsIncomplete
                                                    ? undefined
                                                    : () =>
                                                          navigate(
                                                              "/dashboard/operator/bills/generate"
                                                          )
                                            }
                                        >
                                            Emitir facturas
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Resume;
