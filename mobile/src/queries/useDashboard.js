import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => customApiCall('get', '/dashboard'),
    retry: 4,
    retryDelay: (attempt) => Math.min(800 * 2 ** attempt, 8000),
  });
};