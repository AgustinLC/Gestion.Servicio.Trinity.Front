import React, { createContext, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getData } from "../core/services/apiService";
import { UserDto } from "../core/models/dto/UserDto";
import { LocationDto } from "../core/models/dto/LocationDto";
import { FeeDto } from "../core/models/dto/FeeDto";
import { DiscountDto } from "../core/models/dto/Discount";
import { BillingParameter } from "../core/models/dto/BillingParameter";
import { Service } from "../core/models/dto/Service";
import { Unit } from "../core/models/dto/Unit";
import { ReadReadingDto } from "../core/models/dto/ReadReadingDto";

interface AppContextProps {
    operatorUsers: UserDto[];
    operatorActiveUsers: UserDto[];
    operatorReadingUsers: UserDto[];
    locations: LocationDto[];
    fees: FeeDto[];
    discounts: DiscountDto[];
    activeBillingParameters: BillingParameter[];
    adminServices: Service[];
    adminUnits: Unit[];
    currentUser: UserDto | null;
    currentUserReadings: ReadReadingDto[];
    loading: boolean;
    error: string | null;
    refreshAppData: () => Promise<void>;
    refreshOperatorUserLists: () => Promise<void>;
    refreshOperatorUsers: () => Promise<void>;
    refreshOperatorActiveUsers: () => Promise<void>;
    refreshOperatorReadingUsers: () => Promise<void>;
    refreshDiscounts: () => Promise<void>;
    refreshActiveBillingParameters: () => Promise<void>;
    refreshFees: () => Promise<void>;
    refreshAdminServices: () => Promise<void>;
    refreshAdminUnits: () => Promise<void>;
    refreshCurrentUser: () => Promise<void>;
    refreshCurrentUserReadings: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const emptyData = {
    operatorUsers: [],
    operatorActiveUsers: [],
    operatorReadingUsers: [],
    locations: [],
    fees: [],
    discounts: [],
    activeBillingParameters: [],
    adminServices: [],
    adminUnits: [],
    currentUser: null,
    currentUserReadings: [],
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, userRole, userId } = useAuth();
    const [operatorUsers, setOperatorUsers] = useState<UserDto[]>([]);
    const [operatorActiveUsers, setOperatorActiveUsers] = useState<UserDto[]>([]);
    const [operatorReadingUsers, setOperatorReadingUsers] = useState<UserDto[]>([]);
    const [locations, setLocations] = useState<LocationDto[]>([]);
    const [fees, setFees] = useState<FeeDto[]>([]);
    const [discounts, setDiscounts] = useState<DiscountDto[]>([]);
    const [activeBillingParameters, setActiveBillingParameters] = useState<BillingParameter[]>([]);
    const [adminServices, setAdminServices] = useState<Service[]>([]);
    const [adminUnits, setAdminUnits] = useState<Unit[]>([]);
    const [currentUser, setCurrentUser] = useState<UserDto | null>(null);
    const [currentUserReadings, setCurrentUserReadings] = useState<ReadReadingDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadedSessionKeyRef = useRef<string | null>(null);

    const resetData = useCallback(() => {
        setOperatorUsers(emptyData.operatorUsers);
        setOperatorActiveUsers(emptyData.operatorActiveUsers);
        setOperatorReadingUsers(emptyData.operatorReadingUsers);
        setLocations(emptyData.locations);
        setFees(emptyData.fees);
        setDiscounts(emptyData.discounts);
        setActiveBillingParameters(emptyData.activeBillingParameters);
        setAdminServices(emptyData.adminServices);
        setAdminUnits(emptyData.adminUnits);
        setCurrentUser(emptyData.currentUser);
        setCurrentUserReadings(emptyData.currentUserReadings);
        setError(null);
    }, []);

    const refreshOperatorUsers = useCallback(async () => {
        const users = await getData<UserDto[]>("/operator/users");
        setOperatorUsers(users);
    }, []);

    const refreshOperatorActiveUsers = useCallback(async () => {
        const users = await getData<UserDto[]>("/operator/users-actives");
        setOperatorActiveUsers(users);
    }, []);

    const refreshOperatorReadingUsers = useCallback(async () => {
        const users = await getData<UserDto[]>("/operator/users-reading");
        setOperatorReadingUsers(users);
    }, []);

    const refreshFees = useCallback(async () => {
        const feeData = await getData<FeeDto[]>("/operator/fee");
        setFees(feeData);
    }, []);

    const refreshDiscounts = useCallback(async () => {
        const discountData = await getData<DiscountDto[]>("/operator/discounts");
        setDiscounts(discountData);
    }, []);

