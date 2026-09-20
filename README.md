# DataGuard AI

DataGuard AI is a privacy-conscious data quality and pipeline investigation platform for data engineers, ML engineers and data analysts. It profiles real datasets, detects quality problems and anomalies, creates incident evidence, and supports evidence-first AI investigation.

## Product flow

```text
Landing page
    ↓
Workspace
    ↓
CSV / JSON ingestion
    ↓
Schema discovery + profiling
    ↓
Automatic + custom quality rules
    ↓
Quality score + anomaly signals
    ↓
Historical monitoring + incidents
    ↓
Evidence-first AI investigation
    ↓
PostgreSQL audit/persistence layer (optional locally, production-ready with Neon)
```

## Included architecture

- Next.js application and professional minimal UI.
- Landing page explaining the product before entering the workspace.
- CSV/JSON ingestion and automatic profiling.
- Quality-rule suggestions and configurable checks.
- Historical monitoring and explainable quality scoring.
- Incident and evidence-first investigation workflow.
- Optional OpenAI-compatible AI provider.
- Python batch-processing engine.
- Prisma ORM 7 PostgreSQL schema and initial migration.
- Neon-ready pooled runtime URL + direct migration URL.
- Workspace, organization, members, data sources, datasets, runs, rules, quality results, incidents, AI investigations and audit-log models.
- Seed script for a demo organization/workspace.

## Environment variables — beginner setup

Copy the template first:

```bash
copy .env.example .env.local
```

On macOS/Linux use `cp .env.example .env.local`.

### 1. Neon database

Create a PostgreSQL project in Neon. In Neon, open **Connect** and choose the connection details for your project. You will use the **pooled** connection string as `DATABASE_URL` and the **direct** connection string as `DIRECT_URL`. Prisma's current PostgreSQL guidance recommends a pooled URL for runtime and a direct URL for CLI/migrations with serverless PostgreSQL providers such as Neon.

Paste them into `.env.local`:

```env
DATABASE_URL="paste-the-pooled-neon-url-here"
DIRECT_URL="paste-the-direct-neon-url-here"
```

Do not post these values publicly. They contain database credentials.

### 2. AUTH_SECRET

Generate it locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Paste the output into:

```env
AUTH_SECRET="your-generated-secret"
```

### 3. AI variables

AI is optional. If you leave `AI_API_KEY` empty, DataGuard uses its deterministic evidence-based investigator.

If you use an OpenAI-compatible provider:

```env
AI_BASE_URL="provider-base-url"
AI_API_KEY="provider-secret-key"
AI_MODEL="provider-model-name"
```

Never use `NEXT_PUBLIC_` for database passwords, API keys or other server secrets.

## Database setup

Install dependencies:

```bash
npm install
```

Generate Prisma Client:

```bash
npm run db:generate
```

Apply the included migration:

```bash
npm run db:deploy
```

For local development where you want Prisma to create/update migrations:

```bash
npm run db:migrate
```

Seed the demo workspace:

```bash
npm run db:seed
```

Open Prisma Studio:

```bash
npm run db:studio
```

Prisma ORM 7 uses `prisma.config.ts` for the CLI datasource configuration and supports PostgreSQL providers including Neon.

## Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Python engine

```bash
python python_engine/dataguard_engine.py sample-data/customers.csv
```

## Vercel deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, and any AI variables under Vercel Project Settings → Environment Variables.
4. Deploy.
5. Run the production migration from a trusted machine/CI environment with `npm run db:deploy` against the production database.

Do not commit `.env.local`.

## Security model

The AI investigator is designed to receive structured metadata and quality evidence rather than raw customer records by default. Database credentials and AI keys remain server-side.

## Project structure

The original application file sequence is preserved; the database layer is added as the persistence foundation rather than replacing the existing ingestion, engine, UI or Python components.
