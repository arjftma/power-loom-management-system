import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useStockReport = () =>
  useQuery({
    queryKey: ['reports', 'fabric-stock-by-date'],
    queryFn: () => customApiCall('get', '/reports/fabric-stock-by-date'),
    retry: 2,
  });
