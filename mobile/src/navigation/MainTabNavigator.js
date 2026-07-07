import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import ProductionScreen from '../screens/ProductionScreen';
import DispatchScreen from '../screens/DispatchScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';
import EmployeesScreen from '../screens/EmployeesScreen';
import SuppliersScreen from '../screens/SuppliersScreen';
import CustomersScreen from '../screens/CustomersScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StockReportScreen from '../screens/StockReportScreen';
import PayrollScreen from '../screens/PayrollScreen';
import PayrollDetailScreen from '../screens/PayrollDetailScreen';
import SalaryRecordScreen from '../screens/SalaryRecordScreen';
import EmployeeLoansScreen from '../screens/EmployeeLoansScreen';
import { normalize } from '../utils/responsive';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProduceStack = createStackNavigator();
const ShipStack = createStackNavigator();
const BusinessStack = createStackNavigator();

const headerOpts = {
  headerStyle: { backgroundColor: '#2b6cb0' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700', fontSize: normalize(17) },
  headerBackTitleVisible: false,
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={headerOpts}>
      <HomeStack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{ title: 'Overview' }}
      />
    </HomeStack.Navigator>
  );
}

function ProduceStackScreen() {
  return (
    <ProduceStack.Navigator screenOptions={headerOpts}>
      <ProduceStack.Screen
        name="ProductionMain"
        component={ProductionScreen}
        options={{ title: 'Fabric production' }}
      />
    </ProduceStack.Navigator>
  );
}

function ShipStackScreen() {
  return (
    <ShipStack.Navigator screenOptions={headerOpts}>
      <ShipStack.Screen
        name="DispatchMain"
        component={DispatchScreen}
        options={{ title: 'Fabric dispatch' }}
      />
    </ShipStack.Navigator>
  );
}

function BusinessStackScreen() {
  return (
    <BusinessStack.Navigator screenOptions={headerOpts}>
      <BusinessStack.Screen
        name="BusinessHub"
        component={MoreMenuScreen}
        options={{ title: 'Business' }}
      />
      <BusinessStack.Screen name="Employees" component={EmployeesScreen} />
      <BusinessStack.Screen name="Suppliers" component={SuppliersScreen} />
      <BusinessStack.Screen name="Customers" component={CustomersScreen} />
      <BusinessStack.Screen name="Payments" component={PaymentsScreen} />
      <BusinessStack.Screen name="StockReport" component={StockReportScreen} options={{ title: 'Stock report' }} />
      <BusinessStack.Screen name="Payroll" component={PayrollScreen} />
      <BusinessStack.Screen name="PayrollDetail" component={PayrollDetailScreen} options={{ title: 'Payroll' }} />
      <BusinessStack.Screen name="SalaryRecord" component={SalaryRecordScreen} />
      <BusinessStack.Screen name="EmployeeLoans" component={EmployeeLoansScreen} />
      <BusinessStack.Screen name="Profile" component={ProfileScreen} />
      <BusinessStack.Screen name="Settings" component={SettingsScreen} />
    </BusinessStack.Navigator>
  );
}

const tabIcon = (routeName, color, size) => {
  const map = {
    Home: 'home-outline',
    Produce: 'layers-outline',
    Ship: 'paper-plane-outline',
    Business: 'briefcase-outline',
  };
  return <Ionicons name={map[routeName] || 'ellipse-outline'} size={size} color={color} />;
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2b6cb0',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          height: normalize(58),
          paddingBottom: normalize(6),
          paddingTop: normalize(4),
        },
        tabBarLabelStyle: { fontSize: normalize(11), fontWeight: '600' },
        tabBarIcon: ({ color, size }) => tabIcon(route.name, color, normalize(22)),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Produce"
        component={ProduceStackScreen}
        options={{ tabBarLabel: 'Produce' }}
      />
      <Tab.Screen
        name="Ship"
        component={ShipStackScreen}
        options={{ tabBarLabel: 'Dispatch' }}
      />
      <Tab.Screen
        name="Business"
        component={BusinessStackScreen}
        options={{ tabBarLabel: 'Business' }}
      />
    </Tab.Navigator>
  );
}
