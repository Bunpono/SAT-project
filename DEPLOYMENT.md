# Deployment Guide

This guide describes a production deployment with the React frontend on
Vercel and the FastAPI backend on either Render or Railway.

## Before deployment

The current application defaults to local development settings. Before
publishing it, configure these two values:

1. Set `VITE_API_URL` on Vercel to the public backend URL. If the variable is
   absent, the frontend defaults to `http://127.0.0.1:8000`, which a deployed
   browser cannot use.
2. `SAT/backend/main.py` currently allows only local Vite origins in CORS. Add
   the exact deployed Vercel origin before sending production traffic.

The CORS application change is intentionally not included in this frontend
API integration task.

Do not place a real Hugging Face token in source code, `.env.example`, build
logs, or Vercel frontend variables. `HF_TOKEN` belongs only on the backend.

## Deploy the backend on Render

1. Push the repository to GitHub.
2. In Render, create a new **Web Service** from the repository.
3. Set the root directory to `SAT/backend`.
4. Select a Python runtime.
5. Set the build command:

   ```text
   pip install -r requirements.txt
   ```

6. Set the start command:

   ```text
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

7. Add the secret environment variable `HF_TOKEN` in the Render dashboard.
8. Choose an instance with enough memory and disk space for PyTorch and the
   configured model. Model download and first inference may take longer than
   normal HTTP requests.
9. Deploy and verify these URLs:
   - `https://YOUR-SERVICE.onrender.com/`
   - `https://YOUR-SERVICE.onrender.com/docs`
10. Save the public service URL for the frontend configuration.

## Deploy the backend on Railway

1. Push the repository to GitHub.
2. In Railway, create a project from the GitHub repository.
3. Set the service root directory to `SAT/backend`.
4. Add `HF_TOKEN` as a Railway service variable.
5. Use this start command if Railway does not detect it automatically:

   ```text
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

6. Generate a public domain in the service networking settings.
7. Verify the root endpoint and `/docs`.
8. Confirm that the selected service resources can hold the model in memory.

Use either Render or Railway for the backend; both are not required.

## Deploy the frontend on Vercel

1. Import the GitHub repository into Vercel.
2. Set the root directory to `SAT/frontend`.
3. Vercel should detect Vite. Confirm these settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Add `VITE_API_URL` with the public Render or Railway backend URL.
5. Deploy the frontend.
6. Add the final Vercel origin, such as `https://YOUR-PROJECT.vercel.app`, to
   the backend CORS allowlist and redeploy the backend.

Vite variables beginning with `VITE_` are bundled into browser code. Never
store `HF_TOKEN` or any other secret in a Vite environment variable.

## Production verification

- Open the backend root endpoint and `/docs`.
- Submit a short sentence through `POST /analyze` in Swagger UI.
- Open the Vercel site and submit the same sentence through the frontend.
- Confirm the browser has no CORS or mixed-content errors.
- Confirm the syntax expression and tree are rendered.
- Confirm `.env`, `node_modules`, virtual environments, caches, and build
  output are absent from the GitHub repository.
- Review backend logs for model download, memory, timeout, or token errors.

## Common deployment issues

### CORS error

The exact Vercel origin is missing from `allow_origins` in
`SAT/backend/main.py`. Add the `https://` origin without a trailing slash.

### Frontend calls localhost

`VITE_API_URL` was missing or incorrect when Vercel built the frontend. Update
the variable and redeploy so Vite includes the new value in the build.

### Model fails to load

Check that `HF_TOKEN` is set on the backend service, the token can access the
model, and the service has sufficient memory and storage. Restarting a small
instance may trigger another model download and cold start.

### Backend request times out

The first request may include model initialization. Review the provider logs,
increase service resources or timeouts where available, and consider loading
the model during service startup in a future application change.
