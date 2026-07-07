import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const usePayrollMutations = () => {
  const queryClient = useQueryClient();

  const invalidatePayroll = (id) => {
    queryClient.invalidateQueries({ queryKey: ['payrolls'] });
    if (id) queryClient.invalidateQueries({ queryKey: ['payrolls', id] });
  };

  const createPayroll = useMutation({
    mutationFn: (body) => customApiCall('post', '/payrolls', body),
    onSuccess: () => invalidatePayroll(),
  });

  const deletePayroll = useMutation({
    mutationFn: (id) => customApiCall('delete', `/payrolls/${id}`),
    onSuccess: () => invalidatePayroll(),
  });

  const generatePayroll = useMutation({
    mutationFn: (id) => customApiCall('post', `/payrolls/${id}/generate`),
    onSuccess: (_, id) => invalidatePayroll(id),
  });

  const recalculatePayroll = useMutation({
    mutationFn: (id) => customApiCall('post', `/payrolls/${id}/recalculate`),
    onSuccess: (_, id) => invalidatePayroll(id),
  });

  const addAllowance = useMutation({
    mutationFn: ({ recordId, ...body }) => customApiCall('post', `/salary-records/${recordId}/allowances`, body),
    onSuccess: (_, { payrollId }) => invalidatePayroll(payrollId),
  });

  const addBonus = useMutation({
    mutationFn: ({ recordId, ...body }) => customApiCall('post', `/salary-records/${recordId}/bonuses`, body),
    onSuccess: (_, { payrollId }) => invalidatePayroll(payrollId),
  });

  const addDeduction = useMutation({
    mutationFn: ({ recordId, ...body }) => customApiCall('post', `/salary-records/${recordId}/deductions`, body),
    onSuccess: (_, { payrollId }) => invalidatePayroll(payrollId),
  });

  const createLoan = useMutation({
    mutationFn: (body) => customApiCall('post', '/employee-loans', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-loans'] });
    },
  });

  return {
    createPayroll,
    deletePayroll,
    generatePayroll,
    recalculatePayroll,
    addAllowance,
    addBonus,
    addDeduction,
    createLoan,
  };
};
