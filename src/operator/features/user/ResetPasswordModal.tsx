import React, { useEffect, useState } from "react";
import { Modal, Form, Button, Spinner } from "react-bootstrap";
import { UserDto } from "../../../core/models/dto/UserDto";
import { getAvatarColor } from "../../../core/utils/avatarColors";
import { formatDate } from "../../../core/utils/formatters";
import { getPasswordRuleResults, isPasswordValid, generateSecurePassword } from "../../../core/utils/passwordValidation";
import FormModalHeader from "../../../shared/components/form-modal-header/FormModalHeader";
import HintBox from "../../../shared/components/hint-box/HintBox";
import { useModalLayer } from "../../../context/ModalStackContext";

type ResetMethod = "temporary" | "dni" | "custom";

interface ResetPasswordModalProps {
    show: boolean;
    user: UserDto | null;
    isLoading?: boolean;
    onHide: () => void;
    onConfirm: (newPassword: string) => void;
}

// Campo de contraseña con ícono de candado y botón de ojo para mostrar/
// ocultar el valor. Genérico a este modal (temporal generada o custom).
const PasswordRevealField: React.FC<{
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
}> = ({ value, onChange, readOnly, placeholder, autoFocus }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="password-reveal-field">
            <i className="bi bi-lock-fill password-reveal-icon-start"></i>
            <Form.Control
                type={visible ? "text" : "password"}
                value={value}
                onChange={onChange ? (e) => onChange(e.target.value) : undefined}
                readOnly={readOnly}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="password-reveal-input"
            />
            <button
                type="button"
                className="password-reveal-toggle"
                onClick={() => setVisible((v) => !v)}
                tabIndex={-1}
                aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
                <i className={`bi ${visible ? "bi-eye-slash" : "bi-eye"}`}></i>
            </button>
        </div>
    );
};

