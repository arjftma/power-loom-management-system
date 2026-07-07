import React from 'react';
import { RefreshControl } from 'react-native';

/** Spinner color for iOS (tint) and Android (colors). */
export const PULL_REFRESH_COLOR = '#2b6cb0';

/**
 * Standard pull-to-refresh control (pull down from top like social feeds).
 * @param {boolean} refreshing - true while a refetch is in progress (not initial load).
 * @param {() => void} onRefresh
 */
export function pullRefreshControl(refreshing, onRefresh) {
  return (
    <RefreshControl
      refreshing={!!refreshing}
      onRefresh={onRefresh}
      tintColor={PULL_REFRESH_COLOR}
      colors={[PULL_REFRESH_COLOR]}
    />
  );
}
