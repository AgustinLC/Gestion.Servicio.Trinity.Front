import React, { useState } from "react";
import AuthService from "../../services/AuthService";
import { ForgotPassDto } from "../../../core/models/dto/ForgotPassDto";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  //Funcion para manejar el envio del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const credentials: ForgotPassDto = { email };
    try {
      await AuthService.recoverPassword(credentials);
      setSuccess(true);
    } catch (error) {
      setError("Error al enviar el correo. Intenta nuevamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 h-100">
      <div className="row justify-content-center h-100">
        <div className="col-md-6 my-auto">
          <div className="card">
            <div className="card-body">
              <h1 className="text-center">Recuperar Contraseña</h1>
              <form onSubmit={handleSubmit}>
                {success ? (
                  <div className="alert alert-success">
                    Correo enviado con instrucciones para restablecer tu contraseña. Por favor revisa tu bandeja de entrada.
                  </div>
                ) : (
                  <>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <div className="mb-3">
                      <label className="form-label">Correo Electrónico</label>
                      <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                      {loading ? "Enviando..." : "Enviar"}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
