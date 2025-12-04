import React, { useState, useEffect } from 'react';
import useAuth  from '../../../hooks/useAuth';
import { LoginRequestDto } from '../../../core/models/dto/LoginRequestDto';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../auth/services/AuthService';

// Helper para decodificar el token JWT
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error al decodificar el token JWT:', error);
    return null;
  }
};

// Función para obtener la ruta según el rol
const getRouteByRole = (role: string | null): string => {
  switch (role) {
    case 'ROLE_ADMIN':
      return '/dashboard/admin/workers';
    case 'ROLE_OPERATOR':
      return '/dashboard/operator/resume';
    case 'ROLE_USER':
      return '/dashboard/user/resume';
    default:
      return '/';
  }
};

const LoginPage = () => {

    //Estados
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    //Hooks
    const { login, userRole, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Efecto para redirigir si el usuario ya está autenticado al cargar la página
    useEffect(() => {
        if (isAuthenticated && userRole) {
            const route = getRouteByRole(userRole);
            navigate(route);
        }
    }, [isAuthenticated, userRole, navigate]);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const credentials: LoginRequestDto = { username, password, };
        try {
            // Pasamos el objeto credentials
            await login(credentials);
            
            // Obtener el token recién guardado y decodificarlo para obtener el rol
            const token = AuthService.getToken();
            if (token) {
                const decodedToken = parseJwt(token);
                const role = decodedToken?.role || null;
                const route = getRouteByRole(role);
                navigate(route);
            } else {
                // Si no hay token, redirigir a la página principal
                navigate('/');
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
