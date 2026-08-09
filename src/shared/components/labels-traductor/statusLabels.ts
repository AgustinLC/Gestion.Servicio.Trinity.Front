import { Status } from "../../../core/models/dto/Status";

const statusLabels: Record<Status, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
    SUSPENDED: "Suspendido"
};

export default statusLabels;  