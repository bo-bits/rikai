// Topics tab — placeholder. The manifest (topics table) will populate this once
// we wire a read endpoint; for now it's a styled stub so the tab exists.

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function Topics() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedText type="subtitle">Topics</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.center}>
        Your learning threads will live here once the read path is wired.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    padding: Spacing.four,
  },
  center: { textAlign: 'center' },
});
