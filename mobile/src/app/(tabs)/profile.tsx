// Profile tab — shows who's signed in (proving the session/JWT is live) and a
// sign-out button. student_id is the auth user id the edge functions derive.

import { StyleSheet, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="code">{value}</ThemedText>
    </View>
  );
}

export default function Profile() {
  const theme = useTheme();
  const { session } = useSession();
  const user = session?.user;

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.fill} edges={['bottom']}>
        <View style={styles.container}>
          <ThemedText type="subtitle">Profile</ThemedText>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.backgroundElement, borderColor: theme.border },
            ]}>
            <Field label="Email" value={user?.email ?? '—'} />
            <Field label="student_id (auth uid)" value={user?.id ?? '—'} />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.signOut,
              { borderColor: theme.border, opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => supabase.auth.signOut()}>
            <ThemedText themeColor="danger" style={styles.signOutText}>
              Sign out
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: { flex: 1, padding: Spacing.four, gap: Spacing.four },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  field: { gap: Spacing.half },
  signOut: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  signOutText: { fontWeight: '600' },
});
