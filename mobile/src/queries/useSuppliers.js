import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useSuppliers = () => {
    return useQuery({ queryKey: ['suppliers'], queryFn: () => customApiCall('get', '/suppliers') });
};