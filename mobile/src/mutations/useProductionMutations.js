import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useProductionMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data) => customApiCall('post', '/production', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'fabric-stock-by-date'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customApiCall('delete', `/production/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports', 'fabric-stock-by-date'] });
    },
  });

  return { addMutation, deleteMutation };
};