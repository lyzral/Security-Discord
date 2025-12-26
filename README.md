
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

Edit `config.js`:

```js
module.exports = {
  token: "YOUR_BOT_TOKEN",
  clientId: "YOUR_CLIENT_ID",
  guildId: "YOUR_GUILD_ID",

  verifiedRole: "ROLE_ID_AFTER_VERIFICATION",
  unverifiedRole: "ROLE_ID_BEFORE_VERIFICATION",

  owners: ["YOUR_USER_ID"]
};
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
