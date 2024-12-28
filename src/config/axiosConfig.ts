import axios, { AxiosInstance } from "axios";

//Instancia de axios con cofiguración inicial 
const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json", },
    timeout: 5000,
    timeoutErrorMessage: "Tiempo de espera agotado",
});

//Interceptor para agregar token de autenticación a las peticiones
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
},
    (error) => Promise.reject(error)
);

//Interceptor para manejar errores de peticiones
axiosInstance.interceptors.response.use((response) => response,
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 