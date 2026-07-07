import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useCustomers = () => {
    return useQuery({ queryKey: ['customers'], queryFn: () => customApiCall('get', '/customers') });
};