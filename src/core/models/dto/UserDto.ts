export interface UserDto {
  idUser: number;
  username: string;
  lastName: string;
  firstName: string;
  dni: number;
  phone: number;
  status: string;
}

export interface RegisterRequestDto {
  username: string;
  lastname: string;
  firstname: string;
  password: string;
  dni: number;
  phone: number;
}
