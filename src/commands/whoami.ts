import chalk from 'chalk';
import { getCurrentUser, isLoggedIn } from '../config/credentials.js';
import { maskSecret, formatPlan, newLine } from '../utils/ui.js';
import { DOCS_URL } from '../config/constants.js';

export function whoamiCommand(): void {
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
  console.log(`Email:      ${chalk.bold(user.email)}`);
  console.log(`App:        ${user.appName} ${chalk.dim(`(${user.appId})`)}`);
  console.log(`Plan:       ${formatPlan(user.plan)}`);
  console.log(`Public Key: ${chalk.cyan(user.publicKey)}`);
  console.log(`Secret Key: ${maskSecret(user.secretKey)}`);
  newLine();
  console.log(`Docs: ${chalk.cyan(DOCS_URL)}`);
  newLine();
}
