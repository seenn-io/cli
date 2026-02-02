#!/usr/bin/env node
import { Command } from 'commander';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { keysCommand, regenerateCommand } from './commands/keys.js';

const program = new Command();

program
  .name('seenn')
  .description('Seenn CLI - Manage your Seenn account from the command line')
  .version('0.1.0');

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

program.parse();
