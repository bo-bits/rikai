// Home / Today — the landing screen. Greets the student, offers the most
// recently visited topic to continue, links to the full topics list, and shows
// a few Explore suggestions (static for now — Issue B-5 will make these dynamic).

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import { StatusDot } from '@/components/status-dot';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { fetchTopics, type Topic } from '@/lib/api';
import { useSession } from '@/lib/auth';
import { useTheme } from '@/hooks/use-theme';

// STUB: hardcoded Explore suggestions. Replace with the real signal-driven feed
// (student interests + started topics) once the backend lands.
//   Explore feed:  https://github.com/bo-bits/rikai/issues/4  (B-5)
//   depends on onboarding: https://github.com/bo-bits/rikai/issues/3
// The expected shape ({ title, blurb, topic_slug? }) is documented in #4.
const EXPLORE_SUGGESTIONS = [
  { title: 'The Medici Family', blurb: 'The bankers who bankrolled the Renaissance.' },
  { title: 'Game Theory', blurb: 'Why rational people sometimes choose to lose.' },
  { title: 'The Byzantine Empire', blurb: 'Rome that refused to fall for a thousand years.' },
];

function greetingName(email: string | undefined): string {
  if (!email) return 'there';
  const handle = email.split('@')[0];
  return handle.charAt(0).toUpperCase() + handle.slice(1);
}

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const { session } = useSession();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  const name = greetingName(session?.user?.email);
  const continueTopic = topics[0] ?? null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <ThemedText type="displayLarge" style={styles.hello}>
          Hello, {name}.
        </ThemedText>

        {/* Continue section */}
        {loading ? (
          <ActivityIndicator color={theme.textSecondary} style={styles.loader} />
        ) : continueTopic ? (
          <View style={styles.section}>
            <ThemedText type="small" themeColor="textTertiary" style={styles.eyebrow}>
              CONTINUE
            </ThemedText>
            <Pressable
              style={({ pressed }) => [
                styles.continueCard,
                { backgroundColor: theme.inputFill, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: { topic: continueTopic.topic_slug, title: continueTopic.title },
                })
              }>
              <View style={styles.cardTitleRow}>
                <StatusDot status={continueTopic.status} size={10} />
                <ThemedText type="default" style={styles.cardTitle}>
                  {continueTopic.title}
                </ThemedText>
              </View>
              <ThemedText type="default" themeColor="textSecondary" style={styles.thread}>
                {continueTopic.resume_prompt ?? 'Pick up where you left off.'}
              </ThemedText>
              <ThemedText type="small" style={[styles.cta, { color: theme.tint }]}>
                Continue the thread →
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.section}>
            <Pressable
              style={({ pressed }) => [
                styles.continueCard,
                { backgroundColor: theme.inputFill, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => router.push('/chat')}>
              <ThemedText type="default" style={styles.cardTitle}>
                Start exploring
              </ThemedText>
              <ThemedText type="default" themeColor="textSecondary" style={styles.thread}>
                Ask about anything you're curious about and your tutor will pick
                it up from there.
              </ThemedText>
              <ThemedText type="small" style={[styles.cta, { color: theme.tint }]}>
                Start a conversation →
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* See all topics */}
        <Pressable
          style={({ pressed }) => [
            styles.allTopicsRow,
            { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.navigate('/topics')}>
          <ThemedText type="default">See all topics</ThemedText>
          <ChevronRight size={20} color={theme.textTertiary} strokeWidth={2} />
        </Pressable>

        {/* Explore */}
        <View style={styles.section}>
          <ThemedText type="small" themeColor="textTertiary" style={styles.eyebrow}>
            EXPLORE
          </ThemedText>
          {EXPLORE_SUGGESTIONS.map((s) => (
            <Pressable
              key={s.title}
              style={({ pressed }) => [
                styles.exploreCard,
                { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() =>
                router.push({ pathname: '/chat', params: { title: s.title } })
              }>
              <ThemedText type="default" style={styles.cardTitle}>
                {s.title}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {s.blurb}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.five,
  },
  hello: { marginBottom: Spacing.one },
  loader: { alignSelf: 'flex-start' },
  section: { gap: Spacing.two },
  eyebrow: { letterSpacing: 1, fontWeight: '600' },
  continueCard: {
    borderRadius: 16,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cardTitle: { fontWeight: '600' },
  thread: { lineHeight: 24 },
  cta: { fontWeight: '600', marginTop: Spacing.one },
  allTopicsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
  },
  exploreCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
