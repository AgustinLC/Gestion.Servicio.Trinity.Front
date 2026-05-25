import { useContext } from "react";
import AppContext from "../context/AppContext";

const useAppData = () => {
    const context = useContext(AppContext);

    if (!context) {
        throw new Error("useAppData debe utilizarse dentro de AppProvider");
    }

    return context;
};

export default useAppData;
