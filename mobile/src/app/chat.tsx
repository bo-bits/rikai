// Chat screen — the redesigned tutoring surface (Phase 4). Pushed full-screen
// over the tabs with a back arrow; reached from Home or Topics. Accepts an
// optional `topic` slug param so a chat can be scoped to a topic.
//
// Teacher replies render as flowing text (no bubble); the student's own
// messages are grey bubbles. Long-pressing a teacher message opens an Ask
// action that quotes it as context for a follow-up (frontend-only).
//
// V0 renders teacher replies as plain text. The design's two-level messages
// (Fraunces heading + body) and the multiple-choice card need `turn` to return
// structured content rather than a plain text blob — deferred past V0.

import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowUp, ChevronLeft, MessageSquare, X } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { callTurn } from '@/lib/api';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  requestId?: string;
};

const EXPLAIN_SIMPLY = 'Just explain it to me directly and simply.';

export default function Chat() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ topic?: string; title?: string }>();
  const topicSlug = params.topic ?? null;
  const headerTitle = params.title ?? (topicSlug ? topicSlug : 'New topic');

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [quoted, setQuoted] = useState<string | null>(null);
  const [toolbarFor, setToolbarFor] = useState<Msg | null>(null);
  const listRef = useRef<FlatList<Msg>>(null);
  const inputRef = useRef<TextInput>(null);

  const firstTeacherId = messages.find((m) => m.role === 'assistant')?.id;

  async function send(textOverride?: string) {
    const raw = (textOverride ?? input).trim();
    if (!raw || busy) return;

    // Ask: prepend the quoted teacher message as context for this turn.
    const payload = quoted
      ? `Regarding what you said: "${quoted}"\n\n${raw}`
      : raw;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text: raw };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setQuoted(null);
    setBusy(true);

    try {
      const res = await callTurn(payload, topicSlug);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', text: res.assistant_message, requestId: res.request_id },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: 'assistant', text: `⚠️ ${err instanceof Error ? err.message : String(err)}` },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  function onAsk() {
    if (toolbarFor) setQuoted(toolbarFor.text);
    setToolbarFor(null);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {/* Nav bar */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerSide}>
            <ChevronLeft size={24} color={theme.text} strokeWidth={2} />
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText type="small" themeColor="textTertiary" style={styles.eyebrow}>
              DEEPEN
            </ThemedText>
            <ThemedText type="default" style={styles.headerTitle} numberOfLines={1}>
              {headerTitle}
            </ThemedText>
          </View>
          <View style={styles.headerSide} />
        </View>

        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <ThemedText themeColor="textSecondary" style={styles.empty}>
                Ask anything to start. Your tutor picks it up from here.
              </ThemedText>
            }
            renderItem={({ item }) => {
              if (item.role === 'user') {
                return (
                  <View style={[styles.studentBubble, { backgroundColor: theme.inputFill }]}>
                    <ThemedText style={styles.studentText}>{item.text}</ThemedText>
                  </View>
                );
              }
              const isFirst = item.id === firstTeacherId;
              return (
                <Pressable
                  onLongPress={() => setToolbarFor(item)}
                  delayLongPress={300}
                  style={styles.teacherWrap}>
                  <ThemedText style={[styles.teacherText, isFirst && styles.teacherLead]}>
                    {item.text}
                  </ThemedText>
                </Pressable>
              );
            }}
          />

          {/* Quoted-context chip (Ask) */}
          {quoted && (
            <View style={[styles.quoteChip, { backgroundColor: theme.inputFill, borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary" numberOfLines={2} style={styles.quoteText}>
                Asking about: “{quoted}”
              </ThemedText>
              <Pressable onPress={() => setQuoted(null)} hitSlop={8}>
                <X size={16} color={theme.textTertiary} strokeWidth={2} />
              </Pressable>
            </View>
          )}

          {/* Input area */}
          <View style={[styles.composer, { borderTopColor: theme.border }]}>
            <Pressable
              onPress={() => send(EXPLAIN_SIMPLY)}
              disabled={busy}
              style={({ pressed }) => [
                styles.explainPill,
                { borderColor: theme.border, opacity: pressed || busy ? 0.5 : 1 },
              ]}>
              <ThemedText type="small" themeColor="textSecondary">Just explain it</ThemedText>
            </Pressable>

            <View style={styles.inputRow}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { backgroundColor: theme.inputFill, color: theme.text }]}
                placeholder="Reply, or ask your own…"
                placeholderTextColor={theme.textTertiary}
                value={input}
                onChangeText={setInput}
                editable={!busy}
                multiline
                onSubmitEditing={() => send()}
              />
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: theme.tint, opacity: pressed || busy || !input.trim() ? 0.4 : 1 },
                ]}
                onPress={() => send()}
                disabled={busy || !input.trim()}>
                {busy ? (
                  <ActivityIndicator color={theme.background} size="small" />
                ) : (
                  <ArrowUp size={20} color={theme.background} strokeWidth={2.5} />
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Long-press action */}
      <Modal visible={!!toolbarFor} transparent animationType="fade" onRequestClose={() => setToolbarFor(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setToolbarFor(null)}>
          <View style={[styles.toolbar, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <ToolbarAction icon={<MessageSquare size={20} color={theme.text} strokeWidth={2} />} label="Ask" onPress={onAsk} theme={theme} />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ToolbarAction({
  icon, label, onPress, theme,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.toolbarAction, pressed && { backgroundColor: theme.inputFill }]}>
      {icon}
      <ThemedText type="small" style={styles.toolbarLabel}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSide: { width: 40, alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  eyebrow: { letterSpacing: 1.5, fontWeight: '600', fontSize: 11 },
  headerTitle: { fontWeight: '600' },
  listContent: { padding: Spacing.four, gap: Spacing.four, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: Spacing.six, paddingHorizontal: Spacing.four },

  teacherWrap: { alignSelf: 'stretch' },
  teacherText: { fontSize: 18, lineHeight: 28 },
  teacherLead: {
    fontFamily: Fonts.serif,
    fontSize: 21,
    lineHeight: 30,
  },

  studentBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    borderRadius: 18,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  studentText: { fontSize: 18, lineHeight: 26 },

  quoteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quoteText: { flex: 1, fontStyle: 'italic' },

  composer: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  explainPill: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 100,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxHeight: 120,
    fontSize: 18,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  toolbar: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  toolbarAction: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    minWidth: 84,
  },
  toolbarLabel: { fontWeight: '600' },
});
