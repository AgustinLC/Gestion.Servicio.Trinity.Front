import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthService from "../../services/AuthService";
import { RecoverPassDto } from "../../../core/models/dto/RecoverPassDto";

const ResetPasswordPage = () => {
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setError("Token inválido o faltante.");
            return;
        }
        setLoading(true);
        setError("");
        const credentials: RecoverPassDto = { token, newPassword };
        try {
            await AuthService.changePassword(credentials);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (error) {
            setError("Error al restablecer la contraseña. Intenta nuevamente.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h1 className="text-center">Restablecer Contraseña</h1>
                            {success ? (
                                <div className="alert alert-success">
                                    Contraseña restablecida exitosamente. Redirigiendo al inicio de
                                    sesión...
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? "Procesando..." : "Restablecer Contraseña"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
