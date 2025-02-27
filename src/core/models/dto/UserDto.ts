import { Status } from "./Status";

export interface UserDto {
  idUser: number;
  username: string;
  lastName: string;
  firstName: string;
  dni: number;
  phone: string;
  status: Status;
  dateRegister: string;
  password: string;
  digitalInvoiceAdhered: boolean;
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