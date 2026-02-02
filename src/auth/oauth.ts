import { randomBytes, createHash } from 'node:crypto';
import {
  AUTH_URL,
  TOKEN_URL,
  COGNITO_CLIENT_ID,
  CALLBACK_URL,
} from '../config/constants.js';

export interface PKCECodes {
  codeVerifier: string;
  codeChallenge: string;
}

export interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export function generatePKCE(): PKCECodes {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

export function buildAuthUrl(codeChallenge: string): string {
  const url = new URL(AUTH_URL);
  url.searchParams.set('client_id', COGNITO_CLIENT_ID);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('redirect_uri', CALLBACK_URL);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('identity_provider', 'Google');
  return url.toString();
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: CALLBACK_URL,
    code_verifier: codeVerifier,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export function decodeIdToken(idToken: string): {
  email: string;
  name: string;
  sub: string;
} {
  const [, payload] = idToken.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  return {
    email: decoded.email,
    name: decoded.name || decoded.email.split('@')[0],
    sub: decoded.sub,
  };
}
