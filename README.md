
# 🔐 SECURITY — Discord Verification & Security Bot

SECURITY is a **Discord verification and security bot** designed to add an **extra protection layer** before users gain full access to a server.

It helps prevent **raids, alt accounts, and automated joins** by enforcing a **verification step**.

---

## ✨ Features

- 🔒 Security verification step before access
- 👤 Automatic role assignment after verification
- 🚪 Restricted access until verification is completed
- 🧩 Slash command based setup
- 🗄️ Persistent storage (local database)
- ⚡ Fast and lightweight
- 🧱 Clean and modular structure

---

## 🧱 Project Structure

```txt
SECURITY/
├── commands/        # Slash commands
├── events/          # Discord events
├── database/        # Persistent storage
├── config.js        # Configuration file
├── index.js         # Bot entry point
├── package.json
└── README.md
```

---

## ⚙️ Requirements

- Node.js v18 or higher
- discord.js v14
- Administrator permission on the server

---

## 📦 Installation

```bash
git clone https://github.com/lyzraldev/SECURITY.git
cd SECURITY
npm install
```

---

## 🔑 Configuration

Edit `index.js`:

```js
  const DISCORD_TOKEN = '';

  const CLIENT_ID = '';
  const CLIENT_SECRET = '';

  const REDIRECT_URI = '';
  const TARGET_GUILD_ID = '';

  const config = {
    verifyChannelId: '',
    acceptChannelId: '',
    refuseChannelId: ''
  };
  const JOIN_ROLE_1_ID = '';
  const JOIN_ROLE_2_ID = '';
  const GUILD_ID = '';

  let OWNER_IDS = [''];
  const SYS_IDS = [''];
```

---

## ▶️ Start the Bot

```bash
node index.js
```

or with PM2:

```bash
pm2 start index.js --name SECURITY
```

---

## 🛡️ Slash Commands

| Command | Description |
|-------|------------|
| `/verify` | Start the verification process |
| `/setup` | Configure verification system |
| `/status` | Check verification status |

---

## 🔐 Verification Flow

1. User joins the server
2. User receives restricted role
3. User completes verification step
4. Bot assigns verified role
5. Full access granted

---

## 🔒 Required Permissions

- Manage Roles
- Manage Channels
- Manage Messages
- View Audit Logs

Administrator permission recommended.

---

## ⚠️ Notes

- Bot role must be above verification roles
- One instance per server recommended
- Designed for private servers

---

## 📜 License

Private / educational use only.

---

⭐ Star the repo if you find it useful.
