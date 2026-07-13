# SAT Frontend

The React interface for the Syntactic Analysis Tool. It provides authentication,
sentence input and validation, syntax-tree visualization, analysis history, and
the administration dashboard.

## Development

From this directory:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

The development site is available at `http://localhost:5173`. The FastAPI
backend must also be running. Set `VITE_API_URL` in `.env` when the backend is
not available at `http://127.0.0.1:8000`.

## Useful commands

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run lint` checks the source code.
- `npm run preview` serves the production build locally.

See the repository-level `README.md`, `DEPLOYMENT.md`, and
`docs/TESTING_GUIDE.md` for complete setup and deployment instructions.
