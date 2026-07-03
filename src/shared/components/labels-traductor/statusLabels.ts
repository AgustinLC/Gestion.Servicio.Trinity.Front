import { Status } from "../../../core/models/dto/Status";

const statusLabels: Record<Status, string> = {
    ACTIVE: "ACTIVO",
    INACTIVE: "INACTIVO",
    SUSPENDED: "SUSPENDIDO"
};

export default statusLabels;  