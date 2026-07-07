import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useEmployees = () => {
    return useQuery({ queryKey: ['employees'], queryFn: () => customApiCall('get', '/employees') });
};