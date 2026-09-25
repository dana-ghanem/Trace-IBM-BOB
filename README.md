# AI Fuel

> A developer tool that estimates AI-credit costs, plans what fits in your budget, and protects your remaining credits.

## Project Structure

```
Trace-IBM-BOB/
├── ai-fuel-backend/        # Node.js + Express API (port 3001)
│   ├── routes/             # One file per resource group
│   ├── data.js             # In-memory state & constants
│   ├── watsonx.js          # IBM watsonx.ai integration
│   └── server.js           # App entry point
│
└── ai-fuel-frontend/       # React + Vite UI (port 5173)
    ├── public/
    └── src/
        ├── components/     # Reusable UI components
        └── pages/          # Route-level page components
```

## Branches

| Branch     | Purpose                          |
|------------|----------------------------------|
| `main`     | Project structure & overview     |
| `backend`  | Node.js/Express backend (done)   |
| `frontend` | React/Vite frontend (coming)     |

## Quick Start

### Backend
```bash
cd ai-fuel-backend
npm install
# add .env with WATSONX_API_KEY, WATSONX_PROJECT_ID, WATSONX_URL
npm start        # http://localhost:3001
npm run dev      # with nodemon
```

### Frontend
```bash
cd ai-fuel-frontend
npm install
npm run dev      # http://localhost:5173
```
