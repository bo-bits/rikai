// Passwordless sign-in. Step 1: enter an email → Supabase sends a 6-digit code
// (and a magic link). Step 2: enter the code → verifyOtp mints a session. We use
// the OTP *code* path rather than the link so it works in Expo Go with no
// deep-linking setup; locally the code lands in Mailpit (http://127.0.0.1:55324).

import { useState } from 'react';
import {
  ActivityIndicator,
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
import { supabase } from '@/lib/supabase';

type Step = 'email' | 'code';

export default function SignIn() {
  const theme = useTheme();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setStep('code');
  }

  async function verify() {
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    });
    setBusy(false);
    // On success the auth listener flips the session and the gate routes us in.
    if (error) setError(error.message);
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      borderColor: theme.border,
      color: theme.text,
    },
  ];

  return (
    <View style={[styles.fill, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.fill}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.container}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.brand}>
                rickai
              </ThemedText>
              <ThemedText themeColor="textSecondary">
                {step === 'email'
                  ? 'Sign in with your email — we’ll send a code.'
                  : `Enter the code we sent to ${email}.`}
              </ThemedText>
            </View>

            {step === 'email' ? (
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
                editable={!busy}
              />
            ) : (
              <TextInput
                style={inputStyle}
                placeholder="123456"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                value={code}
                onChangeText={setCode}
                editable={!busy}
              />
            )}

            {error ? (
              <ThemedText themeColor="danger" type="small">
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: theme.tint, opacity: pressed || busy ? 0.7 : 1 },
              ]}
              disabled={busy}
              onPress={step === 'email' ? sendCode : verify}>
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {step === 'email' ? 'Send code' : 'Verify & sign in'}
                </ThemedText>
              )}
            </Pressable>

            {step === 'code' ? (
              <Pressable onPress={() => setStep('email')} disabled={busy}>
                <ThemedText themeColor="textSecondary" type="small" style={styles.center}>
                  Use a different email
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: { gap: Spacing.two, marginBottom: Spacing.two },
  brand: { fontSize: 40, lineHeight: 44 },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  button: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  center: { textAlign: 'center' },
});
