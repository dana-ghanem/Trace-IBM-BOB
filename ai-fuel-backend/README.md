# AI Fuel — Backend

Node.js + Express backend for the AI Fuel developer-cost-estimation tool.  
Runs on **http://localhost:3001**. All state is held in memory for a single demo session.

---

## Quick start

```bash
cd ai-fuel-backend
npm install
```

Create a `.env` file in this directory (one already exists with the keys below — never commit it):

```
WATSONX_API_KEY=<your IBM Cloud API key>
WATSONX_PROJECT_ID=<your watsonx.ai project id>
WATSONX_URL=https://eu-de.ml.cloud.ibm.com   # or your regional endpoint
```

```bash
# Production
npm start

# Development (auto-restart on save)
npm run dev
```

The server listens on **port 3001** and accepts CORS requests from `http://localhost:5173` (Vite default).

---

## Endpoints at a glance

| Method | Path | Description |
|--------|------|-------------|
| GET | `/usage` | Current budget, max, and SAFE/WARNING/CRITICAL status |
| POST | `/task` | Analyse a coding request via watsonx.ai (fallback to mock data) |
| POST | `/task/start` | Reset execution step and return last plan |
| POST | `/task/progress` | Step-by-step execution progress (scripted error at step 2) |
| POST | `/task/finish` | Tally completed/total tasks |
| POST | `/impact` | Proposed change and affected areas |
| POST | `/impact/apply` | Deduct 320 credits from budget |
| POST | `/trace` | Full trace stages with logs and estimate |
| POST | `/trace/stage-complete` | Deduct cost for completed stage (Minimal fix = 160 credits) |
| GET | `/rewards` | Points, resets, streak, next milestone |
| POST | `/rewards/quiz` | Award 50 points for correct answer; handle milestone crossing |
| POST | `/rewards/reset` | Spend one Usage Limit Reset to restore budget |
| POST | `/demo/scenario` | Switch demo scenario: `safe` / `low` / `critical` / `exhausted` |

---

## Project structure

```
ai-fuel-backend/
├── server.js          # Express app, CORS, route mounting
├── data.js            # In-memory state, constants, planFor()
├── watsonx.js         # IAM token + watsonx.ai text generation
├── routes/
│   ├── usage.js
│   ├── task.js
│   ├── impact.js
│   ├── trace.js
│   ├── rewards.js
│   └── demo.js
├── .env               # Secret keys — NOT committed to git
├── .gitignore
└── package.json
```
