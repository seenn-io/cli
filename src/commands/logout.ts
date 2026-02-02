import { clearCredentials, isLoggedIn } from '../config/credentials.js';
import { success, info } from '../utils/ui.js';

export function logoutCommand(): void {
  if (!isLoggedIn()) {
    info('Not logged in.');
    return;
  }

  const cleared = clearCredentials();
  if (cleared) {
    success('Logged out. Credentials removed.');
  } else {
    info('Already logged out.');
  }
}
