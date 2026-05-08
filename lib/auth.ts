import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getDb } from './db';

const SALT_ROUNDS = 10;
const SESSION_DURATION_DAYS = 30;

// ----- Password Utilities -----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ----- Session Utilities -----

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateId(): string {
  return crypto.randomUUID();
}

export function createSession(userId: string): { token: string; expiresAt: string } {
  const db = getDb();
  const token = generateToken();
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    'INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).run(sessionId, userId, token, expiresAt);

  return { token, expiresAt };
}

export function validateSession(token: string): { userId: string } | null {
  const db = getDb();
  const session = db.prepare(
    'SELECT user_id, expires_at FROM sessions WHERE token = ?'
  ).get(token) as { user_id: string; expires_at: string } | undefined;

  if (!session) return null;

  // Check expiry
  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  return { userId: session.user_id };
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteAllUserSessions(userId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

// ----- User Utilities -----

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export function createUser(name: string, email: string, passwordHash: string): UserRecord {
  const db = getDb();
  const id = generateId();

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)'
  ).run(id, name, email, passwordHash);

  // Create empty profile
  db.prepare(
    'INSERT INTO user_profiles (user_id) VALUES (?)'
  ).run(id);

  return { id, name, email, created_at: new Date().toISOString() };
}

export function getUserByEmail(email: string): (UserRecord & { password_hash: string }) | null {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?'
  ).get(email) as (UserRecord & { password_hash: string }) | undefined;

  return user || null;
}

export function getUserById(id: string): UserRecord | null {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, name, email, created_at FROM users WHERE id = ?'
  ).get(id) as UserRecord | undefined;

  return user || null;
}

// ----- Helper for API routes: extract user from cookie -----

export function getUserFromToken(token: string | undefined): UserRecord | null {
  if (!token) return null;
  const session = validateSession(token);
  if (!session) return null;
  return getUserById(session.userId);
}

export const SESSION_COOKIE_NAME = 'carepulse_session';
