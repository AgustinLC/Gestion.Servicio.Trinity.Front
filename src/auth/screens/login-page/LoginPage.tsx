import { useState } from "react";
import './LoginPage.css';

const LoginPage: React.FC = () => {

    //Estados
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    //
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email, 'Password:', password);
    };

    return (
        <div className="login-container">
            <div className="login-form animate__animated animate__fadeInDown">
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="usuario@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Ingresar
                    </button>
                </form>
                <div className="text-center mt-3">
                    <a href="#" className="text-muted">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;