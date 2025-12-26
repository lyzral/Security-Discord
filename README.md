# 🔐 CenterSecurity — Discord OAuth2 Verification Bot

CenterSecurity is a **Discord security bot** that adds an **OAuth2 verification step** before users gain full access to a server.
It is designed to reduce **raids, alt accounts, and automated joins** by forcing members to complete a verification process.

This bot works **exclusively with slash commands** and is intended to be used by **staff members only**.

---

## ✨ Features

- 🔑 OAuth2-based verification system
- 🛡️ Extra security step before server access
- 👤 Automatic role management after verification
- 🚫 Restricted usage to staff members
- ⚡ Slash commands only (no prefix commands)
- 🧱 Single-file, lightweight architecture
- 🔒 Designed for private and secured servers

---

## 🧱 Project Structure

```txt
CenterSecurity/
├── index.js          # Main bot logic (OAuth2 & verification flow)
├── package.json      # Dependencies & scripts
├── package-lock.json
└── README.md
```

---

## ⚙️ Requirements

- Node.js v18 or higher
- discord.js v14
- A Discord application with OAuth2 enabled
- Administrator permissions on the target server

---

## 📦 Installation

```bash
git clone https://github.com/lyzraldev/CenterSecurity.git
cd CenterSecurity
npm install
```

---

## 🔑 Configuration

Before starting the bot, configure the required environment variables or values inside `index.js`:

- `DISCORD_TOKEN` — Bot token
- `CLIENT_ID` — Discord application client ID
- `CLIENT_SECRET` — OAuth2 client secret
- `GUILD_ID` — Target Discord server ID
- `VERIFIED_ROLE_ID` — Role given after verification
- `UNVERIFIED_ROLE_ID` — Role assigned before verification

⚠️ Never share your bot token or client secret.

---

## ▶️ Running the Bot

```bash
node index.js
```

Production usage (recommended):

```bash
pm2 start index.js --name CenterSecurity
```

---

## 🛡️ Slash Commands

All commands are **slash commands only** and restricted to staff members.

| Command | Description |
|-------|------------|
| `/help` | Display available commands |
| `/setup` | Initialize the security system |
| `/verify` | Start the OAuth2 verification process |
| `/status` | Check verification system status |

---

## 🔐 Verification Flow

1. User joins the server
2. User receives a restricted role
3. User completes OAuth2 verification
4. Bot validates the user
5. Verified role is assigned
6. Full server access is granted

---

## 🔒 Permissions Required

Minimum permissions:
- Manage Roles
- Manage Channels
- View Audit Logs
- Manage Messages

Administrator permission is strongly recommended.

---

## ⚠️ Important Notes

- The bot role must be **above verification roles**
- Commands are usable **only inside a server**
- Staff-only access is enforced internally
- One instance per server is recommended

---

## 📜 License

Private / educational use only.
Redistribution or resale without permission is prohibited.

---

⭐ If you use this project, consider starring the repository.