    const refreshActiveBillingParameters = useCallback(async () => {
        const parameterData = await getData<BillingParameter[]>("/operator/billing-parameter/active");
        setActiveBillingParameters(parameterData);
    }, []);

    const refreshAdminServices = useCallback(async () => {
        const services = await getData<Service[]>("/admin/services");
        setAdminServices(services);
    }, []);

    const refreshAdminUnits = useCallback(async () => {
        const units = await getData<Unit[]>("/admin/unities");
        setAdminUnits(units);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        if (!userId) return;

        const user = await getData<UserDto>(`/user/${userId}`);
        setCurrentUser(user);
    }, [userId]);

    const refreshCurrentUserReadings = useCallback(async () => {
        if (!userId) return;

        const readings = await getData<ReadReadingDto[]>(`/user/readings/${userId}`);
        setCurrentUserReadings(readings);
    }, [userId]);

    const refreshOperatorUserLists = useCallback(async () => {
        await Promise.all([
            refreshOperatorUsers(),
            refreshOperatorActiveUsers(),
            refreshOperatorReadingUsers(),
        ]);
    }, [refreshOperatorActiveUsers, refreshOperatorReadingUsers, refreshOperatorUsers]);

    const loadOperatorData = useCallback(async () => {
        const [
            users,
            activeUsers,
            readingUsers,
            locationsData,
            feeData,
            discountData,
            parameterData,
        ] = await Promise.all([
            getData<UserDto[]>("/operator/users"),
            getData<UserDto[]>("/operator/users-actives"),
            getData<UserDto[]>("/operator/users-reading"),
            getData<LocationDto[]>(`/operator/locations/${import.meta.env.VITE_ID_PROVINCE}`),
            getData<FeeDto[]>("/operator/fee"),
            getData<DiscountDto[]>("/operator/discounts"),
            getData<BillingParameter[]>("/operator/billing-parameter/active"),
        ]);

        setOperatorUsers(users);
        setOperatorActiveUsers(activeUsers);
        setOperatorReadingUsers(readingUsers);
        setLocations(locationsData);
        setFees(feeData);
        setDiscounts(discountData);
        setActiveBillingParameters(parameterData);
    }, []);

    const loadAdminData = useCallback(async () => {
        const [services, units] = await Promise.all([
            getData<Service[]>("/admin/services"),
            getData<Unit[]>("/admin/unities"),
        ]);

        setAdminServices(services);
        setAdminUnits(units);
    }, []);

    const loadUserData = useCallback(async () => {
        if (!userId) return;

        const [user, readings] = await Promise.all([
            getData<UserDto>(`/user/${userId}`),
            getData<ReadReadingDto[]>(`/user/readings/${userId}`),
        ]);

        setCurrentUser(user);
        setCurrentUserReadings(readings);
    }, [userId]);

    const refreshAppData = useCallback(async () => {
        if (!isAuthenticated || !userRole) {
            resetData();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (userRole === "ROLE_OPERATOR" || userRole === "ROLE_ADMIN") {
                await loadOperatorData();
            }

            if (userRole === "ROLE_ADMIN") {
                await loadAdminData();
            }

            if (userRole === "ROLE_USER") {
                await loadUserData();
            }
        } catch (error) {
            console.error("Error loading app data:", error);
            setError(error instanceof Error ? error.message : "Error al cargar datos de la aplicacion");
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, loadAdminData, loadOperatorData, loadUserData, resetData, userRole]);

    const sessionKey = isAuthenticated && userRole ? `${userRole}:${userId ?? ""}` : null;

    useEffect(() => {
        if (!sessionKey) {
            loadedSessionKeyRef.current = null;
            resetData();
            return;
        }

        if (loadedSessionKeyRef.current === sessionKey) {
            return;
        }

        loadedSessionKeyRef.current = sessionKey;
        refreshAppData();
    }, [refreshAppData, resetData, sessionKey]);

    return (
        <AppContext.Provider
            value={{
                operatorUsers,
                operatorActiveUsers,
                operatorReadingUsers,
                locations,
                fees,
                discounts,
                activeBillingParameters,
                adminServices,
                adminUnits,
                currentUser,
                currentUserReadings,
                loading,
                error,
                refreshAppData,
                refreshOperatorUserLists,
                refreshOperatorUsers,
                refreshOperatorActiveUsers,
                refreshOperatorReadingUsers,
                refreshDiscounts,
                refreshActiveBillingParameters,
                refreshFees,
                refreshAdminServices,
                refreshAdminUnits,
                refreshCurrentUser,
                refreshCurrentUserReadings,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
