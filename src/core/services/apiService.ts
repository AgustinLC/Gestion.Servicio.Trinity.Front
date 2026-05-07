import axios from 'axios';
import axiosInstance from '../../config/axiosConfig';
import { WebApiResponse } from '../models/types/WebApiResponse';

const pendingGetRequests = new Map<string, Promise<unknown>>();

//Función para obtener datos
export const getData = async <T>(endpoint: string): Promise<T> => {
    const pendingRequest = pendingGetRequests.get(endpoint);

    if (pendingRequest) {
        return pendingRequest as Promise<T>;
    }

    const request = axiosInstance
        .get<WebApiResponse<T>>(endpoint)
        .then((response) => {
            if (response.data.success) {
                return response.data.data;
            }

            throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error);
        })
        .finally(() => {
            pendingGetRequests.delete(endpoint);
        });

    pendingGetRequests.set(endpoint, request);

    try {
        return await request;
    } catch (error) {
        console.error('Error completo:', error);
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al obtener los datos');
        }

        throw error instanceof Error ? error : new Error('Error de conexion');
    }

}

//Función para añadir datos
export const addData = async <T>(endpoint: string, data: T): Promise<T> => {
    const response = await axiosInstance.post<WebApiResponse<T>>(endpoint, data);
    try {
        // Verifica si la propiedad success es false, incluso si el código HTTP es 200
        if (response.data.success) {
            return response.data.data;
        } else {
            // Si la propiedad success es false, lanzamos el mensaje de error
            throw new Error(response.data.message || response.data.error || 'Error inesperado');
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            // Si es un error de Axios, obtenemos el mensaje de error
            throw new Error(error.response?.data?.message || 'Error de conexión');
        } else {
            // Si el error no es de Axios, lanzamos el error del servidor
            throw new Error(response.data.message || 'Error de conexión');
        }
    }
};

//Funcion para actualizar datos
export const updateData = async <T>(endpoint:string , id: number, data: Partial<T>): Promise<T> => {
    const response = await axiosInstance.put<WebApiResponse<T>>(`${endpoint}=${id}`, data);
    try {
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al actualizar los datos');
        } else {
            throw new Error(response.data.message || 'Error inesperado al actualizar los datos');
        }
    }
}

//Función para eliminar datos
export const deleteData = async (endpoint: string, id: number): Promise<void> => {
    const response = await axiosInstance.delete<WebApiResponse<void>>(`${endpoint}=${id}`);
    try {
        if (response.data.success) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al eliminar los datos');
        } else {
            throw new Error(response.data.message ||'Error inesperado al eliminar los datos');
        }
    }
}
