const https = require('https');
const http = require('http');
require('dotenv').config();

// Cached IAM token
let cachedToken = null;
let tokenExpiry = 0; // epoch ms

/**
 * Fetch a fresh IAM Bearer token from IBM Cloud.
 */
async function fetchIAMToken() {
  const apiKey = process.env.WATSONX_API_KEY;
  if (!apiKey) throw new Error('WATSONX_API_KEY not set');

  const body = `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${encodeURIComponent(apiKey)}`;
  const data = await postRequest(
    'https://iam.cloud.ibm.com/identity/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    10000
  );
  const parsed = JSON.parse(data);
  if (!parsed.access_token) throw new Error('No access_token in IAM response');
  // Tokens are valid for 3600 s — refresh 60 s early
  cachedToken = parsed.access_token;
  tokenExpiry = Date.now() + (parsed.expires_in - 60) * 1000;
  return cachedToken;
}

/**
 * Return a valid IAM token, refreshing if expired or on first call.
 */
async function getToken(forceRefresh = false) {
  if (forceRefresh || !cachedToken || Date.now() >= tokenExpiry) {
    return fetchIAMToken();
  }
  return cachedToken;
}

/**
 * Call watsonx.ai text generation.  Retries once on 401 (token refresh).
 */
async function generateText(prompt) {
  const url = process.env.WATSONX_URL;
  const projectId = process.env.WATSONX_PROJECT_ID;
  if (!url || !projectId) throw new Error('WATSONX_URL or WATSONX_PROJECT_ID not set');

  const endpoint = `${url}/ml/v1/text/generation?version=2023-05-29`;
  const requestBody = JSON.stringify({
    input: prompt,
    parameters: { decoding_method: 'greedy', max_new_tokens: 300 },
    model_id: 'meta-llama/llama-3-3-70b-instruct',
    project_id: projectId,
  });

  let token = await getToken();
  let responseText = await postRequest(
    endpoint,
    { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    requestBody,
    10000
  );

  // If 401, refresh token and retry once
  if (responseText === '__401__') {
    token = await getToken(true);
    responseText = await postRequest(
      endpoint,
      { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      requestBody,
      10000
    );
  }

  if (responseText === '__401__') throw new Error('401 Unauthorized from watsonx.ai');

  const parsed = JSON.parse(responseText);
  const generated = parsed?.results?.[0]?.generated_text;
  if (!generated) throw new Error('No generated_text in watsonx.ai response');
  return generated;
}

/**
 * Build the prompt and ask watsonx.ai to decompose a coding request into tasks.
 * Returns a parsed array of task objects, or throws on failure.
 */
async function analyzeRequest(userRequest) {
  const prompt =
    `You are a software project planner. Break the following coding request into up to 6 tasks.\n` +
    `For each task provide: name (string), cost (integer between 50 and 500), ` +
    `mode (one of "Lightweight AI", "Balanced AI", "Advanced AI"), ` +
    `priority (one of "Critical", "High", "Medium", "Low").\n` +
    `Respond ONLY as a raw JSON array — no markdown, no code fences, no explanation.\n\n` +
    `Request: ${userRequest}`;

  const raw = await generateText(prompt);

  // Extract the JSON array — strip markdown fences and any leading/trailing text
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON array found in model response');
  const tasks = JSON.parse(match[0]);

  if (!Array.isArray(tasks) || tasks.length === 0) throw new Error('Empty or non-array task list');

  // Validate each task has required fields
  tasks.forEach((t, i) => {
    if (typeof t.name !== 'string') throw new Error(`Task ${i} missing name`);
    if (typeof t.cost !== 'number') throw new Error(`Task ${i} missing cost`);
    if (!['Lightweight AI', 'Balanced AI', 'Advanced AI'].includes(t.mode))
      throw new Error(`Task ${i} invalid mode`);
    if (!['Critical', 'High', 'Medium', 'Low'].includes(t.priority))
      throw new Error(`Task ${i} invalid priority`);
  });

  return tasks;
}

// ─── Low-level HTTP helper ────────────────────────────────────────────────────

function postRequest(urlString, headers, body, timeoutMs) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(urlString);
    const lib = parsedUrl.protocol === 'https:' ? https : http;

    const bodyBuffer = Buffer.from(body);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: { ...headers, 'Content-Length': bodyBuffer.length },
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode === 401) {
        res.resume();
        return resolve('__401__');
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Request to ${urlString} timed out after ${timeoutMs}ms`));
    });

    req.on('error', reject);
    req.write(bodyBuffer);
    req.end();
  });
}

module.exports = { analyzeRequest };
