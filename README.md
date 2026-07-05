# Syntactic Analysis Tool

An interactive web application for analyzing English sentence structure. The
application sends a sentence to a FastAPI service, runs a Hugging Face
sequence-to-sequence model, converts the model's S-expression output into a
tree, and displays both the generated expression and an interactive syntax
tree in the browser.

## Architecture

```text
Browser
  |
  |  JSON over HTTP
  v
React + Vite frontend  --->  FastAPI backend  --->  Hugging Face model
                                      |
                                      v
                              S-expression parser
                                      |
                                      v
                              JSON syntax tree
```

The source code is organized under `SAT/`:

```text
SAT/
|-- frontend/          React, Vite, Tailwind CSS, and react-d3-tree
|-- backend/
|   |-- main.py        FastAPI application and API routes
|   `-- app/
|       |-- model.py   Hugging Face model loading and inference
|       |-- parser.py  S-expression to JSON tree conversion
|       `-- schemas.py Request validation models
`-- command.txt        Original local development notes
```

## Technologies

- Frontend: React 19, Vite, Tailwind CSS, D3 hierarchy, and react-d3-tree
- Backend: Python, FastAPI, Uvicorn, and Pydantic
- Machine learning: Hugging Face Transformers and PyTorch
- Model: `SAT-Project/SAT-Model-T1`

## Prerequisites

- Python 3.11 or later
- Node.js 20 or later and npm
- A Hugging Face access token that can download the configured model

## Run the backend

From the repository root:

```powershell
cd SAT\backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Add your own Hugging Face token to `SAT/backend/.env`. Never commit this file.
Then start the API:

```powershell
python -m uvicorn main:app --reload
```

The API is available at `http://127.0.0.1:8000`, with interactive API
documentation at `http://127.0.0.1:8000/docs`.

For macOS or Linux, activate the virtual environment with
`source venv/bin/activate` and copy the example with
`cp .env.example .env`.

## Run the frontend

Open a second terminal from the repository root:

```powershell
cd SAT\frontend
npm install
Copy-Item .env.example .env
npm run dev
```

Open `http://localhost:5173`. Keep the backend running while using the
application.

## API flow

1. A user enters an English sentence in the frontend.
2. The frontend sends `POST /analyze` with `{ "sentence": "..." }`.
3. FastAPI validates the request and passes the sentence to the Hugging Face
   model.
4. The model returns an S-expression.
5. The backend converts the S-expression into a nested JSON tree.
6. The API returns the sentence, S-expression, and tree to the frontend for
   visualization.

Example response shape:

```json
{
  "sentence": "She is talking about her dog.",
  "s_expression": "(S ...)",
  "tree": {
    "name": "S",
    "children": []
  }
}
```

## Environment variables

Use the committed `.env.example` files as templates. Real `.env` files are
ignored by Git.

- Backend: `HF_TOKEN` authorizes model downloads from Hugging Face.
- Frontend: `VITE_API_URL` selects the FastAPI base URL and defaults to
  `http://127.0.0.1:8000` when it is not set. The current project has no mock
  implementation, so analysis requests use the real FastAPI backend.

## Deployment overview

The frontend can be deployed from `SAT/frontend` on Vercel. The backend can be
deployed from `SAT/backend` on Render or Railway. Production deployment also
requires a public backend URL, an allowed frontend CORS origin, a protected
`HF_TOKEN`, and enough memory to load the model.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the complete deployment checklist.

## Security

- Never commit `.env` files, access tokens, or service credentials.
- Configure secrets in the deployment provider's environment settings.
- Restrict CORS to the deployed frontend origin in production.
