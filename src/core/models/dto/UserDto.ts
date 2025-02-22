import { Status } from "./Status";

export interface UserDto {
  idUser: number;
  username: string;
  lastName: string;
  firstName: string;
  dni: number;
  phone: number;
  status: Status;
  dateRegister: string;
  password: string;
  residenceDto: ResidenceDto;
}

interface ResidenceDto {
  idLocation: number;
  idResidence: number;
  district: string;
  street: string;
  number: number;
  serialNumber: string;
  idFee: number;
}