import axiosInstance from '../../config/axiosConfig';
import { LoginRequestDto } from '../../core/models/dto/LoginRequestDto';
import { AuthResponseDto } from '../../core/models/dto/AuthResponseDto';
import { ForgotPassDto } from '../../core/models/dto/ForgotPassDto';
import { WebApiResponse } from '../../core/models/entity/WebApiResponse';
import { RecoverPassDto } from '../../core/models/dto/RecoverPassDto';

// Servicio de autenticación
const AuthService = {

    // Función para hacer login
    async login(credentials: LoginRequestDto): Promise<AuthResponseDto> {
        try {
            const response = await axiosInstance.post<WebApiResponse<AuthResponseDto>>('/auth/login', credentials);
            // Si la respuesta es exitosa, guarda el token en el local storage
            if (response.data.success) {
                const token = response.data.data.token;
                AuthService.saveToken(token);
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Error en el inicio de sesión');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error inesperado al hacer login');
        }
    },

    // Funcion para recuperar contraseña
    async recoverPassword(credentials: ForgotPassDto): Promise<void> {
        try {
            const response = await axiosInstance.post<WebApiResponse<void>>('/auth/forgot', credentials);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al enviar el correo de recuperación');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error inesperado al enviar el correo de recuperación');
        }
    },

    // Funcion para cambiar contraseña
    async changePassword(credentials: RecoverPassDto): Promise<void> {
        try {
            const response = await axiosInstance.post<WebApiResponse<void>>('/auth/reset', credentials);
            if (!response.data.success) {
                throw new Error(response.data.message || 'Error al cambiar la contraseña');
            }
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Error inesperado al cambiar la contraseña');
        }
    },

    // Función para hacer logout (borra el token del local storage)
    logout(): void {
        localStorage.removeItem('token');
    },

    // Función para guardar el token en el local storage
    saveToken(token: string): void {
        localStorage.setItem('token', token);
    },

    // Función para obtener el token del local storage
    getToken(): string | null {
        return localStorage.getItem('token');
    },
};

export default AuthService;
