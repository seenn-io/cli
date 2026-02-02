import chalk from 'chalk';
import { generatePKCE, buildAuthUrl, exchangeCodeForTokens, decodeIdToken } from '../auth/oauth.js';
import { startCallbackServer } from '../auth/server.js';
import { openBrowser } from '../auth/browser.js';
import { saveLogin, isLoggedIn, getCurrentUser, getCredentialsPath } from '../config/credentials.js';
import { getAccountInfo } from '../utils/api.js';
import { success, error, spinner, box, newLine } from '../utils/ui.js';
import { QUICKSTART_URL } from '../config/constants.js';

export async function loginCommand(): Promise<void> {
  // Check if already logged in
  if (isLoggedIn()) {
    const user = getCurrentUser();
    if (user) {
      console.log(`Already logged in as ${chalk.bold(user.email)}`);
      console.log(`Run ${chalk.cyan('seenn logout')} first to switch accounts.`);
      return;
    }
  }

  // Generate PKCE codes
  const { codeVerifier, codeChallenge } = generatePKCE();
  const authUrl = buildAuthUrl(codeChallenge);

  console.log('Opening browser for Google authentication...');
  newLine();

  // Start callback server
  const serverPromise = startCallbackServer();

  // Open browser
  try {
    await openBrowser(authUrl);
  } catch {
    error('Failed to open browser. Please open this URL manually:');
    console.log(chalk.cyan(authUrl));
    newLine();
  }

  const spin = spinner('Waiting for authentication...');

  try {
    // Wait for callback
    const { code } = await serverPromise;
    spin.text = 'Exchanging authorization code...';

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);
    spin.text = 'Fetching account information...';

    // Decode ID token to get user info
    const userInfo = decodeIdToken(tokens.id_token);

    // Get account info from API
    const account = await getAccountInfo(tokens.id_token);

    // Get keys (newApiKeys on first login, or existing)
    const publicKey = account.newApiKeys?.publicKey || account.publicKey;
    const secretKey = account.newApiKeys?.secretKey || account.secretKey || '';

    // Save credentials
    saveLogin({
      email: userInfo.email,
      name: userInfo.name,
      appId: account.id,
      appName: account.name,
      plan: account.plan,
      publicKey,
      secretKey,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    spin.stop();
    success(`Logged in as ${chalk.bold(userInfo.email)}`);

    // Show welcome box
    const lines = [
      `Welcome, ${chalk.bold(userInfo.name)}!`,
      '',
      `App:        ${account.name}`,
      `Public Key: ${chalk.cyan(publicKey)}`,
    ];

    if (secretKey) {
      lines.push(`Secret Key: ${chalk.yellow(secretKey)}  ${chalk.dim('← Save this!')}`);
      lines.push('');
      lines.push(chalk.yellow('⚠  Secret key will not be shown again.'));
    }

    lines.push('');
    lines.push(`Docs: ${chalk.cyan(QUICKSTART_URL)}`);

    box(lines);

    console.log(`Credentials saved to ${chalk.dim(getCredentialsPath())}`);
  } catch (err) {
    spin.stop();
    error(err instanceof Error ? err.message : 'Authentication failed');
    process.exit(1);
  }
}
