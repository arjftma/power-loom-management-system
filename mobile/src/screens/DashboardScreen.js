import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { pullRefreshControl } from '../utils/pullToRefresh';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDashboard } from '../queries/useDashboard';
import { normalize } from '../utils/responsive';

function fmtMeters(n) {
  const v = Number(n ?? 0);
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
}

function fmtMoney(n) {
  const v = Number(n ?? 0);
  return `Rs ${v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(d) {
  if (!d) return '—';
  const s = typeof d === 'string' ? d.slice(0, 10) : '';
  return s || String(d);
}

const COUNT_CHIPS = [
  { key: 'employees', label: 'Staff', screen: 'Employees', icon: 'people-outline' },
  { key: 'suppliers', label: 'Suppliers', screen: 'Suppliers', icon: 'cube-outline' },
  { key: 'customers', label: 'Customers', screen: 'Customers', icon: 'business-outline' },
  { key: 'payments', label: 'Payments', screen: 'Payments', icon: 'wallet-outline' },
  { key: 'production_batches', label: 'Batches', tab: 'Produce', icon: 'layers-outline' },
  { key: 'dispatches', label: 'Shipments', tab: 'Ship', icon: 'paper-plane-outline' },
];

function StatBlock({ label, value, sub, tone }) {
  return (
    <View style={[styles.statBlock, tone && { borderLeftColor: tone, borderLeftWidth: 3 }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={2}>
        {value}
      </Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function NavCard({ title, subtitle, iconName, color, onPress }) {
  return (
    <TouchableOpacity style={styles.navCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.navIconWrap, { backgroundColor: `${color}18` }]}>
        <Ionicons name={iconName} size={normalize(26)} color={color} />
      </View>
      <View style={styles.navCardText}>
        <Text style={styles.navTitle}>{title}</Text>
        <Text style={styles.navSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={normalize(20)} color="#94a3b8" />
    </TouchableOpacity>
  );
}

export default function DashboardScreen({ navigation }) {
  const { data, isLoading, isFetching, isError, error, refetch } = useDashboard();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Overview',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: '700' },
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Business', { screen: 'Settings' })}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={normalize(24)} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const goBusiness = (screen) => {
    if (screen === 'BusinessHub') {
      navigation.navigate('Business', { screen: 'BusinessHub' });
    } else {
      navigation.navigate('Business', { screen });
    }
  };

  const onChipPress = (chip) => {
    if (chip.tab) navigation.navigate(chip.tab);
    else if (chip.screen) goBusiness(chip.screen);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2b6cb0" />
        <Text style={styles.loadingHint}>Loading dashboard…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f7fafc' }} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.centeredScroll}
          refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
          keyboardShouldPersistTaps="handled"
        >
          <Ionicons name="cloud-offline-outline" size={normalize(48)} color="#e53e3e" />
          <Text style={styles.errTitle}>Could not load dashboard</Text>
          <Text style={styles.errMsg}>{error?.message || 'Check your connection and try again.'}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const d = data || {};
  const counts = d.counts && typeof d.counts === 'object' ? d.counts : {};
  const recentProd = Array.isArray(d.recent_production) ? d.recent_production : [];
  const recentDisp = Array.isArray(d.recent_dispatches) ? d.recent_dispatches : [];

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
      >
        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>Fabric in hand</Text>
          <Text style={styles.heroValue}>{fmtMeters(d.current_stock)}</Text>
          <Text style={styles.heroCaption}>Total produced minus total dispatched</Text>
        </View>

        <Text style={styles.sectionTitle}>Fabric</Text>
        <View style={styles.row3}>
          <StatBlock label="Produced" value={fmtMeters(d.total_production)} />
          <StatBlock label="Dispatched" value={fmtMeters(d.total_dispatch)} />
          <StatBlock label="Stock" value={fmtMeters(d.current_stock)} tone="#2b6cb0" />
        </View>

        <Text style={styles.sectionTitle}>Cash & payments</Text>
        <View style={styles.row3}>
          <StatBlock
            label="Received"
            value={fmtMoney(d.total_received_from_customers)}
            sub="from customers"
            tone="#38a169"
          />
          <StatBlock
            label="Paid out"
            value={fmtMoney(d.total_paid_to_suppliers)}
            sub="to suppliers"
            tone="#dd6b20"
          />
          <StatBlock
            label="Net"
            value={fmtMoney(d.payment_cash_net)}
            sub="received − paid"
            tone="#2b6cb0"
          />
        </View>

        <Text style={styles.sectionTitle}>Records</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {COUNT_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={styles.chip}
              onPress={() => onChipPress(chip)}
              activeOpacity={0.8}
            >
              <Ionicons name={chip.icon} size={normalize(18)} color="#2b6cb0" />
              <Text style={styles.chipCount}>{counts[chip.key] ?? 0}</Text>
              <Text style={styles.chipLabel}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Go to</Text>
        <NavCard
          title="Production"
          subtitle="Log batches from the loom"
          iconName="layers-outline"
          color="#3182ce"
          onPress={() => navigation.navigate('Produce')}
        />
        <NavCard
          title="Dispatch"
          subtitle="Ship fabric to customers"
          iconName="paper-plane-outline"
          color="#dd6b20"
          onPress={() => navigation.navigate('Ship')}
        />
        <NavCard
          title="Business hub"
          subtitle="Staff, suppliers, buyers, money"
          iconName="briefcase-outline"
          color="#4a5568"
          onPress={() => navigation.navigate('Business', { screen: 'BusinessHub' })}
        />
        <NavCard
          title="Stock report"
          subtitle="All fabric added, grouped by date"
          iconName="bar-chart-outline"
          color="#2b6cb0"
          onPress={() => navigation.navigate('Business', { screen: 'StockReport' })}
        />

        <Text style={styles.sectionTitle}>Recent production</Text>
        {recentProd.length === 0 ? (
          <Text style={styles.empty}>No batches yet.</Text>
        ) : (
          recentProd.map((row) => (
            <View key={String(row.id)} style={styles.listRow}>
              <View style={styles.listMain}>
                <Text style={styles.listTitle}>
                  Loom {row.loom_number} · {row.fabric_type || '—'}
                </Text>
                <Text style={styles.listMeta}>{fmtDate(row.date)}</Text>
              </View>
              <Text style={styles.listValue}>{fmtMeters(row.meters_produced)}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Recent dispatch</Text>
        {recentDisp.length === 0 ? (
          <Text style={styles.empty}>No dispatches yet.</Text>
        ) : (
          recentDisp.map((row) => (
            <View key={String(row.id)} style={styles.listRow}>
              <View style={styles.listMain}>
                <Text style={styles.listTitle}>
                  {row.customer?.name || 'Customer'} · {row.fabric_type || '—'}
                </Text>
                <Text style={styles.listMeta}>{fmtDate(row.date)}</Text>
              </View>
              <Text style={styles.listValue}>{fmtMeters(row.quantity)}</Text>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.inlineLink} onPress={() => refetch()}>
          <Ionicons name="refresh-outline" size={normalize(18)} color="#2b6cb0" />
          <Text style={styles.inlineLinkText}>Refresh numbers</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fafc' },
  scroll: { padding: normalize(16), paddingBottom: normalize(28) },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(24),
    backgroundColor: '#f7fafc',
  },
  centeredScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(24),
  },
  loadingHint: { marginTop: normalize(12), color: '#64748b', fontSize: normalize(14) },
  errTitle: {
    marginTop: normalize(12),
    fontSize: normalize(17),
    fontWeight: '700',
    color: '#1e293b',
  },
  errMsg: { marginTop: normalize(8), color: '#64748b', textAlign: 'center', fontSize: normalize(14) },
  retryBtn: {
    marginTop: normalize(20),
    backgroundColor: '#2b6cb0',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(12),
    borderRadius: normalize(10),
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: normalize(15) },
  headerBtn: { paddingHorizontal: normalize(12), paddingVertical: normalize(6) },
  hero: {
    backgroundColor: '#fff',
    borderRadius: normalize(14),
    padding: normalize(18),
    marginBottom: normalize(16),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  heroEyebrow: { fontSize: normalize(12), color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  heroValue: {
    fontSize: normalize(28),
    fontWeight: '800',
    color: '#1e293b',
    marginTop: normalize(4),
  },
  heroCaption: { marginTop: normalize(6), fontSize: normalize(13), color: '#94a3b8' },
  sectionTitle: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: '#475569',
    marginBottom: normalize(8),
    marginTop: normalize(4),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row3: { flexDirection: 'row', gap: normalize(8), marginBottom: normalize(12) },
  statBlock: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: normalize(12),
    padding: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: { fontSize: normalize(11), color: '#64748b', fontWeight: '600' },
  statValue: { fontSize: normalize(13), fontWeight: '700', color: '#1e293b', marginTop: normalize(4) },
  statSub: { fontSize: normalize(10), color: '#94a3b8', marginTop: normalize(2) },
  chipsRow: { gap: normalize(8), paddingVertical: normalize(4), marginBottom: normalize(8) },
  chip: {
    backgroundColor: '#fff',
    borderRadius: normalize(12),
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(12),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    minWidth: normalize(88),
    marginRight: normalize(8),
  },
  chipCount: { fontSize: normalize(18), fontWeight: '800', color: '#1e293b', marginTop: normalize(4) },
  chipLabel: { fontSize: normalize(11), color: '#64748b', marginTop: normalize(2), fontWeight: '600' },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: normalize(12),
    padding: normalize(14),
    marginBottom: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  navIconWrap: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(12),
  },
  navCardText: { flex: 1 },
  navTitle: { fontSize: normalize(16), fontWeight: '700', color: '#1e293b' },
  navSub: { fontSize: normalize(13), color: '#64748b', marginTop: normalize(2) },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: normalize(10),
    padding: normalize(12),
    marginBottom: normalize(8),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listMain: { flex: 1 },
  listTitle: { fontSize: normalize(14), fontWeight: '600', color: '#1e293b' },
  listMeta: { fontSize: normalize(12), color: '#94a3b8', marginTop: normalize(2) },
  listValue: { fontSize: normalize(14), fontWeight: '700', color: '#2b6cb0' },
  empty: { color: '#94a3b8', fontSize: normalize(14), marginBottom: normalize(12), fontStyle: 'italic' },
  inlineLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(8),
    marginTop: normalize(12),
    paddingVertical: normalize(10),
  },
  inlineLinkText: { color: '#2b6cb0', fontWeight: '700', fontSize: normalize(14) },
});
