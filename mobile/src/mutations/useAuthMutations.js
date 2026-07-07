import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { customApiCall } from '../api/customApiCall';
import { setAuthToken, clearAuthToken } from '../api/authToken';

export const useAuthMutations = () => {
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const data = await customApiCall('post', '/login', { email, password });
      // Set memory token immediately so the next authenticated request (e.g. dashboard) always has Bearer on iOS.
      setAuthToken(data.token);
      await SecureStore.setItemAsync('token', data.token);
      return data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await customApiCall('post', '/logout');
      await SecureStore.deleteItemAsync('token');
      clearAuthToken();
    },
  });

  return { loginMutation, logoutMutation };
};