// Modal de restablecimiento de contraseña, reutilizado tanto desde el menú
// de la fila (UserPage) como desde el menú de opciones del header de
// AddEditUserModal. 3 métodos: contraseña temporal random (front-only por
// ahora: no hay ningún flag de "debe cambiarla" en el backend todavía, solo
// se genera y se manda como contraseña nueva), DNI del usuario, o una
// definida a mano.
const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ show, user, isLoading, onHide, onConfirm }) => {
    const [mode, setMode] = useState<ResetMethod>("temporary");
    const [customPassword, setCustomPassword] = useState("");
    const [temporaryPassword, setTemporaryPassword] = useState("");
    const modalZIndex = useModalLayer(show);

    useEffect(() => {
        if (show) {
            setMode("temporary");
            setCustomPassword("");
            setTemporaryPassword(generateSecurePassword());
        }
    }, [show, user]);

    if (!user) return null;

    const avatarColor = getAvatarColor(`${user.firstName ?? ""}${user.lastName ?? ""}${user.idUser ?? ""}`);
    const initials = `${(user.firstName?.[0] || "").toUpperCase()}${(user.lastName?.[0] || "").toUpperCase()}`;
    const customPasswordRules = getPasswordRuleResults(customPassword.trim());
    const isCustomInvalid = customPassword.trim().length > 0 && !isPasswordValid(customPassword.trim());
    const canConfirm = mode !== "custom" || isPasswordValid(customPassword.trim());

    const handleConfirmClick = () => {
        const value = mode === "temporary" ? temporaryPassword : mode === "dni" ? user.dni?.toString() ?? "" : customPassword.trim();
        onConfirm(value);
    };

    return (
        <Modal show={show} onHide={onHide} centered size="lg" backdrop={false} style={{ zIndex: modalZIndex }} contentClassName="form-modal-content" aria-labelledby="reset-password-modal-title">
            <FormModalHeader
                icon="bi bi-shield-lock-fill"
                title="Restablecer contraseña"
                subtitle="Elegí el método para restablecer la contraseña del usuario."
                onClose={onHide}
                titleId="reset-password-modal-title"
            />

            <Modal.Body>
                <div className="user-summary-card mb-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <div className="row-avatar user-summary-avatar" style={{ backgroundColor: avatarColor.bg, color: avatarColor.color }}>
                            {initials || "US"}
                        </div>
                        <div>
                            <div className="fw-bold">{user.firstName} {user.lastName}</div>
                            <div className="text-muted small">
                                Conexión N.° {user.idUser}
                                {user.residenceDto?.serialNumber && <> &bull; Medidor {user.residenceDto.serialNumber}</>}
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-muted small">
                        <i className="bi bi-calendar3"></i>
                        <div>
                            <div>Fecha de registro</div>
                            <div className="fw-semibold text-dark">{formatDate(user.dateRegister)}</div>
                        </div>
                    </div>
                </div>

                <div className="fw-bold mb-2">Método de restablecimiento</div>

                <div className="option-card-list">
                    <label className={`option-card ${mode === "temporary" ? "active" : ""}`}>
                        <input type="radio" className="option-card-radio" name="reset-method" checked={mode === "temporary"} onChange={() => setMode("temporary")} />
                        <div className="option-card-icon" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                            <i className="bi bi-shield-check"></i>
                        </div>
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-bold">Generar contraseña temporal</span>
                                <span className="badge-soft badge-soft-success">Recomendado</span>
                            </div>
                            <div className="text-muted small">El sistema generará una contraseña temporal segura.</div>
                            {mode === "temporary" && (
                                <>
                                    <HintBox className="mt-2">El usuario deberá cambiarla al iniciar sesión.</HintBox>
                                    <div className="d-flex align-items-center gap-2 mt-2">
                                        <div className="flex-grow-1">
                                            <PasswordRevealField value={temporaryPassword} readOnly />
                                        </div>
                                        <button
                                            type="button"
                                            className="row-actions-edit"
                                            title="Generar otra"
                                            onClick={(e) => { e.preventDefault(); setTemporaryPassword(generateSecurePassword()); }}
                                        >
                                            <i className="bi bi-arrow-clockwise"></i>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </label>

                    <label className={`option-card ${mode === "dni" ? "active" : ""}`}>
                        <input type="radio" className="option-card-radio" name="reset-method" checked={mode === "dni"} onChange={() => setMode("dni")} />
                        <div className="option-card-icon" style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
                            <i className="bi bi-person-vcard-fill"></i>
                        </div>
                        <div className="flex-grow-1">
                            <div className="fw-bold">Usar el DNI del usuario</div>
                            <div className="text-muted small">La contraseña será el DNI del usuario ({user.dni}).</div>
                        </div>
                    </label>

                    <label className={`option-card ${mode === "custom" ? "active" : ""}`}>
                        <input type="radio" className="option-card-radio" name="reset-method" checked={mode === "custom"} onChange={() => setMode("custom")} />
                        <div className="option-card-icon" style={{ backgroundColor: "#f3e8ff", color: "#9333ea" }}>
                            <i className="bi bi-key-fill"></i>
                        </div>
                        <div className="flex-grow-1">
                            <div className="fw-bold">Definir una nueva contraseña</div>
                            <div className="text-muted small">Ingresá la nueva contraseña que utilizará el usuario.</div>
                            {mode === "custom" && (
                                <>
                                    <div className="mt-2">
                                        <PasswordRevealField
                                            value={customPassword}
                                            onChange={setCustomPassword}
                                            placeholder="Nueva contraseña"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="text-muted small mt-2 mb-1">La contraseña debe cumplir con:</div>
                                    <div className="password-requirement-pills">
                                        {customPasswordRules.map((rule) => (
                                            <span key={rule.key} className={`password-requirement-pill ${rule.passed ? "passed" : ""}`}>
                                                <i className={`bi ${rule.passed ? "bi-check-circle-fill" : "bi-circle"}`}></i>
                                                {rule.label}
                                            </span>
                                        ))}
                                    </div>
                                    {isCustomInvalid && <div className="text-danger small mt-1">La contraseña no cumple con los requisitos.</div>}
                                </>
                            )}
                        </div>
                    </label>
                </div>

                <div className="form-modal-footer d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <HintBox>El usuario deberá cambiar su contraseña al iniciar sesión por seguridad.</HintBox>
                    <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                        <Button variant="outline-secondary" onClick={onHide} disabled={isLoading}>
                            <i className="bi bi-x-circle me-1"></i> Cancelar
                        </Button>
                        <Button variant="warning" onClick={handleConfirmClick} disabled={isLoading || !canConfirm}>
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Restableciendo...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-shield-lock me-1"></i> Restablecer contraseña
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default ResetPasswordModal;
