// Thin client for our Supabase Edge Functions. Every call carries the user's
// session JWT as a Bearer token; the `turn` function derives student_id from
// that token (the body never sends an identity), so the pipe is: app session →
// JWT → edge function → verified student_id → Anthropic.

import { supabase } from '@/lib/supabase';

const BASE = process.env.EXPO_PUBLIC_SUPABASE_URL;
const ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export type TurnResponse = {
  session_id: string;
  assistant_message: string;
  request_id: string;
};

export async function callTurn(
  userMessage: string,
  topicSlug: string | null = null,
): Promise<TurnResponse> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');

  const res = await fetch(`${BASE}/functions/v1/turn`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON ?? '',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_message: userMessage, topic_slug: topicSlug }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error ?? `turn failed (${res.status})`);
  }
  return payload as TurnResponse;
}
