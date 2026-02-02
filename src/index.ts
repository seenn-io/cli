#!/usr/bin/env node
import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { keysCommand, regenerateCommand } from './commands/keys.js';
import { setupIosCommand, setupIosStatusCommand } from './commands/setup.js';

const program = new Command();

program
  .name('seenn')
  .description('Seenn CLI - Manage your Seenn account from the command line')
  .version('0.2.0');

program
  .command('login')
  .description('Authenticate with your Seenn account via Google')
  .action(loginCommand);

program
  .command('logout')
  .description('Remove stored credentials')
  .action(logoutCommand);

program
  .command('whoami')
  .description('Display current user information')
  .action(whoamiCommand);

program
  .command('keys')
  .description('Show your API keys')
  .option('--reveal', 'Show full secret key')
  .action(keysCommand);

program
  .command('keys:regenerate')
  .description('Generate new API keys (invalidates current keys)')
  .action(regenerateCommand);

// Setup commands
const setup = program
  .command('setup')
  .description('Configure push notifications and other services');

setup
  .command('ios')
  .description('Configure iOS push notifications (APNs)')
  .option('--p8 <path>', 'Path to .p8 key file')
  .option('--team-id <id>', 'Apple Team ID (10 characters)')
  .option('--key-id <id>', 'APNs Key ID (10 characters)')
  .option('--bundle-id <id>', 'App Bundle ID (e.g. com.myapp)')
  .option('--sandbox', 'Use sandbox environment instead of production')
  .action(setupIosCommand);

setup
  .command('ios:status')
  .description('Show current iOS push configuration')
  .action(setupIosStatusCommand);

program.parse();
