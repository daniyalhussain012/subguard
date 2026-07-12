# Email Scanning Setup

RenewBell can scan your Gmail and Outlook inbox to automatically detect subscriptions.
Both integrations require free OAuth credentials from Google/Microsoft — your emails never leave your device or their servers.

---

## Gmail Setup

### 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **New Project** → name it "RenewBell"
3. Select the project

### 2. Enable Gmail API

1. Go to **APIs & Services → Library**
2. Search "Gmail API" → Enable it

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** → Create
3. Fill in App name: `RenewBell`, User support email, Developer email
4. Add scope: `https://www.googleapis.com/auth/gmail.readonly`
5. Add your Gmail address as a **Test user**
6. Save

### 4. Create OAuth Credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: `RenewBell`
4. Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
5. Click **Create** — copy the **Client ID** and **Client Secret**

### 5. Add to .env

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback
```

---

## Outlook / Hotmail Setup

### 1. Register an Azure App

1. Go to [portal.azure.com](https://portal.azure.com) → **Azure Active Directory → App registrations**
2. Click **New registration**
3. Name: `RenewBell`
4. Supported account types: **Personal Microsoft accounts only**
5. Redirect URI: Web → `http://localhost:3001/auth/microsoft/callback`
6. Click **Register** — copy the **Application (client) ID**

### 2. Create a Client Secret

1. Go to **Certificates & secrets → New client secret**
2. Description: `renewbell`, Expires: 24 months
3. Copy the **Value** immediately (shown only once)

### 3. Add API Permissions

1. Go to **API permissions → Add a permission → Microsoft Graph**
2. Delegated permissions: add `Mail.Read` and `User.Read`
3. Click **Grant admin consent** (or users will consent on first login)

### 4. Add to .env

```
MICROSOFT_CLIENT_ID=your_application_id_here
MICROSOFT_CLIENT_SECRET=your_client_secret_value_here
MICROSOFT_REDIRECT_URI=http://localhost:3001/auth/microsoft/callback
```

---

## Running the Email Server

```bash
# Install server dependencies first
cd server && npm install && cd ..

# Install root concurrently
npm install

# Run frontend + backend together
npm run dev:all

# Or run separately
npm run dev        # Frontend on http://localhost:5173
npm run server     # Backend on http://localhost:3001
```

The frontend will auto-detect whether the backend is running. If it's not running, Gmail/Outlook tabs will show a "server not running" message — the app still works fully without the backend.

---

## Privacy

- OAuth tokens are stored **in memory only** — they are cleared when you restart the server.
- Email content is processed locally — no data is sent to any third-party servers.
- RenewBell only reads email **metadata** (subject, sender, snippet) — it never reads full email bodies.
- Scopes requested: `gmail.readonly` (Gmail) and `Mail.Read` (Outlook) — read-only, no write access.
