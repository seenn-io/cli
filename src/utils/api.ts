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
  const response = await fetch(`${API_BASE_URL}/accounts/keys/regenerate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to regenerate keys: ${error}`);
  }

  return response.json() as Promise<RegenerateKeysResponse>;
}
