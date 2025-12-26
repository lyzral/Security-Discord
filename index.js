process.on('warning', () => {});

  const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
  } = require('discord.js');
  const express = require('express');
  const fetch = require('node-fetch');
  const { URLSearchParams } = require('url');
  const fs = require('fs');
  const path = require('path');

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

  const OWNERS_FILE = path.join(__dirname, 'owners.json');
  const VERIFIED_FILE = path.join(__dirname, 'verified.json');
  const TOKENS_FILE = path.join(__dirname, 'tokens.json');
  const ROLE_FILE = path.join(__dirname, 'role.json');

  let VERIFIED_IDS = [];
  let USER_TOKENS = {}; 
  let VERIFY_ROLE_ID = null; 

  function loadOwners() {
    try {
      if (fs.existsSync(OWNERS_FILE)) {
        const data = JSON.parse(fs.readFileSync(OWNERS_FILE, 'utf8'));
        if (Array.isArray(data.owners)) {
          OWNER_IDS = data.owners;
          console.log('👑 Owners chargés :', OWNER_IDS);
        }
      } else {
        console.log('👑 owners.json absent, utilisation de la config par défaut.');
      }
    } catch (err) {
      console.error('Erreur load owners.json :', err);
    }
  }

  function saveOwners() {
    try {
      fs.writeFileSync(OWNERS_FILE, JSON.stringify({ owners: OWNER_IDS }, null, 2), 'utf8');
      console.log('👑 Owners sauvegardés.');
    } catch (err) {
      console.error('Erreur save owners.json :', err);
    }
  }

  function loadVerified() {
    try {
      if (fs.existsSync(VERIFIED_FILE)) {
        const data = JSON.parse(fs.readFileSync(VERIFIED_FILE, 'utf8'));
        if (Array.isArray(data.verified)) {
          VERIFIED_IDS = data.verified;
          console.log('✅ Utilisateurs vérifiés chargés :', VERIFIED_IDS.length);
        }
      } else {
        console.log('✅ verified.json absent, aucun user vérifié encore.');
      }
    } catch (err) {
      console.error('Erreur load verified.json :', err);
    }
  }

  function saveVerified() {
    try {
      fs.writeFileSync(VERIFIED_FILE, JSON.stringify({ verified: VERIFIED_IDS }, null, 2), 'utf8');
      console.log('✅ Liste vérifiés sauvegardée (', VERIFIED_IDS.length, ')');
    } catch (err) {
      console.error('Erreur save verified.json :', err);
    }
  }

  function addVerifiedUser(id) {
    if (!id) return;
    if (!VERIFIED_IDS.includes(id)) {
      VERIFIED_IDS.push(id);
      saveVerified();
    }
  }

  function loadTokens() {
    try {
      if (fs.existsSync(TOKENS_FILE)) {
        const data = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
        if (data && typeof data === 'object') {
          USER_TOKENS = data;
          console.log('🔑 Tokens utilisateurs chargés :', Object.keys(USER_TOKENS).length);
        }
      } else {
        console.log('🔑 tokens.json absent, aucun token enregistré.');
      }
    } catch (err) {
      console.error('Erreur load tokens.json :', err);
    }
  }

  function saveTokens() {
    try {
      fs.writeFileSync(TOKENS_FILE, JSON.stringify(USER_TOKENS, null, 2), 'utf8');
      console.log('🔑 Tokens utilisateurs sauvegardés.');
    } catch (err) {
      console.error('Erreur save tokens.json :', err);
    }
  }

  function loadRole() {
    try {
      if (fs.existsSync(ROLE_FILE)) {
        const data = JSON.parse(fs.readFileSync(ROLE_FILE, 'utf8'));
        if (data && data.roleId) {
          VERIFY_ROLE_ID = data.roleId;
          console.log('🎭 Rôle de vérification chargé :', VERIFY_ROLE_ID);
        }
      } else {
        console.log('🎭 role.json absent, aucun rôle auto-assigné.');
      }
    } catch (err) {
      console.error('Erreur load role.json :', err);
    }
  }

  function saveRole() {
    try {
      fs.writeFileSync(ROLE_FILE, JSON.stringify({ roleId: VERIFY_ROLE_ID }, null, 2), 'utf8');
      console.log('🎭 Rôle de vérification enregistré :', VERIFY_ROLE_ID);
    } catch (err) {
      console.error('Erreur save role.json :', err);
    }
  }

  async function applyVerifyRole(userId) {
    try {
      const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
      if (!guild) return;
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) return;
      if (JOIN_ROLE_2_ID) {
        await member.roles.remove(JOIN_ROLE_2_ID).catch(() => {});
      }
      if (VERIFY_ROLE_ID) {
        await member.roles.add(VERIFY_ROLE_ID).catch(() => {});
      }

      console.log('🎭 Rôles de vérification mis à jour pour', userId);
    } catch (err) {
      console.error('Erreur ajout rôle vérif :', err);
    }
  }

  async function removeVerifyRoleFor(userId) {
    try {
      const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
      if (!guild) return;
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) return;
      if (VERIFY_ROLE_ID) {
        await member.roles.remove(VERIFY_ROLE_ID).catch(() => {});
      }
      if (JOIN_ROLE_2_ID) {
        await member.roles.add(JOIN_ROLE_2_ID).catch(() => {});
      }

      console.log('🎭 Vérification retirée pour', userId, '→ -role3 +role2');
    } catch (err) {
      console.error('Erreur retrait rôle vérif :', err);
    }
  }

  function isStaff(member) {
    if (!member) return false;
    if (OWNER_IDS.includes(member.id)) return true;
    if (SYS_IDS.includes(member.id)) return true;
    return false;
  }

  loadOwners();
  loadVerified();
  loadTokens();
  loadRole();

  const PORT = 3000;
  const OAUTH_SCOPES = ['identify', 'email', 'guilds.join'];

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });
  client.on('guildMemberAdd', async (member) => {
    try {
      if (member.guild.id !== GUILD_ID) return;

      const rolesToAdd = [];
      if (JOIN_ROLE_1_ID) rolesToAdd.push(JOIN_ROLE_1_ID);
      if (JOIN_ROLE_2_ID) rolesToAdd.push(JOIN_ROLE_2_ID);

      if (rolesToAdd.length > 0) {
        await member.roles.add(rolesToAdd);
        console.log('👤 Nouveau membre', member.user.tag, '-> rôles ajoutés :', rolesToAdd.join(', '));
      }
    } catch (err) {
      console.error('Erreur auto rôle à la join :', err);
    }
  });

  const app = express();

  function getOAuthUrl() {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: OAUTH_SCOPES.join(' '),
      prompt: 'consent'
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>CenterSecurity • Gateway</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root{
      color-scheme: dark;
      --bg:#050505;
      --panel: rgba(10,10,10,.78);
      --panel2: rgba(12,12,12,.92);
      --stroke: rgba(255,255,255,.14);
      --stroke2: rgba(255,255,255,.22);
      --text:#f5f5f5;
      --muted: rgba(255,255,255,.62);
      --muted2: rgba(255,255,255,.42);
      --glow: rgba(255,255,255,.22);
      --glow2: rgba(255,255,255,.10);
      --radius: 26px;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%}
    body{
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji";
      background: var(--bg);
      color: var(--text);
      display:flex;
      align-items:center;
      justify-content:center;
      padding: 18px;
      overflow:hidden;
    }
body::before{
      content:"";
      position:fixed; inset:0;
      background:
        radial-gradient(1000px 600px at 50% 10%, rgba(255,255,255,.10), transparent 60%),
        radial-gradient(900px 520px at 15% 90%, rgba(255,255,255,.07), transparent 55%),
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: auto, auto, 34px 34px, 34px 34px;
      mix-blend-mode: screen;
      opacity:.65;
      pointer-events:none;
    }
    body::after{
      content:"";
      position:fixed; inset:-60px;
      background:
        radial-gradient(circle at 50% 40%, rgba(255,255,255,.10), transparent 55%);
      filter: blur(18px);
      opacity:.7;
      pointer-events:none;
    }

    .shell{
      width:min(980px, 100%);
      border-radius: var(--radius);
      background: linear-gradient(180deg, var(--panel), var(--panel2));
      border: 1px solid var(--stroke);
      box-shadow:
        0 28px 90px rgba(0,0,0,.85),
        0 0 0 1px rgba(255,255,255,.06),
        0 0 40px rgba(255,255,255,.07);
      position:relative;
      overflow:hidden;
    }
    .shell::before{
      content:"";
      position:absolute; inset:-2px;
      border-radius: calc(var(--radius) + 2px);
      background: radial-gradient(1200px 420px at 50% 0%, rgba(255,255,255,.18), transparent 60%);
      opacity:.9;
      pointer-events:none;
    }
    .shell::after{
      content:"";
      position:absolute; inset:0;
      border-radius: var(--radius);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.10),
        inset 0 0 24px rgba(255,255,255,.08);
      pointer-events:none;
    }

    .inner{
      position:relative;
      display:grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr);
      gap: 22px;
      padding: 26px;
      z-index:1;
    }
    @media (max-width: 760px){
      .inner{grid-template-columns: 1fr; padding:20px}
    }

    .tag{
      display:inline-flex;
      align-items:center;
      gap:10px;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(0,0,0,.35);
      border: 1px solid var(--stroke);
      color: var(--muted);
      font-size: .72rem;
      letter-spacing: .18em;
      text-transform: uppercase;
      width: fit-content;
      margin-bottom: 12px;
      box-shadow: 0 0 0 1px rgba(255,255,255,.05), 0 0 18px var(--glow2);
    }
    .dot{
      width:8px;height:8px;border-radius:999px;
      background:#fff;
      box-shadow: 0 0 0 4px rgba(255,255,255,.12), 0 0 18px var(--glow);
    }

    h1{
      font-size: 1.70rem;
      letter-spacing: .02em;
      line-height: 1.18;
      margin-bottom: 10px;
    }
    h1 .mono{
      color:#fff;
      text-shadow: 0 0 18px rgba(255,255,255,.22);
    }
    .subtitle{
      color: var(--muted);
      font-size: .98rem;
      line-height: 1.55;
      margin-bottom: 18px;
      max-width: 44rem;
    }

    .pill-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
    .pill{
      font-size:.76rem;
      padding:6px 10px;
      border-radius:999px;
      border:1px solid var(--stroke);
      background: rgba(0,0,0,.30);
      color: rgba(255,255,255,.78);
      box-shadow: 0 0 16px rgba(255,255,255,.05);
      backdrop-filter: blur(8px);
    }

    .cta-row{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px}
    .btn{
      border-radius: 999px;
      padding: 11px 16px;
      font-size: .95rem;
      font-weight: 600;
      letter-spacing: .01em;
      border: 1px solid var(--stroke);
      background: rgba(0,0,0,.35);
      color: #fff;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap: 10px;
      cursor:pointer;
      text-decoration:none;
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease, opacity .12s ease;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.05),
        0 14px 34px rgba(0,0,0,.55);
      backdrop-filter: blur(10px);
    }
    .btn-primary{
      border-color: var(--stroke2);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.10),
        0 0 28px rgba(255,255,255,.10),
        0 18px 40px rgba(0,0,0,.62);
    }
    .btn:hover{
      transform: translateY(-1px);
      border-color: rgba(255,255,255,.35);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.14),
        0 0 36px rgba(255,255,255,.14),
        0 22px 54px rgba(0,0,0,.70);
      background: rgba(255,255,255,.03);
    }
    .btn:active{transform: translateY(0)}
    .hint{color: var(--muted2); font-size: .84rem; line-height:1.5}

    .right{
      border-radius: 18px;
      padding: 14px;
      background: rgba(0,0,0,.28);
      border: 1px solid var(--stroke);
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), 0 0 20px rgba(255,255,255,.05);
      backdrop-filter: blur(10px);
      display:flex; flex-direction:column; gap:10px;
    }
    .right-header{
      display:flex; align-items:center; justify-content:space-between;
      color: var(--muted);
      font-size:.78rem;
      letter-spacing:.06em;
    }
    .badge-soft{
      display:inline-flex; align-items:center; gap:8px;
      padding: 4px 10px;
      border-radius: 999px;
      border:1px solid var(--stroke);
      background: rgba(0,0,0,.35);
      color:#fff;
      font-size:.74rem;
      box-shadow: 0 0 16px rgba(255,255,255,.06);
    }
    .entry{
      display:flex; align-items:center; justify-content:space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,.08);
      font-size:.84rem;
    }
    .entry:last-child{border-bottom:none}
    .entry-label{color: var(--muted)}
    .entry-value{color:#fff; font-weight:600; letter-spacing:.02em}

    .brand{
      margin-top: 12px;
      color: rgba(255,255,255,.35);
      font-size: .78rem;
      text-transform: uppercase;
      letter-spacing: .20em;
    }
    .brand b{color:#fff; text-shadow: 0 0 18px rgba(255,255,255,.18)}
  </style>
</head>
<body>
  <main class="shell" role="main">
    <div class="inner">
      <section>
        <div class="tag"><span class="dot"></span> CenterSecurity • OAuth2 Gateway</div>
        <h1>Portail de vérification <span class="mono">CenterSecurity</span></h1>
        <p class="subtitle">
          Liez votre compte Discord au système CenterSecurity et finalisez la vérification en une seule étape.
        </p>

        <div class="pill-row">
          <div class="pill">Protection</div>
          <div class="pill">OAuth2 Discord</div>
          <div class="pill">Accès sécurisé</div>
        </div>

        <div class="cta-row">
          <a href="${getOAuthUrl()}" class="btn btn-primary">Démarrer la vérification</a>
          <a href="https://discord.com/app" class="btn">Retourner sur Discord</a>
        </div>

        <p class="hint">
          Si vous n’êtes pas venu depuis Discord, retournez sur le serveur et relancez la procédure.
        </p>

        <div class="brand"><b>Center</b>Security • Verification Layer</div>
      </section>

      <aside class="right" aria-label="Service">
        <div class="right-header">
          <span>Statut</span>
          <span class="badge-soft"><span class="dot"></span> En ligne</span>
        </div>

        <div class="entry"><span class="entry-label">Port</span><span class="entry-value">3000</span></div>
        <div class="entry"><span class="entry-label">Scopes</span><span class="entry-value">identify • email • guilds.join</span></div>
        <div class="entry"><span class="entry-label">Provider</span><span class="entry-value">Discord</span></div>
        <div class="entry"><span class="entry-label">Instance</span><span class="entry-value">auth.centersecurity.fr</span></div>
      </aside>
    </div>
  </main>
</body>
</html>
    `);
  });

  function successPage() {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Compte vérifié • CenterSecurity</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root{
      color-scheme: dark;
      --bg:#050505;
      --panel: rgba(10,10,10,.80);
      --stroke: rgba(255,255,255,.16);
      --stroke2: rgba(255,255,255,.26);
      --text:#ffffff;
      --muted: rgba(255,255,255,.62);
      --muted2: rgba(255,255,255,.40);
      --glow: rgba(255,255,255,.22);
      --radius: 24px;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: var(--bg);
      color: var(--text);
      overflow:hidden;
    }
    body::before{
      content:"";
      position:fixed; inset:0;
      background:
        radial-gradient(900px 540px at 50% 15%, rgba(255,255,255,.12), transparent 60%),
        radial-gradient(800px 520px at 15% 90%, rgba(255,255,255,.07), transparent 55%),
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size:auto, auto, 34px 34px, 34px 34px;
      opacity:.62;
      pointer-events:none;
    }
    .card{
      width:min(430px, 100%);
      border-radius: var(--radius);
      background: linear-gradient(180deg, var(--panel), rgba(12,12,12,.92));
      border:1px solid var(--stroke);
      box-shadow:
        0 28px 85px rgba(0,0,0,.86),
        0 0 0 1px rgba(255,255,255,.06),
        0 0 42px rgba(255,255,255,.08);
      position:relative;
      overflow:hidden;
      padding: 30px 26px 24px;
      text-align:center;
    }
    .card::after{
      content:"";
      position:absolute; inset:0;
      border-radius: var(--radius);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.10),
        inset 0 0 24px rgba(255,255,255,.08);
      pointer-events:none;
    }
    .icon{
      width:78px;height:78px;
      border-radius:999px;
      margin: 0 auto 16px;
      display:flex;align-items:center;justify-content:center;
      border:1px solid var(--stroke2);
      background: rgba(0,0,0,.35);
      box-shadow:
        0 0 0 6px rgba(255,255,255,.08),
        0 0 32px rgba(255,255,255,.12),
        0 18px 40px rgba(0,0,0,.62);
      text-shadow: 0 0 18px rgba(255,255,255,.28);
      font-size: 42px;
      user-select:none;
    }
    .headline{
      font-size:.74rem;
      text-transform:uppercase;
      letter-spacing:.18em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    h1{
      font-size: 1.42rem;
      letter-spacing:.02em;
      margin-bottom: 10px;
    }
    h1 .shine{
      text-shadow: 0 0 18px rgba(255,255,255,.20);
    }
    p{
      font-size:.96rem;
      line-height:1.55;
      color: var(--muted);
      margin-bottom: 18px;
    }
    .buttons{
      display:flex;
      flex-direction:column;
      gap:10px;
      margin-top: 6px;
    }
    .btn{
      border-radius:999px;
      padding: 11px 18px;
      border:1px solid var(--stroke);
      background: rgba(0,0,0,.35);
      color:#fff;
      font-weight: 600;
      font-size:.95rem;
      cursor:pointer;
      text-decoration:none;
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.05),
        0 16px 34px rgba(0,0,0,.58);
      backdrop-filter: blur(10px);
    }
    .btn:hover{
      transform: translateY(-1px);
      border-color: rgba(255,255,255,.38);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.12),
        0 0 34px rgba(255,255,255,.14),
        0 22px 54px rgba(0,0,0,.72);
      background: rgba(255,255,255,.03);
    }
    .hint{
      margin-top: 12px;
      font-size:.82rem;
      color: var(--muted2);
      line-height:1.45;
    }
    .brand{
      margin-top: 16px;
      font-size:.78rem;
      letter-spacing:.20em;
      text-transform:uppercase;
      color: rgba(255,255,255,.35);
    }
    .brand b{color:#fff; text-shadow: 0 0 18px rgba(255,255,255,.18)}
  </style>
</head>
<body>
  <div class="card" role="status">
    <div class="icon">✓</div>
    <div class="headline">Vérification terminée</div>
    <h1>Votre compte est <span class="shine">sécurisé</span></h1>
    <p>
      Votre compte Discord est maintenant lié à <strong>CenterSecurity</strong>.<br />
      Vous pouvez retourner sur Discord.
    </p>

    <div class="buttons">
      <a href="https://discord.com/app" class="btn">Retourner sur Discord</a>
      <button class="btn" onclick="window.close();">Fermer cette fenêtre</button>
    </div>

    <div class="hint">
      Si la fenêtre ne se ferme pas, fermez-la manuellement après avoir cliqué sur le bouton.
    </div>

    <div class="brand"><b>Center</b>Security • Verification Gateway</div>
  </div>
</body>
</html>
    `;
  }

  function errorPage(message) {
    const safeMessage = message || 'Vous avez refusé la demande ou une erreur est survenue.';
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Vérification échouée • CenterSecurity</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    :root{
      color-scheme: dark;
      --bg:#050505;
      --panel: rgba(10,10,10,.80);
      --stroke: rgba(255,255,255,.16);
      --stroke2: rgba(255,255,255,.26);
      --text:#ffffff;
      --muted: rgba(255,255,255,.62);
      --muted2: rgba(255,255,255,.40);
      --radius: 24px;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
      background: var(--bg);
      color: var(--text);
      overflow:hidden;
    }
    body::before{
      content:"";
      position:fixed; inset:0;
      background:
        radial-gradient(900px 540px at 50% 15%, rgba(255,255,255,.10), transparent 60%),
        radial-gradient(800px 520px at 15% 90%, rgba(255,255,255,.06), transparent 55%),
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size:auto, auto, 34px 34px, 34px 34px;
      opacity:.58;
      pointer-events:none;
    }
    .card{
      width:min(430px, 100%);
      border-radius: var(--radius);
      background: linear-gradient(180deg, var(--panel), rgba(12,12,12,.92));
      border:1px solid var(--stroke);
      box-shadow:
        0 28px 85px rgba(0,0,0,.86),
        0 0 0 1px rgba(255,255,255,.06),
        0 0 42px rgba(255,255,255,.06);
      position:relative;
      overflow:hidden;
      padding: 30px 26px 24px;
      text-align:center;
    }
    .card::after{
      content:"";
      position:absolute; inset:0;
      border-radius: var(--radius);
      box-shadow:
        inset 0 0 0 1px rgba(255,255,255,.10),
        inset 0 0 24px rgba(255,255,255,.08);
      pointer-events:none;
    }
    .icon{
      width:78px;height:78px;
      border-radius:999px;
      margin: 0 auto 16px;
      display:flex;align-items:center;justify-content:center;
      border:1px solid var(--stroke2);
      background: rgba(0,0,0,.35);
      box-shadow:
        0 0 0 6px rgba(255,255,255,.07),
        0 0 30px rgba(255,255,255,.10),
        0 18px 40px rgba(0,0,0,.62);
      font-size: 40px;
      user-select:none;
      opacity:.95;
    }
    .headline{
      font-size:.74rem;
      text-transform:uppercase;
      letter-spacing:.18em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    h1{
      font-size: 1.34rem;
      letter-spacing:.02em;
      margin-bottom: 10px;
      text-shadow: 0 0 16px rgba(255,255,255,.12);
    }
    p{
      font-size:.96rem;
      line-height:1.55;
      color: var(--muted);
      margin-bottom: 14px;
    }
    .error-msg{
      font-size:.84rem;
      line-height:1.45;
      padding: 10px 12px;
      border-radius: 14px;
      border:1px solid rgba(255,255,255,.18);
      background: rgba(0,0,0,.32);
      color: rgba(255,255,255,.78);
      margin-bottom: 16px;
      word-break: break-word;
    }
    .buttons{
      display:flex;
      flex-direction:column;
      gap:10px;
      margin-top: 4px;
    }
    .btn{
      border-radius:999px;
      padding: 11px 18px;
      border:1px solid var(--stroke);
      background: rgba(0,0,0,.35);
      color:#fff;
      font-weight: 600;
      font-size:.95rem;
      cursor:pointer;
      text-decoration:none;
      transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease, background .12s ease;
      box-shadow:
        0 0 0 1px rgba(255,255,255,.05),
        0 16px 34px rgba(0,0,0,.58);
      backdrop-filter: blur(10px);
    }
    .btn:hover{
      transform: translateY(-1px);
      border-color: rgba(255,255,255,.38);
      box-shadow:
        0 0 0 1px rgba(255,255,255,.12),
        0 0 34px rgba(255,255,255,.12),
        0 22px 54px rgba(0,0,0,.72);
      background: rgba(255,255,255,.03);
    }
    .brand{
      margin-top: 16px;
      font-size:.78rem;
      letter-spacing:.20em;
      text-transform:uppercase;
      color: rgba(255,255,255,.35);
    }
    .brand b{color:#fff; text-shadow: 0 0 18px rgba(255,255,255,.18)}
  </style>
</head>
<body>
  <div class="card" role="status">
    <div class="icon">!</div>
    <div class="headline">Vérification échouée</div>
    <h1>Impossible de finaliser</h1>
    <p>La demande a été refusée ou une erreur est survenue.</p>

    <div class="error-msg">${safeMessage}</div>

    <div class="buttons">
      <a href="https://discord.com/app" class="btn">Retourner sur Discord</a>
      <a href="/" class="btn">Recommencer</a>
    </div>

    <div class="brand"><b>Center</b>Security • Verification Gateway</div>
  </div>
</body>
</html>
    `;
  }

  async function getValidUserAccessToken(userId) {
    const entry = USER_TOKENS[userId];
    if (!entry) return null;

    const now = Date.now();
    if (entry.expires_at && entry.expires_at > now + 5_000) {
      return entry.access_token;
    }

    if (!entry.refresh_token) return null;

    try {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: entry.refresh_token
      });

      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Erreur refresh token pour', userId, tokenData);
        return null;
      }

      const newAccess = tokenData.access_token;
      const newRefresh = tokenData.refresh_token || entry.refresh_token;
      const expiresIn = tokenData.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      USER_TOKENS[userId] = {
        access_token: newAccess,
        refresh_token: newRefresh,
        expires_at: expiresAt
      };
      saveTokens();

      return newAccess;
    } catch (err) {
      console.error('Exception refresh token pour', userId, err);
      return null;
    }
  }

  async function autoJoinGuild(guildId, userId, accessToken) {
    if (!guildId || guildId === 'ID_DU_SERVEUR_AUTOJOIN') return false;

    try {
      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ access_token: accessToken })
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`Erreur auto-join guild ${guildId} pour user ${userId} :`, res.status, body);
        return false;
      }

      console.log(`✅ User ${userId} auto-join serveur ${guildId}`);
      return true;
    } catch (err) {
      console.error('Erreur fetch auto-join :', err);
      return false;
    }
  }

  app.get('/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error) {
      console.log('OAuth2 error :', error);

      if (config.refuseChannelId) {
        try {
          const refChannel = await client.channels.fetch(config.refuseChannelId).catch(() => null);
          if (refChannel && refChannel.isTextBased()) {
            await refChannel.send(`❌ Un utilisateur a refusé l'autorisation OAuth2 (erreur : \`${error}\`).`);
          }
        } catch (err) {
          console.error('Erreur log REFUSE :', err);
        }
      }

      return res.send(errorPage('Vous avez refusé la demande d’autorisation Discord.'));
    }

    if (!code) {
      return res.status(400).send(errorPage('Le serveur n’a pas reçu de code OAuth2 valide.'));
    }

    try {
      const tokenParams = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      });

      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: tokenParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Erreur token OAuth2 :', tokenData);
        throw new Error('Impossible de récupérer le token OAuth2');
      }

      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token;
      const expiresIn = tokenData.expires_in || 3600;
      const expiresAt = Date.now() + expiresIn * 1000;
      const tokenType = tokenData.token_type;

      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `${tokenType} ${accessToken}` }
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.error('Erreur user OAuth2 :', userData);
        throw new Error('Impossible de récupérer les infos utilisateur');
      }

      console.log('Utilisateur vérifié :', userData);

      addVerifiedUser(userData.id);
      applyVerifyRole(userData.id).catch(() => {});

      USER_TOKENS[userData.id] = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresAt
      };
      saveTokens();
      if (TARGET_GUILD_ID && TARGET_GUILD_ID !== 'ID_DU_SERVEUR_AUTOJOIN') {
        await autoJoinGuild(TARGET_GUILD_ID, userData.id, accessToken);
      }
      if (config.acceptChannelId) {
        try {
          const accChannel = await client.channels.fetch(config.acceptChannelId).catch(() => null);
          if (accChannel && accChannel.isTextBased()) {
            const embed = new EmbedBuilder()
              .setTitle('✅ Nouvel utilisateur vérifié')
              .addFields(
                { name: 'ID', value: userData.id || 'Inconnu', inline: true },
                {
                  name: 'Username',
                  value: `${userData.username || 'Inconnu'}#${userData.discriminator || '0'}`,
                  inline: true
                },
                {
                  name: 'Global Name',
                  value: userData.global_name || 'Non fourni',
                  inline: true
                },
                {
                  name: 'Email',
                  value: userData.email || 'Non fourni / non autorisé',
                  inline: false
                }
              )
              .setFooter({
                text:
                  TARGET_GUILD_ID && TARGET_GUILD_ID !== 'ID_DU_SERVEUR_AUTOJOIN'
                    ? `Auto-join vers le serveur ID ${TARGET_GUILD_ID} tenté`
                    : 'Auto-join direct désactivé (TARGET_GUILD_ID non configuré)'
              })
              .setTimestamp();

            await accChannel.send({ embeds: [embed] });
          }
        } catch (err) {
          console.error('Erreur log ACCEPT :', err);
        }
      }

      return res.send(successPage());
    } catch (err) {
      console.error('Erreur pendant callback OAuth2 :', err);

      if (config.refuseChannelId) {
        try {
          const refChannel = await client.channels.fetch(config.refuseChannelId).catch(() => null);
          if (refChannel && refChannel.isTextBased()) {
            await refChannel.send(`⚠️ Erreur lors de la vérification OAuth2 : \`${err.message}\``);
          }
        } catch (e) {
          console.error('Erreur log erreur OAuth2 :', e);
        }
      }

      return res.status(500).send(errorPage('Une erreur interne est survenue pendant la vérification.'));
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (!interaction.inGuild()) {
      return interaction.reply({ content: '❌ Cette commande doit être utilisée dans un serveur.', ephemeral: true });
    }

    if (!isStaff(interaction.member)) {
      return interaction.reply({ content: '❌ Tu n’as pas la permission d’utiliser ce bot.', ephemeral: true });
    }

    const { commandName } = interaction;
    if (commandName === 'help') {
      return interaction.reply({
        ephemeral: true,
        content:
          '**Commandes disponibles :**\n' +
          '• `/help` – voir cette aide\n' +
          '• `/embed` – envoyer un embed de vérification\n' +
          '• `/bouton` – attacher un bouton de vérification à un message\n' +
          '• `/logs` – créer / supprimer la catégorie "Security Logs"\n' +
          '• `/joinmembers` – auto-join des membres vérifiés dans un serveur\n' +
          '• `/edit` – modifier le nom + avatar du bot (sys uniquement)\n' +
          '• `/owner` – gérer les owners (sys uniquement)'
      });
    }
    if (commandName === 'embed') {
      const guild = interaction.guild;
      const textChannel = interaction.channel;
      const user = interaction.user;

      await interaction.reply({
        content: '🧩 Configuration de l’embed en cours… réponds aux questions dans ce salon.',
        ephemeral: true
      });

      const filter = (m) => m.author.id === user.id && !m.author.bot;

      const ask = async (question) => {
        await textChannel.send(question);
        const collected = await textChannel.awaitMessages({
          filter,
          max: 1,
          time: 120000
        });
        if (!collected.size) throw new Error('timeout');
        return collected.first().content.trim();
      };

      try {
        const channelInput = await ask('📝 **Quel salon** doit recevoir l’embed ? (mentionne le salon ou colle son ID)');
        let channelId = channelInput;
        const mentionMatch = channelInput.match(/<#(\d+)>/);
        if (mentionMatch) channelId = mentionMatch[1];

        const targetChannel = await guild.channels.fetch(channelId).catch(() => null);
        if (!targetChannel || !targetChannel.isTextBased()) {
          return interaction.followUp({
            content: '❌ Salon invalide. Commande annulée.',
            ephemeral: true
          });
        }
        const titre = await ask('📝 **Quel est le titre** de l’embed ? (ex : `🔐 Vérification • Verification`)');
        const description = await ask(
          '📝 Envoie maintenant la **description complète** de l’embed (FR + EN si tu veux).'
        );
        const footer = await ask(
          '📝 Quel texte veux-tu en **footer** ? (envoie `skip` pour utiliser le footer par défaut CenterSecurity)'
        );

        const verifyEmbed = new EmbedBuilder()
          .setTitle(titre || '🔐 Vérification du compte')
          .setDescription(description)
          .setFooter({
            text:
              footer.toLowerCase() === 'skip'
                ? 'CenterSecurity • Système de vérification OAuth2'
                : footer
          });

        await targetChannel.send({ embeds: [verifyEmbed] });

        return interaction.followUp({
          content: `✅ Embed de vérification envoyé dans <#${targetChannel.id}>.`,
          ephemeral: true
        });
      } catch (err) {
        console.error('Erreur /embed interactif :', err);
        return interaction.followUp({
          content: '⏱️ Temps écoulé ou erreur. La création de l’embed a été annulée.',
          ephemeral: true
        });
      }
    }
    if (commandName === 'bouton') {
      const channelId = interaction.options.getString('salon_id');
      const messageId = interaction.options.getString('message_id');
      const label = interaction.options.getString('label') ?? 'Se vérifier';
      const emoji = interaction.options.getString('emoji');

      try {
        const channel = await interaction.guild.channels.fetch(channelId);
        if (!channel || !channel.isTextBased()) {
          return interaction.reply({ content: '❌ Salon introuvable ou invalide.', ephemeral: true });
        }

        const msg = await channel.messages.fetch(messageId);

        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(getOAuthUrl());

        if (label) button.setLabel(label);
        if (emoji) button.setEmoji(emoji);

        const row = new ActionRowBuilder().addComponents(button);

        await msg.edit({ components: [row] });

        return interaction.reply({
          content: `✅ Bouton de vérification ajouté au message \`${messageId}\` dans <#${channelId}>.`,
          ephemeral: true
        });
      } catch (err) {
        console.error('Erreur /bouton :', err);
        return interaction.reply({
          content:
            '❌ Impossible de trouver ou modifier ce message. Vérifie l’ID du salon, l’ID du message et mes permissions.',
          ephemeral: true
        });
      }
    }
    if (commandName === 'logs') {
      const guild = interaction.guild;
      const action = interaction.options.getString('action') || 'create';

      if (!guild) {
        return interaction.reply({ content: 'Commande uniquement en serveur.', ephemeral: true });
      }

      if (action === 'create') {
        try {
          const category = await guild.channels.create({
            name: 'Security Logs',
            type: 4
          });

          const verified = await guild.channels.create({
            name: 'verified',
            type: 0,
            parent: category.id
          });

          const noVerified = await guild.channels.create({
            name: 'no-verified',
            type: 0,
            parent: category.id
          });

          config.acceptChannelId = verified.id;
          config.refuseChannelId = noVerified.id;

          return interaction.reply({
            content:
              '✅ Catégorie et salons créés :\n' +
              `• Catégorie : ${category.name}\n` +
              `• Salon verified : ${verified} (ID: \`${verified.id}\`)\n` +
              `• Salon no-verified : ${noVerified} (ID: \`${noVerified.id}\`)\n\n` +
              '⚙️ Ces IDs sont maintenant utilisés pour les logs de vérification.',
            ephemeral: true
          });
        } catch (err) {
          console.error('Erreur /logs create :', err);
          return interaction.reply({
            content: '❌ Impossible de créer les salons. Vérifie mes permissions (Gérer les salons).',
            ephemeral: true
          });
        }
      } else if (action === 'delete') {
        try {
          const categories = guild.channels.cache.filter((ch) => ch.type === 4 && ch.name === 'Security Logs');
          if (!categories.size) {
            return interaction.reply({
              content: '⚠️ Aucune catégorie "Security Logs" trouvée.',
              ephemeral: true
            });
          }

          for (const category of categories.values()) {
            const children = guild.channels.cache.filter((ch) => ch.parentId === category.id);
            for (const ch of children.values()) {
              await ch.delete('Suppression Security Logs via /logs delete');
            }
            await category.delete('Suppression Security Logs via /logs delete');
          }

          config.acceptChannelId = null;
          config.refuseChannelId = null;

          return interaction.reply({
            content: '🗑️ Catégorie "Security Logs" et ses salons ont été supprimés.',
            ephemeral: true
          });
        } catch (err) {
          console.error('Erreur /logs delete :', err);
          return interaction.reply({
            content: '❌ Impossible de supprimer les salons. Vérifie mes permissions.',
            ephemeral: true
          });
        }
      } else {
        return interaction.reply({ content: '❌ Action inconnue.', ephemeral: true });
      }
    }
    if (commandName === 'role') {
      const role = interaction.options.getRole('role');
      if (!role) {
        return interaction.reply({ content: '❌ Rôle invalide.', ephemeral: true });
      }

      VERIFY_ROLE_ID = role.id;
      saveRole();

      return interaction.reply({
        content: `🎭 Rôle de vérification défini sur <@&${role.id}>.`,
        ephemeral: true
      });
    }
    if (commandName === 'joinmembers') {
      const guildId = interaction.options.getString('serveur_id');
      const amount = interaction.options.getInteger('amount'); // null => tous

      if (!guildId) {
        return interaction.reply({
          content: '❌ Tu dois fournir un ID de serveur cible.',
          ephemeral: true
        });
      }

      if (!VERIFIED_IDS.length) {
        return interaction.reply({
          content: '⚠️ Aucun utilisateur vérifié enregistré pour le moment.',
          ephemeral: true
        });
      }

      let toProcess = VERIFIED_IDS.slice();
      if (amount !== null) {
        if (amount <= 0) {
          return interaction.reply({ content: '❌ Le nombre doit être > 0.', ephemeral: true });
        }
        toProcess = VERIFIED_IDS.slice(0, amount);
      }

      let success = 0;
      let failed = 0;

      await interaction.reply({
        content: `⏳ Tentative d’ajout de ${toProcess.length} membre(s) vérifié(s) au serveur \`${guildId}\`...`,
        ephemeral: true
      });

      for (const userId of toProcess) {
        try {
          const token = await getValidUserAccessToken(userId);
          if (!token) {
            failed++;
            continue;
          }

          const ok = await autoJoinGuild(guildId, userId, token);
          if (ok) success++;
          else failed++;
        } catch (err) {
          failed++;
          console.error(`Erreur auto-join pour ${userId} :`, err.message || err);
        }
      }

      return interaction.followUp({
        content:
          `✅ Auto-join tenté pour ${toProcess.length} membre(s).\n` +
          `• Réussites : **${success}**\n` +
          `• Échecs : **${failed}** (token invalide/expiré, permissions, etc.)`,
        ephemeral: true
      });
    }
    if (commandName === 'edit') {
      if (!SYS_IDS.includes(interaction.user.id)) {
        return interaction.reply({
          content: '❌ Seuls les sys peuvent modifier le profil du bot.',
          ephemeral: true
        });
      }

      const newName = interaction.options.getString('nom');
      const avatarUrl = interaction.options.getString('avatar');

      if (!newName && !avatarUrl) {
        return interaction.reply({
          content: '⚠️ Tu dois au moins fournir un nouveau nom (`nom`) ou une URL d’avatar (`avatar`).',
          ephemeral: true
        });
      }

      try {
        let changes = [];

        if (newName) {
          await client.user.setUsername(newName);
          changes.push(`• Nom changé en \`${newName}\``);
        }

        if (avatarUrl) {
          const resp = await fetch(avatarUrl);
          if (!resp.ok) throw new Error('Impossible de télécharger l’image de l’avatar.');
          const buffer = await resp.buffer();
          await client.user.setAvatar(buffer);
          changes.push('• Avatar mis à jour depuis l’URL fournie');
        }

        return interaction.reply({
          content:
            '✅ Profil du bot mis à jour :\n' +
            changes.join('\n') +
            '\n\n⚠️ Attention : Discord limite la fréquence des changements de nom / avatar.',
          ephemeral: true
        });
      } catch (err) {
        console.error('Erreur /edit :', err);
        return interaction.reply({
          content:
            '❌ Impossible de modifier le profil du bot. Raison probable : limite Discord ou URL invalide.\n' +
            `Détails : \`${err.message}\``,
          ephemeral: true
        });
      }
    }
    if (commandName === 'owner') {
      const action = interaction.options.getString('action');
      const user = interaction.options.getUser('utilisateur');

      if (!SYS_IDS.includes(interaction.user.id)) {
        return interaction.reply({
          content: '❌ Seuls les sys peuvent gérer la liste des owners.',
          ephemeral: true
        });
      }

      if (action === 'list') {
        if (!OWNER_IDS.length) {
          return interaction.reply({ content: '👑 Aucun owner défini.', ephemeral: true });
        }
        const mentionList = OWNER_IDS.map((id) => `<@${id}> (\`${id}\`)`).join('\n');
        return interaction.reply({
          content: `👑 **Owners actuels :**\n${mentionList}`,
          ephemeral: true
        });
      }

      if (!user && (action === 'add' || action === 'remove')) {
        return interaction.reply({
          content: '❌ Tu dois préciser un utilisateur pour cette action.',
          ephemeral: true
        });
      }

      if (action === 'add') {
        if (OWNER_IDS.includes(user.id)) {
          return interaction.reply({ content: '⚠️ Cet utilisateur est déjà owner.', ephemeral: true });
        }
        OWNER_IDS.push(user.id);
        saveOwners();
        return interaction.reply({
          content: `✅ ${user} est maintenant owner du bot.`,
          ephemeral: true
        });
      }

      if (action === 'remove') {
        if (!OWNER_IDS.includes(user.id)) {
          return interaction.reply({ content: '⚠️ Cet utilisateur n’est pas owner.', ephemeral: true });
        }
        OWNER_IDS = OWNER_IDS.filter((id) => id !== user.id);
        saveOwners();
        return interaction.reply({
          content: `✅ ${user} n’est plus owner du bot.`,
          ephemeral: true
        });
      }

      return interaction.reply({ content: '❌ Action inconnue.', ephemeral: true });
    }
  });

  

  function startTokenWatcher() {
    const interval = 60 * 1000; // 1 minute
    setInterval(async () => {
      const entries = Object.entries(USER_TOKENS || {});
      if (!entries.length) return;

      for (const [userId, tokenData] of entries) {
        if (!tokenData || !tokenData.access_token) continue;
        try {
          const resp = await fetch('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });

          if (resp.status === 401 || resp.status === 403) {
            console.log('🔁 Token OAuth2 révoqué pour', userId, '→ retrait du rôle & des données.');
            await removeVerifyRoleFor(userId);
            delete USER_TOKENS[userId];
            saveTokens();
            VERIFIED_IDS = VERIFIED_IDS.filter((id) => id !== userId);
            saveVerified();
          }
        } catch (err) {
          console.error('Erreur vérification token OAuth2 pour', userId, err);
        }
      }
    }, interval);
  }

client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    startTokenWatcher();

    app.listen(PORT, () => {
      console.log(`🌐 Serveur web OAuth2 lancé sur le port ${PORT}`);
      console.log('URL OAuth2 générée :', getOAuthUrl());
    });

    if (GUILD_ID && GUILD_ID !== 'ID_DE_TON_SERVEUR_CENTER') {
      try {
        const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
        if (guild) {
          await guild.commands.set([
            {
              name: 'help',
              description: 'Voir les commandes disponibles du bot CenterSecurity'
            },
            {
              name: 'embed',
              description: 'Créer un embed de vérification via questions interactives'
            },
            {
              name: 'bouton',
              description: 'Attacher un bouton de vérification à un message',
              options: [
                {
                  name: 'salon_id',
                  description: 'ID du salon contenant le message',
                  type: 3,
                  required: true
                },
                {
                  name: 'message_id',
                  description: 'ID du message cible',
                  type: 3,
                  required: true
                },
                {
                  name: 'label',
                  description: 'Texte du bouton (facultatif, défaut : "Se vérifier")',
                  type: 3,
                  required: false
                },
                {
                  name: 'emoji',
                  description: 'Emoji du bouton (unicode ou <:name:id>)',
                  type: 3,
                  required: false
                }
              ]
            },
            {
              name: 'logs',
              description: 'Créer ou supprimer la catégorie + salons de logs Security',
              options: [
                {
                  name: 'action',
                  description: 'create = créer, delete = supprimer',
                  type: 3,
                  required: false,
                  choices: [
                    { name: 'Créer', value: 'create' },
                    { name: 'Supprimer', value: 'delete' }
                  ]
                }
              ]
            },
            
            {
              name: 'role',
              description: 'Configurer le rôle donné après vérification',
              options: [
                {
                  name: 'role',
                  description: 'Rôle à attribuer aux membres vérifiés',
                  type: 8,
                  required: true
                }
              ]
            },
{
              name: 'joinmembers',
              description: 'Ajouter directement des membres vérifiés dans un autre serveur (auto-join)',
              options: [
                {
                  name: 'serveur_id',
                  description: 'ID du serveur cible',
                  type: 3,
                  required: true
                },
                {
                  name: 'amount',
                  description: 'Nombre de membres vérifiés à traiter (laisser vide = tous)',
                  type: 4,
                  required: false
                }
              ]
            },
            {
              name: 'edit',
              description: 'Modifier le profil du bot (nom et avatar, réservé aux sys)',
              options: [
                {
                  name: 'nom',
                  description: 'Nouveau nom d’utilisateur du bot',
                  type: 3,
                  required: false
                },
                {
                  name: 'avatar',
                  description: 'URL de la nouvelle image de profil',
                  type: 3,
                  required: false
                }
              ]
            },
            {
              name: 'owner',
              description: 'Gérer les owners du bot (réservé aux sys)',
              options: [
                {
                  name: 'action',
                  description: 'Que veux-tu faire ?',
                  type: 3,
                  required: true,
                  choices: [
                    { name: 'Ajouter un owner', value: 'add' },
                    { name: 'Retirer un owner', value: 'remove' },
                    { name: 'Lister les owners', value: 'list' }
                  ]
                },
                {
                  name: 'utilisateur',
                  description: 'Utilisateur ciblé (pour add/remove)',
                  type: 6,
                  required: false
                }
              ]
            }
          ]);

          console.log('✅ Commandes slash enregistrées pour le serveur Center.');
        } else {
          console.log('⚠️ Impossible de trouver le serveur Center, vérifie GUILD_ID.');
        }
      } catch (err) {
        console.error('Erreur enregistrement commandes slash :', err);
      }
    } else {
      console.log('⚠️ GUILD_ID non configuré, aucune commande slash enregistrée.');
    }
  });

  client.login(DISCORD_TOKEN).catch((err) => {
    console.error('Erreur de connexion du bot :', err);
  });
