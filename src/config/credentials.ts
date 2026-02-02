import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface Credentials {
  version: number;
  current: {
    email: string;
    name: string;
    appId: string;
    appName: string;
    plan: string;
    publicKey: string;
    secretKey: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
    createdAt: string;
  } | null;
}

const CREDENTIALS_DIR = join(homedir(), '.seenn');
const CREDENTIALS_FILE = join(CREDENTIALS_DIR, 'credentials.json');

export function getCredentialsPath(): string {
  return CREDENTIALS_FILE;
}

export function ensureCredentialsDir(): void {
  if (!existsSync(CREDENTIALS_DIR)) {
    mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  }
}

export function readCredentials(): Credentials | null {
  try {
    if (!existsSync(CREDENTIALS_FILE)) {
      return null;
    }
    const data = readFileSync(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data) as Credentials;
  } catch {
    return null;
  }
}

export function writeCredentials(credentials: Credentials): void {
  ensureCredentialsDir();
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
}

export function clearCredentials(): boolean {
  try {
    if (existsSync(CREDENTIALS_FILE)) {
      unlinkSync(CREDENTIALS_FILE);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function isLoggedIn(): boolean {
  const creds = readCredentials();
  return creds !== null && creds.current !== null;
}

export function getCurrentUser(): Credentials['current'] {
  const creds = readCredentials();
  return creds?.current ?? null;
}

export function saveLogin(data: {
  email: string;
  name: string;
  appId: string;
  appName: string;
  plan: string;
  publicKey: string;
  secretKey: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}): void {
  const credentials: Credentials = {
    version: 1,
    current: {
      ...data,
      createdAt: new Date().toISOString(),
    },
  };
  writeCredentials(credentials);
}

export function updateKeys(publicKey: string, secretKey: string): void {
  const creds = readCredentials();
  if (creds?.current) {
    creds.current.publicKey = publicKey;
    creds.current.secretKey = secretKey;
    writeCredentials(creds);
  }
}
