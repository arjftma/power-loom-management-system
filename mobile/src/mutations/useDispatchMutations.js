import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useDispatchMutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data) => customApiCall('post', '/dispatch', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customApiCall('delete', `/dispatch/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return { addMutation, deleteMutation };
};