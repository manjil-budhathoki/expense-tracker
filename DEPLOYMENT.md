# Deploy Paisa with Neon, Render, and Vercel

These are three services for one app: Neon stores PostgreSQL data, Render runs the FastAPI backend, and Vercel serves the React frontend. Push the tested changes to GitHub before connecting the repository to Render and Vercel. Do not commit `.env` files or database files.

## 1. Neon: database

Create a free Neon project and copy its PostgreSQL connection string from **Connect**. Keep the password private. The connection string should include `sslmode=require`. Use one database for this app. Back up data separately; the free plan is for a small project.

## 2. Render: backend

Create a **Web Service** from the GitHub repository with these settings:

| Setting | Value |
| --- | --- |
| Language | Python 3 |
| Root Directory | `backend` |
| Instance Type | Free |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT` |

Add these backend environment variables in Render:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `REGISTRATION_CODE` | A private random code with at least 16 characters |
| `CORS_ORIGINS` | The exact Vercel site origin, for example `https://paisa.vercel.app` |

Create a random registration code locally with `openssl rand -hex 24`. Share it only with people who should be able to see and edit all finances. Do not prefix `VITE_` to backend secrets. After deployment, open `https://YOUR-RENDER-URL/health`; it should return `{"status":"ok"}`. A free Render service sleeps after inactivity, so its first request may take longer.

## 3. Vercel: frontend

Import the same GitHub repository as a Vercel project. Set **Root Directory** to `expense-tracker-frontend`. Use the detected Vite settings (`npm run build`, output `dist`). Add `VITE_API_BASE_URL=https://YOUR-RENDER-URL` in Vercel's environment variables, without a trailing slash, then deploy. This value is included in the browser build, so it must be the public Render URL and must not contain secrets.

Return to Render and set `CORS_ORIGINS` to the actual Vercel URL (no trailing slash). Redeploy Render after changing it. If you use a custom domain later, add that origin to `CORS_ORIGINS`, separated by a comma. Redeploy Vercel when changing `VITE_API_BASE_URL`.

Open the Vercel site, create the first account using the private registration code, sign out, and sign in again. Make a transaction and check that its creator appears in the history. Open the site in a second browser, register a second invited account, and confirm that both people see the shared list with the correct creator names. Entries that existed before this change display `Legacy entry`.

## Existing local data

Creating a new Neon database starts with an empty database. It does **not** copy the SQLite or PostgreSQL data from your computer. Back up the local database and migrate its data separately if you want it online. The database schema migration preserves records already present in the target database, but does not move records between databases.
