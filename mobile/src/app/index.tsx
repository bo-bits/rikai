// Entry route. The auth gate in _layout redirects away from here as soon as the
// session resolves; until then this neutral splash is what shows.

import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function Index() {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.background,
      }}>
      <ActivityIndicator color={theme.tint} />
    </View>
  );
}
