const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'screens');

// Login Screen Refactor
const loginJs = `import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAuthMutations } from '../mutations/useAuthMutations';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('password');
  
  const { loginMutation } = useAuthMutations();

  const handleLogin = () => {
    loginMutation.mutate({ email, password }, {
       onSuccess: () => navigation.replace('Dashboard'),
       onError: (e) => Alert.alert('Login Failed', e.message)
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title={loginMutation.isPending ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loginMutation.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 5 }
});`;
fs.writeFileSync(path.join(srcDir, 'LoginScreen.js'), loginJs);

// Dashboard Screen Refactor
const dashJs = `import React from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { useDashboard } from '../queries/useDashboard';
import { useAuthMutations } from '../mutations/useAuthMutations';

export default function DashboardScreen({ navigation }) {
  const { data, isLoading, error } = useDashboard();
  const { logoutMutation } = useAuthMutations();

  const handleLogout = () => {
    logoutMutation.mutate(null, {
      onSuccess: () => navigation.replace('Login')
    });
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  if (error) return <View style={styles.container}><Text>Error: {error.message}</Text><Button title="Retry Logout" onPress={handleLogout} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.statsCard}>
        <Text>Total Production: {data?.total_production || 0} m</Text>
        <Text>Total Dispatch: {data?.total_dispatch || 0} m</Text>
        <Text style={styles.boldText}>Current Stock: {data?.current_stock || 0} m</Text>
      </View>

      <View style={styles.navGrid}>
        <Button title="Manage Production" onPress={() => navigation.navigate('Production')} />
        <View style={{height:10}} />
        <Button title="Manage Dispatch" onPress={() => navigation.navigate('Dispatch')} />
        <View style={{height:10}} />
        <Button title="Employees" onPress={() => navigation.navigate('Employees')} color="#17a2b8" />
        <View style={{height:10}} />
        <Button title="Suppliers" onPress={() => navigation.navigate('Suppliers')} color="#ffc107" />
        <View style={{height:10}} />
        <Button title="Customers" onPress={() => navigation.navigate('Customers')} color="#28a745" />
        <View style={{height:10}} />
        <Button title="Payments" onPress={() => navigation.navigate('Payments')} color="#dc3545" />
      </View>
      <View style={{marginTop: 20}}>
        <Button title="Logout" onPress={handleLogout} color="gray" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'stretch' },
  statsCard: { padding: 20, backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 20 },
  boldText: { fontWeight: 'bold', fontSize: 16, marginTop: 10 },
  navGrid: { flex: 1 }
});`;
fs.writeFileSync(path.join(srcDir, 'DashboardScreen.js'), dashJs);


const buildDynamicCrudScreen = (name, formFields) => {
  const usesDate = formFields.some((f) => f.type === 'date');
  const dateImport = usesDate
    ? `import DatePickerField, { formatDateYMD } from '../components/DatePickerField';\n`
    : '';
  const initialFormState = usesDate
    ? 'useState(() => ({ date: formatDateYMD(new Date()) }))'
    : 'useState({})';
  const resetFormState = usesDate
    ? 'setForm({ date: formatDateYMD(new Date()) })'
    : 'setForm({})';
  const fieldRows = formFields
    .map((f) => {
      if (f.type === 'date') {
        return `<DatePickerField inputStyle={styles.input} containerStyle={{ marginBottom: 10 }} placeholder="${f.label}" value={form.${f.key} || ''} onChange={(v) => setForm({ ...form, ${f.key}: v })} />`;
      }
      return `<TextInput style={styles.input} placeholder="${f.label}" value={form.${f.key} || ''} onChangeText={t => setForm({...form, ${f.key}: t})} />`;
    })
    .join('\n        ');
  return `import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
${dateImport}import { use${name} } from '../queries/use${name}';
import { use${name}Mutations } from '../mutations/use${name}Mutations';

export default function ${name}Screen() {
  const { data, isLoading } = use${name}();
  const { addMutation, deleteMutation } = use${name}Mutations();
  const [form, setForm] = ${initialFormState};

  const handleAdd = () => {
    addMutation.mutate(form, {
      onSuccess: () => ${resetFormState}
    });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        ${fieldRows}
        <Button 
          title={addMutation.isPending ? "Adding..." : "Add New"} 
          onPress={handleAdd} 
          disabled={addMutation.isPending} 
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={{flex: 1}}>${formFields.map(f => `{item.${f.key}}`).join(' - ')}</Text>
            <Button title="Del" onPress={() => handleDelete(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  form: { marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5 },
  card: { padding: 10, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});`;
};

fs.writeFileSync(path.join(srcDir, 'ProductionScreen.js'), buildDynamicCrudScreen('Production', [
    { key: 'loom_number', label: 'Loom Number' },
    { key: 'fabric_type', label: 'Fabric Type' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'meters_produced', label: 'Meters Produced' }
]));

fs.writeFileSync(path.join(srcDir, 'DispatchScreen.js'), buildDynamicCrudScreen('Dispatch', [
    { key: 'customer_id', label: 'Customer ID' },
    { key: 'fabric_type', label: 'Fabric Type' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'quantity', label: 'Quantity (Meters)' }
]));

fs.writeFileSync(path.join(srcDir, 'EmployeesScreen.js'), buildDynamicCrudScreen('Employee', [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role (weaver/helper)' },
    { key: 'contact_info', label: 'Contact Info' }
]));

fs.writeFileSync(path.join(srcDir, 'SuppliersScreen.js'), buildDynamicCrudScreen('Supplier', [
    { key: 'name', label: 'Name' },
    { key: 'materials_supplied', label: 'Materials' },
    { key: 'contact_info', label: 'Contact Info' }
]));

fs.writeFileSync(path.join(srcDir, 'CustomersScreen.js'), buildDynamicCrudScreen('Customer', [
    { key: 'name', label: 'Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'address', label: 'Address' }
]));

fs.writeFileSync(path.join(srcDir, 'PaymentsScreen.js'), buildDynamicCrudScreen('Payment', [
    { key: 'type', label: 'Type (paid_to_supplier/received_from_customer)' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'supplier_id', label: 'Supplier ID (Optional)' },
    { key: 'customer_id', label: 'Customer ID (Optional)' }
]));

console.log("Screens refactored to use react-query");