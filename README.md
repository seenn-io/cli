# @seenn/cli

Official CLI for [Seenn](https://seenn.io) - Real-time push notifications and Live Activities for your apps.

## Installation

```bash
npm install -g @seenn/cli
```

Or use with npx:

```bash
npx @seenn/cli login
```

## Usage

### Login

Authenticate with your Seenn account using Google OAuth:

```bash
seenn login
```

This will open your browser for authentication. Once complete, your credentials are stored locally.

### View Account Info

```bash
seenn whoami
```

Output:
```
Email:      your@email.com
App:        My App (app_01HQ...)
Plan:       Free (1K jobs/mo)
Public Key: pk_live_abc123...
Secret Key: sk_live_••••••••

Docs: https://docs.seenn.io
```

### Manage API Keys

Show your API keys:

```bash
seenn keys           # Secret key masked
seenn keys --reveal  # Show full secret key
```

Regenerate API keys (invalidates current keys):

```bash
seenn keys:regenerate
```

### Logout

Remove stored credentials:

```bash
seenn logout
```

## Credentials

Credentials are stored in `~/.seenn/credentials.json` with secure file permissions (600).

## Documentation

For full documentation, visit [docs.seenn.io](https://docs.seenn.io).

## License

MIT
