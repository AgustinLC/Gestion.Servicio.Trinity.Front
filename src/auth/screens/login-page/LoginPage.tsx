import React, { useState } from 'react';
import { useAuth } from '../../services/AuthContext';
import { LoginRequestDto } from '../../../core/models/dto/LoginRequestDto';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

    //Estados
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    //Hooks
    const { userRole, login } = useAuth();
    const navigate = useNavigate();

    // Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const credentials: LoginRequestDto = { username, password, };
        try {
            // Pasamos el objeto credentials
            await login(credentials);
            const role = userRole;
            console.log ("rol",role);
            // Redirigir al dashboard o donde sea necesario
            if (role === 'ROLE_ADMIN') {
                navigate('/dashboard/admin');
            } else {
                navigate('/')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    // Funcion para redirigir a la pagina de olvido de contraseña
    const handleForgotPassword = () => {
        navigate('/forgot-password');
    };

    //Vista
    return (
        <>
            {/* Form login */}
            <div className="container py-5 my-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h1 className="text-center">Iniciar Sesión</h1>
                                <form onSubmit={handleSubmit}>
                                    {error && <div className="alert alert-danger">{error}</div>}
                                    <div className="mb-3">
                                        <label className="form-label">Nombre de usuario</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Contraseña</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                        {loading ? 'Cargando...' : 'Ingresar'}
                                    </button>
                                </form>
                                <div className="text-center mt-3">
                                    <button type="button" className="btn btn-link text-decoration-none" onClick={handleForgotPassword} disabled={loading}>
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
