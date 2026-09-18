# DataGuard AI

DataGuard AI is a privacy-conscious data quality and pipeline investigation platform. It is designed as a portfolio-grade example of how AI can sit on top of real data engineering rather than replacing it.

## What it does

- Import CSV/JSON datasets and profile them automatically.
- Detect schema/type information, missingness, uniqueness and numeric ranges.
- Generate quality-rule suggestions.
- Run configurable quality rules: not-null, unique, numeric range, regex and allowed-values.
- Keep historical monitoring runs and compare volume changes.
- Turn high-severity failures into an incident view.
- Provide evidence-first AI investigation: the investigator works from metadata and quality evidence instead of sending raw records to an LLM by default.
- Show a lineage model from source → ingestion → profiler → quality engine → incident/AI.
- Provide a Python engine for heavier batch processing and a future worker deployment.
- Use local browser persistence for the demo so the Vercel deployment is usable without a paid database.

## Architecture

```text
Browser / Next.js
       |
       +---- ingestion (CSV/JSON)
       |
       +---- /api/analyze
       |        |
       |        +---- profiling
       |        +---- quality rules
       |        +---- anomaly/volume signals
       |
       +---- local workspace history
       |
       +---- evidence-first investigation
                    |
                    +---- optional OpenAI-compatible model

Heavy batch path:
source -> Python engine -> quality result -> persisted run -> incident
```

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Load the demo dataset to see failing checks and incident investigation.

Python batch engine:

```bash
python python_engine/dataguard_engine.py sample-data/customers.csv
```

## Vercel

This application uses a standard Next.js deployment and does not require a paid backend for the demo. Push the repository to GitHub and import it into Vercel.

For production multi-user persistence, add PostgreSQL and replace the browser repository with a server-side repository. Keep the same domain model: workspaces, members, sources, datasets, rules, ingestion runs, issues, incidents, audit events and notifications.

## Optional AI configuration

Copy `.env.example` to `.env.local` and provide an OpenAI-compatible endpoint, key and model. The intended AI prompt should receive only incident metadata, schema metadata, rule results and statistical evidence. Do not send raw customer records unless a user explicitly enables that behavior and the privacy model permits it.

## Production roadmap already reflected in the architecture

- Multiple workspaces and RBAC
- PostgreSQL repository adapter
- Connector abstraction for PostgreSQL/MySQL/REST/S3-like sources
- Scheduled ingestion workers
- Data contracts and schema versioning
- Statistical anomaly models (seasonality, robust z-score, PSI/JS divergence)
- Incident state machine and audit log
- Webhook/email notification adapters
- AI provider abstraction + evaluation set
- OpenTelemetry instrumentation
- Encryption and secret management
- Row/column-level access controls

## Portfolio note

This is intentionally a working system, not a landing page. The UI is a control surface for the ingestion, profiling, quality and investigation pipeline.
