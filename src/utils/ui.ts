import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

export function error(message: string): void {
  console.log(chalk.red('✗'), message);
}

export function warning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export function spinner(text: string): Ora {
  return ora({ text, spinner: 'dots' }).start();
}

export function box(lines: string[], title?: string): void {
  const maxLen = Math.max(...lines.map((l) => l.length), title?.length || 0);
  const width = maxLen + 4;
  const border = '─'.repeat(width - 2);

  console.log();
  console.log(chalk.gray(`┌${border}┐`));

  if (title) {
    console.log(chalk.gray('│') + ' ' + chalk.bold(title.padEnd(width - 3)) + chalk.gray('│'));
    console.log(chalk.gray('│') + ' '.repeat(width - 2) + chalk.gray('│'));
  }

  for (const line of lines) {
    console.log(chalk.gray('│') + ' ' + line.padEnd(width - 3) + chalk.gray('│'));
  }

  console.log(chalk.gray(`└${border}┘`));
  console.log();
}

export function maskSecret(secret: string): string {
  if (secret.length <= 12) {
    return '••••••••';
  }
  return secret.slice(0, 8) + '••••••••';
}

export function formatPlan(plan: string): string {
  const planMap: Record<string, string> = {
    free: 'Free (1K jobs/mo)',
    starter: 'Starter (10K jobs/mo)',
    pro: 'Pro (100K jobs/mo)',
    scale: 'Scale (1M jobs/mo)',
  };
  return planMap[plan.toLowerCase()] || plan;
}

export function newLine(): void {
  console.log();
}
