import chalk from 'chalk';
import { createInterface } from 'node:readline';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCurrentUser, isLoggedIn } from '../config/credentials.js';
import { savePushConfig, getPushConfig } from '../utils/api.js';
import { success, error, warning, spinner, box, newLine } from '../utils/ui.js';

interface SetupIosOptions {
  p8?: string;
  teamId?: string;
  keyId?: string;
  bundleId?: string;
  sandbox?: boolean;
}

async function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

export async function setupIosCommand(options: SetupIosOptions): Promise<void> {
  if (!isLoggedIn()) {
    console.log('Not logged in.');
    console.log(`Run ${chalk.cyan('seenn login')} first.`);
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    error('Not logged in.');
    return;
  }

  newLine();
  console.log(chalk.bold('iOS Push Notification Setup (APNs)'));
  console.log(chalk.dim('Configure your Apple Push Notification service credentials.'));
  newLine();

  let p8Path = options.p8;
  let teamId = options.teamId;
  let keyId = options.keyId;
  let bundleId = options.bundleId;
  const environment = options.sandbox ? 'sandbox' : 'production';

  // Interactive mode if options not provided
  if (!p8Path || !teamId || !keyId || !bundleId) {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (!p8Path) {
      p8Path = await prompt(rl, `${chalk.cyan('?')} Path to .p8 file: `);
    }
    if (!teamId) {
      teamId = await prompt(rl, `${chalk.cyan('?')} Team ID (10 chars): `);
    }
    if (!keyId) {
      keyId = await prompt(rl, `${chalk.cyan('?')} Key ID (10 chars): `);
    }
    if (!bundleId) {
      bundleId = await prompt(rl, `${chalk.cyan('?')} Bundle ID (e.g. com.myapp): `);
    }

    rl.close();
  }

  // Validate inputs
  if (!p8Path) {
    error('Path to .p8 file is required.');
    return;
  }

  const resolvedPath = resolve(p8Path);
  if (!existsSync(resolvedPath)) {
    error(`File not found: ${resolvedPath}`);
    return;
  }

  if (!teamId || teamId.length !== 10) {
    error('Team ID must be exactly 10 characters.');
    return;
  }

  if (!keyId || keyId.length !== 10) {
    error('Key ID must be exactly 10 characters.');
    return;
  }

  if (!bundleId || !bundleId.match(/^[a-zA-Z][a-zA-Z0-9.-]*$/)) {
    error('Invalid bundle ID format.');
    return;
  }

  // Read p8 file
  let p8Content: string;
  try {
    p8Content = readFileSync(resolvedPath, 'utf-8');
  } catch (err) {
    error(`Failed to read .p8 file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return;
  }

  if (!p8Content.includes('-----BEGIN PRIVATE KEY-----')) {
    error('Invalid .p8 file format. Must contain a valid Apple Push Notification key.');
    return;
  }

  newLine();
  const spin = spinner('Saving APNs configuration...');

  try {
    await savePushConfig(user.idToken, {
      bundleId,
      keyId,
      teamId,
      key: p8Content,
      environment,
    });

    spin.stop();
    success('APNs configuration saved!');

    box([
      `Bundle ID:   ${chalk.cyan(bundleId)}`,
      `Team ID:     ${teamId}`,
      `Key ID:      ${keyId}`,
      `Environment: ${environment}`,
    ]);

    console.log(chalk.dim('You can now send push notifications to iOS devices.'));
    console.log(chalk.dim(`Test with: ${chalk.cyan('seenn setup ios --test <device-token>')}`));
    newLine();
  } catch (err) {
    spin.stop();
    error(err instanceof Error ? err.message : 'Failed to save configuration');
  }
}

export async function setupIosStatusCommand(): Promise<void> {
  if (!isLoggedIn()) {
    console.log('Not logged in.');
    console.log(`Run ${chalk.cyan('seenn login')} first.`);
    return;
  }

  const user = getCurrentUser();
  if (!user) {
    error('Not logged in.');
    return;
  }

  const spin = spinner('Fetching push configuration...');

  try {
    const config = await getPushConfig(user.idToken);
    spin.stop();

    newLine();
    console.log(chalk.bold('iOS Push Configuration'));
    newLine();

    const formatEnv = (env: typeof config.production, name: string) => {
      if (!env) {
        console.log(`${name}: ${chalk.dim('Not configured')}`);
        return;
      }
      console.log(`${chalk.bold(name)}:`);
      console.log(`  Bundle ID:   ${chalk.cyan(env.bundleId)}`);
      console.log(`  Team ID:     ${env.teamId}`);
      console.log(`  Key ID:      ${env.keyId}`);
      console.log(`  Configured:  ${env.isConfigured ? chalk.green('Yes') : chalk.yellow('No')}`);
      console.log(`  Updated:     ${env.updatedAt || env.createdAt}`);
    };

    formatEnv(config.production, 'Production');
    newLine();
    formatEnv(config.sandbox, 'Sandbox');
    newLine();
  } catch (err) {
    spin.stop();
    error(err instanceof Error ? err.message : 'Failed to fetch configuration');
  }
}
