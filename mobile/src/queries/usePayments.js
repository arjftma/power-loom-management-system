import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const usePayments = () => {
    return useQuery({ queryKey: ['payments'], queryFn: () => customApiCall('get', '/payments') });
};