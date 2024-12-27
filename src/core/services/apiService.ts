import axios from 'axios';
import axiosInstance from '../../config/axiosConfig';
import { WebApiResponse } from '../models/WebApiResponse';

//Función para obtener datos
export const getData = async <T>(endpoint: string): Promise<T> => {
    try {
        const response = await axiosInstance.get<WebApiResponse<any>>(endpoint);
        if (response.data.sucess) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al obtener los datos');
        } else {
            throw new Error('Error inesperado al obtener los datos');
        }
    }
}

//Función para enviar datos
export const addData = async <T>(endpoint: string, data: Omit<T, 'id'>): Promise<T> => {
    try {
        const response = await axiosInstance.post<WebApiResponse<T>>(endpoint, data);
        if (response.data.sucess) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al enviar los datos');
        } else {
            throw new Error('Error inesperado al enviar los datos');
        }
    }
}

//Funcion para actualizar datos
export const updateData = async <T>(endpoint:string , id: number, data: Partial<T>): Promise<T> => {
    try {
        const response = await axiosInstance.put<WebApiResponse<T>>(`${endpoint}/${id}`, data);
        if (response.data.sucess) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al actualizar los datos');
        } else {
            throw new Error('Error inesperado al actualizar los datos');
        }
    }
}

//Función para eliminar datos
export const deleteData = async (endpoint: string, id: number): Promise<void> => {
    try {
        const response = await axiosInstance.delete<WebApiResponse<void>>(`${endpoint}/${id}`);
        if (response.data.sucess) {
            return response.data.data;
        }
        throw new Error('Mensaje:' + response.data.message + 'Error:' + response.data.error)
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Error inesperado al eliminar los datos');
        } else {
            throw new Error('Error inesperado al eliminar los datos');
        }
    }
}
