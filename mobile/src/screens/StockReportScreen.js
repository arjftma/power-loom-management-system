import React, { useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStockReport } from '../queries/useStockReport';
import { normalize } from '../utils/responsive';
import { pullRefreshControl } from '../utils/pullToRefresh';

function fmtMeters(n) {
  const v = Number(n ?? 0);
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} m`;
}

export default function StockReportScreen({ navigation }) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Stock report',
      headerStyle: { backgroundColor: '#2b6cb0' },
      headerTintColor: '#fff',
    });
  }, [navigation]);

  const { data, isLoading, isFetching, isError, error, refetch } = useStockReport();

  const sections = useMemo(() => {
    const rows = data?.by_date;
    if (!Array.isArray(rows)) return [];
    return rows.map((day) => ({
      title: day.date,
      dayTotal: day.total_meters,
      batchCount: day.batch_count,
      data: Array.isArray(day.batches) ? day.batches : [],
    }));
  }, [data]);

  const summary = data?.summary;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2b6cb0" />
        <Text style={styles.muted}>Loading report…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={normalize(44)} color="#e53e3e" />
        <Text style={styles.errTitle}>Could not load report</Text>
        <Text style={styles.muted}>{error?.message || 'Unknown error'}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>All fabric added (production)</Text>
        <Text style={styles.bannerValue}>
          {summary ? `${fmtMeters(summary.total_production_meters)} · ${summary.total_batches} batch(es)` : '—'}
        </Text>
        <Text style={styles.bannerHint}>Grouped by batch date (what you entered on each production record).</Text>
      </View>
      {sections.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.listEmptyGrow}
          refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
        >
          <Text style={styles.empty}>No production batches yet. Add them under the Produce tab.</Text>
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionDate}>{section.title}</Text>
                <Text style={styles.sectionMeta}>
                  {section.batchCount} batch{section.batchCount === 1 ? '' : 'es'} · {fmtMeters(section.dayTotal)} total
                </Text>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.rowTitle}>
                  Loom {item.loom_number} · {item.fabric_type || '—'}
                </Text>
                <Text style={styles.rowSub}>
                  Recorded {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                </Text>
              </View>
              <Text style={styles.rowMeters}>{fmtMeters(item.meters_produced)}</Text>
            </View>
          )}
          contentContainerStyle={styles.listPad}
          stickySectionHeadersEnabled
          refreshControl={pullRefreshControl(isFetching && !isLoading, refetch)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f0f4f8' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(24),
    backgroundColor: '#f0f4f8',
  },
  muted: { marginTop: normalize(10), color: '#718096', fontSize: normalize(14), textAlign: 'center' },
  errTitle: { marginTop: normalize(12), fontSize: normalize(17), fontWeight: '700', color: '#1a202c' },
  retry: {
    marginTop: normalize(20),
    backgroundColor: '#2b6cb0',
    paddingHorizontal: normalize(24),
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
  },
  retryText: { color: '#fff', fontWeight: '700' },
  banner: {
    backgroundColor: '#fff',
    marginHorizontal: normalize(15),
    marginTop: normalize(12),
    marginBottom: normalize(8),
    padding: normalize(16),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bannerLabel: { fontSize: normalize(12), fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  bannerValue: { fontSize: normalize(20), fontWeight: '800', color: '#2b6cb0', marginTop: normalize(4) },
  bannerHint: { fontSize: normalize(12), color: '#94a3b8', marginTop: normalize(8), lineHeight: normalize(18) },
  listPad: { paddingBottom: normalize(24) },
  listEmptyGrow: { flexGrow: 1, padding: normalize(20) },
  sectionHead: {
    backgroundColor: '#edf2f7',
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(10),
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionDate: { fontSize: normalize(16), fontWeight: '800', color: '#1a202c' },
  sectionMeta: { fontSize: normalize(13), color: '#4a5568', marginTop: normalize(2) },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: normalize(15),
    marginBottom: normalize(8),
    padding: normalize(14),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowMain: { flex: 1, paddingRight: normalize(8) },
  rowTitle: { fontSize: normalize(15), fontWeight: '600', color: '#2d3748' },
  rowSub: { fontSize: normalize(11), color: '#a0aec0', marginTop: normalize(4) },
  rowMeters: { fontSize: normalize(16), fontWeight: '700', color: '#2b6cb0' },
  empty: { textAlign: 'center', color: '#a0aec0', fontSize: normalize(15), marginTop: normalize(24) },
});
