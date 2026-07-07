const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const apiDir = path.join(srcDir, 'api');
const queriesDir = path.join(srcDir, 'queries');
const mutationsDir = path.join(srcDir, 'mutations');
const screensDir = path.join(srcDir, 'screens');

// Create directories based on new instructions
[apiDir, queriesDir, mutationsDir].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
});

// src/api/config.js
const apiConfigJs = `// Global configuration variables 
export const API_BASE_URL = 'http://10.0.2.2:8000/api'; 
`;
fs.writeFileSync(path.join(apiDir, 'config.js'), apiConfigJs);

// src/api/customApiCall.js
const customApiCallJs = `import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './config';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// A wrapper to handle errors consistently
export const customApiCall = async (method, url, data = null, params = null) => {
  try {
    const response = await client({ method, url, data, params });
    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || error.message);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server');
    } else {
      // Something happened in setting up the request
      throw new Error(error.message);
    }
  }
};

export default client;
`;
fs.writeFileSync(path.join(apiDir, 'customApiCall.js'), customApiCallJs);

// Queries & Mutations hooks
const queries = {
  'useDashboard': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useDashboard = () => {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => customApiCall('get', '/dashboard'),
    });
};`,
  'useProduction': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useProduction = () => {
    return useQuery({ queryKey: ['production'], queryFn: () => customApiCall('get', '/production') });
};`,
  'useDispatch': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useDispatch = () => {
    return useQuery({ queryKey: ['dispatch'], queryFn: () => customApiCall('get', '/dispatch') });
};`,
  'useEmployees': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useEmployees = () => {
    return useQuery({ queryKey: ['employees'], queryFn: () => customApiCall('get', '/employees') });
};`,
  'useSuppliers': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useSuppliers = () => {
    return useQuery({ queryKey: ['suppliers'], queryFn: () => customApiCall('get', '/suppliers') });
};`,
  'useCustomers': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const useCustomers = () => {
    return useQuery({ queryKey: ['customers'], queryFn: () => customApiCall('get', '/customers') });
};`,
  'usePayments': `import { useQuery } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const usePayments = () => {
    return useQuery({ queryKey: ['payments'], queryFn: () => customApiCall('get', '/payments') });
};`
};

for (const [name, content] of Object.entries(queries)) {
  fs.writeFileSync(path.join(queriesDir, name + '.js'), content);
}


// Mutations
const genericCrudMutation = (name, endpoint) => `import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';

export const use${name}Mutations = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (data) => customApiCall('post', '/${endpoint}', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${endpoint}'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => customApiCall('delete', \`/${endpoint}/\${id}\`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['${endpoint}'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  return { addMutation, deleteMutation };
};`;

fs.writeFileSync(path.join(mutationsDir, 'useProductionMutations.js'), genericCrudMutation('Production', 'production'));
fs.writeFileSync(path.join(mutationsDir, 'useDispatchMutations.js'), genericCrudMutation('Dispatch', 'dispatch'));
fs.writeFileSync(path.join(mutationsDir, 'useEmployeeMutations.js'), genericCrudMutation('Employee', 'employees'));
fs.writeFileSync(path.join(mutationsDir, 'useSupplierMutations.js'), genericCrudMutation('Supplier', 'suppliers'));
fs.writeFileSync(path.join(mutationsDir, 'useCustomerMutations.js'), genericCrudMutation('Customer', 'customers'));
fs.writeFileSync(path.join(mutationsDir, 'usePaymentMutations.js'), genericCrudMutation('Payment', 'payments'));


const authMutationsJs = `import { useMutation } from '@tanstack/react-query';
import { customApiCall } from '../api/customApiCall';
import * as SecureStore from 'expo-secure-store';

export const useAuthMutations = () => {
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
       const data = await customApiCall('post', '/login', { email, password });
       await SecureStore.setItemAsync('token', data.token);
       return data;
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
       await customApiCall('post', '/logout');
       await SecureStore.deleteItemAsync('token');
    }
  });

  return { loginMutation, logoutMutation };
};`;
fs.writeFileSync(path.join(mutationsDir, 'useAuthMutations.js'), authMutationsJs);


// App.js Wrap with React Query
const appJs = `import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}`;
fs.writeFileSync(path.join(__dirname, 'App.js'), appJs);

console.log("React Query infrastructure files created");