import { API_BASE_URL } from '../config/constants.js';

export interface AccountInfo {
  id: string;
  name: string;
  email: string;
  plan: string;
  publicKey: string;
  secretKey?: string; // Only on first login
  newApiKeys?: {
    publicKey: string;
    secretKey: string;
  };
}

export async function getAccountInfo(idToken: string): Promise<AccountInfo> {
  const response = await fetch(`${API_BASE_URL}/accounts/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get account info: ${error}`);
  }

  return response.json() as Promise<AccountInfo>;
}

export interface RegenerateKeysResponse {
  publicKey: string;
  secretKey: string;
}

export async function regenerateApiKeys(idToken: string): Promise<RegenerateKeysResponse> {
  const response = await fetch(`${API_BASE_URL}/accounts/api-keys/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keyType: 'secret' }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to regenerate keys: ${error}`);
  }

  return response.json() as Promise<RegenerateKeysResponse>;
}

// Push Configuration

export interface PushConfigInput {
  bundleId: string;
  keyId: string;
  teamId: string;
  key: string;
  environment: 'production' | 'sandbox';
}

export interface PushConfigResponse {
  production: PushConfigEnv | null;
  sandbox: PushConfigEnv | null;
}

export interface PushConfigEnv {
  bundleId: string;
  keyId: string;
  teamId: string;
  environment: string;
  isConfigured: boolean;
  createdAt: string;
  updatedAt?: string;
}

export async function savePushConfig(idToken: string, config: PushConfigInput): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/accounts/push-config`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = (errorData as { error?: { message?: string } })?.error?.message || 'Failed to save push configuration';
    throw new Error(message);
  }
}

export async function getPushConfig(idToken: string): Promise<PushConfigResponse> {
  const response = await fetch(`${API_BASE_URL}/accounts/push-config`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get push configuration: ${error}`);
  }

  return response.json() as Promise<PushConfigResponse>;
}

export async function testPushNotification(idToken: string, deviceToken: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch(`${API_BASE_URL}/accounts/push-config/test`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: deviceToken }),
  });

  return response.json() as Promise<{ success: boolean; error?: string }>;
}
