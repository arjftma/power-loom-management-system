import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const usePayrolls = () =>
  useQuery({
    queryKey: ['payrolls'],
    queryFn: () => customApiCall('get', '/payrolls'),
  });

export const usePayroll = (id) =>
  useQuery({
    queryKey: ['payrolls', id],
    queryFn: () => customApiCall('get', `/payrolls/${id}`),
    enabled: !!id,
  });

export const useEmployeeLoans = (employeeId) =>
  useQuery({
    queryKey: ['employee-loans', employeeId ?? 'all'],
    queryFn: () =>
      customApiCall('get', '/employee-loans', null, employeeId ? { employee_id: employeeId } : null),
  });
