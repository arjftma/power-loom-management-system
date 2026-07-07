import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useCustomerMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data) => customApiCall('post', '/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customApiCall('delete', `/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return { addMutation, deleteMutation };
};