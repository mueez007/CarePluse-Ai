import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: string }> {
  const supabase = getDb();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });

  if (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<{ userId: string } | null> {
  const supabase = getDb();

  const { data: session, error } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (error || !session) return null;

  if (new Date(session.expires_at) < new Date()) {
    // Session expired — clean it up
    await supabase.from('sessions').delete().eq('token', token);
    return null;
  }

  return { userId: session.user_id };
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = getDb();
  await supabase.from('sessions').delete().eq('token', token);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  const supabase = getDb();
  await supabase.from('sessions').delete().eq('user_id', userId);
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export async function createUser(name: string, email: string, passwordHash: string): Promise<UserRecord> {
  const supabase = getDb();

  // Insert user
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash })
    .select('id, name, email, created_at')
    .single();

  if (userError || !user) {
    console.error('Error creating user:', userError);
    throw new Error(userError?.message || 'Failed to create user');
  }

  // Create empty profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({ user_id: user.id });

  if (profileError) {
    console.error('Error creating user profile:', profileError);
    // Non-fatal — user is created, profile can be retried
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

export async function getUserByEmail(email: string): Promise<(UserRecord & { password_hash: string }) | null> {
  const supabase = getDb();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, created_at')
    .eq('email', email)
    .single();

  if (error || !user) return null;
  return user;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  const supabase = getDb();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, created_at')
    .eq('id', id)
    .single();

  if (error || !user) return null;
  return user;
}

export async function getUserFromToken(token: string | undefined): Promise<UserRecord | null> {
  if (!token) return null;
  const session = await validateSession(token);
  if (!session) return null;
  return getUserById(session.userId);
}

export const SESSION_COOKIE_NAME = 'carepulse_session';
