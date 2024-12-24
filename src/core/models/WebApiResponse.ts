export interface WebApiResponse<T> {
    data: T;
    message:string;
    sucess:boolean;
    statusCode:number;
    error:string;
    timestamp:string;
}