import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useProduction = () => {
    return useQuery({ queryKey: ['production'], queryFn: () => customApiCall('get', '/production') });
};