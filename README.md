# PASSVAULT

## Run locally

Install the frontend and backend dependencies:

```sh
npm install
npm install --prefix backend
```

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your MongoDB Atlas connection string. Keep the connection string private; `backend/.env` is git-ignored.

Start Vite and the Express API together:

```sh
npm run dev:full
```

The app is served at `http://localhost:5173`, with `/api` proxied to the API at port `3000`. If Atlas is not configured or reachable, account routes return an unavailable error rather than accepting a fake login.

Signed-in vault entries are encrypted in the browser before storage. The account password derives the encryption key; forgotten passwords cannot recover encrypted entries. Existing guest entries in browser `localStorage` are preserved and are not automatically migrated into an account.

## Project scaffold

This project began as the React + Vite template.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
