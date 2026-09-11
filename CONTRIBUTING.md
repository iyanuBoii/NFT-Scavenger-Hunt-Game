# Contributing

This repo has three components: `frontend`, `backend`, and `onchain`. Set up whichever ones you need to work on.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_APP_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GitHub OAuth vars
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run start:dev
```

Configure a `.env` with your database connection and any required service credentials (see `src/app.module.ts` for consumed config keys).

## Onchain

```bash
cd onchain
scarb build
snforge test
```

Requires `scarb` 2.8.4 and `starknet-foundry` 0.30.0 (see `.github/workflows/build.yml` for the exact versions CI uses).

## Before opening a PR

- Run `npm run lint` and `npm run test` in `frontend`/`backend` as applicable.
- Run `scarb fmt --check` and `scarb build` in `onchain` if you touched contract code.
