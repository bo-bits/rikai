// Chat tab — also the end-to-end pipe test. Sending a message hits the `turn`
// edge function with the session JWT; a reply (with its request_id) confirms the
// full path works: app session → JWT → verified student_id → Anthropic → back.

import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { callTurn } from '@/lib/api';

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  requestId?: string;
};

export default function Chat() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Msg = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setBusy(true);

    try {
      const res = await callTurn(text);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: res.assistant_message,
          requestId: res.request_id,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ ${err instanceof Error ? err.message : String(err)}`,
        },
      ]);
    } finally {
      setBusy(false);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.fill} edges={['bottom']}>
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
                Say something to test the pipe. Your message goes to the `turn`
                function authenticated with your session.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.bubble,
                  item.role === 'user'
                    ? { backgroundColor: theme.tint, alignSelf: 'flex-end' }
                    : {
                        backgroundColor: theme.backgroundElement,
                        alignSelf: 'flex-start',
                      },
                ]}>
                <ThemedText
                  style={item.role === 'user' ? { color: '#fff' } : undefined}>
                  {item.text}
                </ThemedText>
                {item.requestId ? (
                  <ThemedText type="small" themeColor="textSecondary" style={styles.meta}>
                    {item.requestId}
                  </ThemedText>
                ) : null}
              </View>
            )}
          />

          <View style={[styles.composer, { borderTopColor: theme.border }]}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Message…"
              placeholderTextColor={theme.textSecondary}
              value={input}
              onChangeText={setInput}
              editable={!busy}
              multiline
              onSubmitEditing={send}
            />
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: theme.tint, opacity: pressed || busy ? 0.6 : 1 },
              ]}
              onPress={send}
              disabled={busy}>
              {busy ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <ThemedText style={styles.sendText}>Send</ThemedText>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  listContent: { padding: Spacing.three, gap: Spacing.two, flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: Spacing.six, paddingHorizontal: Spacing.four },
  bubble: {
    maxWidth: '85%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    gap: Spacing.half,
  },
  meta: { fontSize: 11 },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    padding: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    minHeight: 44,
  },
  sendText: { color: '#fff', fontWeight: '600' },
});
