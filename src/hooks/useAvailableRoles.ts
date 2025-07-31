import { useQuery } from '@tanstack/react-query';
import { useApi } from './useApi';

export interface AvailableRole {
    project: {
        id: string;
        name: string;
    };
    role: {
        id: string;
        name: string;
        description: string | null;
    };
}

interface AvailableRolesResponse {
    data: AvailableRole[];
}

export const useAvailableRoles = (userId: string) => {
    const { get } = useApi();

    return useQuery<AvailableRole[], Error>({
        queryKey: ['availableRoles', userId],
        queryFn: async () => {
            const res = await get<AvailableRolesResponse>(`/users/${userId}/role-available`);
            return res.data;
        },
        enabled: !!userId,
    });
};