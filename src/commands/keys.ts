import chalk from 'chalk';
import { createInterface } from 'node:readline';
import { getCurrentUser, isLoggedIn, updateKeys } from '../config/credentials.js';
import { regenerateApiKeys } from '../utils/api.js';
import { maskSecret, success, error, warning, spinner, newLine, box } from '../utils/ui.js';

export function keysCommand(options: { reveal?: boolean }): void {
  if (!isLoggedIn()) {
    console.log('Not logged in.');
    console.log(`Run ${chalk.cyan('seenn login')} to authenticate.`);
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    console.log('Not logged in.');
    return;
  }

  newLine();
  console.log(`Public Key: ${chalk.cyan(user.publicKey)}`);

  if (options.reveal) {
    console.log(`Secret Key: ${chalk.yellow(user.secretKey)}`);
  } else {
    console.log(`Secret Key: ${maskSecret(user.secretKey)}`);
    newLine();
    console.log(chalk.dim(`Use ${chalk.cyan('seenn keys --reveal')} to show full secret key.`));
  }
  newLine();
}

export async function regenerateCommand(): Promise<void> {
  if (!isLoggedIn()) {
    console.log('Not logged in.');
    console.log(`Run ${chalk.cyan('seenn login')} to authenticate.`);
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    console.log('Not logged in.');
    return;
  }

  warning('This will invalidate your current keys.');
  newLine();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question("Type 'regenerate' to confirm: ", resolve);
  });
  rl.close();

  if (answer.trim().toLowerCase() !== 'regenerate') {
    console.log('Cancelled.');
    return;
  }

  newLine();
  const spin = spinner('Regenerating API keys...');

  try {
    const newKeys = await regenerateApiKeys(user.idToken);

    // Update stored credentials
    updateKeys(newKeys.publicKey, newKeys.secretKey);

    spin.stop();
    success('New keys generated!');

    box([
      `Public Key: ${chalk.cyan(newKeys.publicKey)}`,
      `Secret Key: ${chalk.yellow(newKeys.secretKey)}  ${chalk.dim('← Save this!')}`,
    ]);

    warning('Your old keys are now invalid.');
  } catch (err) {
    spin.stop();
    error(err instanceof Error ? err.message : 'Failed to regenerate keys');
    process.exit(1);
  }
}
