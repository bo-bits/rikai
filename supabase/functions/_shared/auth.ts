// Auth: derive the verified user from the request's Bearer token.
//
// The mobile client sends its Supabase session JWT as `Authorization: Bearer
// <access_token>`. We verify it against the auth server with an anon-key client
// and return the authenticated user's id, which IS the student_id (the RLS
// policies assume `auth.uid()::text = student_id`). Data access still uses the
// service-role client from clients.ts; this only establishes *who* is calling,
// so the body can't spoof identity.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json } from "./http.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// New Supabase key format exposes the publishable key; older stacks inject
// SUPABASE_ANON_KEY. Either works as the client key for token verification.
const CLIENT_KEY = Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

// Resolves the caller's user id, or returns a 401 Response to short-circuit.
export async function requireUser(
  req: Request,
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "missing bearer token" }, 401);
  }
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return json({ error: "missing bearer token" }, 401);

  const client = createClient(SUPABASE_URL, CLIENT_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    return json({ error: "invalid or expired token" }, 401);
  }
  return { userId: data.user.id };
}
