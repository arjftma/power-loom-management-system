import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useDispatch = () => {
    return useQuery({ queryKey: ['dispatch'], queryFn: () => customApiCall('get', '/dispatch') });
};