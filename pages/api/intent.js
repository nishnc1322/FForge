import fetch from "node-fetch";

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY || process.env.OPENAI_KEY;
const PROVIDER = process.env.LLM_PROVIDER || "anthropic"; // "anthropic" or "openai"

function buildIntentPrompt(goal, context, connectorsList=[]) {
  return `System: You are an Intent Compiler. Return only valid JSON (no commentary).
Input:
USER_GOAL: ${goal}
COMPANY_CONTEXT: ${JSON.stringify(context)}
AVAILABLE_CONNECTORS: ${JSON.stringify(connectorsList)}

Return JSON with fields:
{
  "goal": "...",
  "pack_id": "...",
  "agents": [{ "id":"a1", "type":"researcher", "params":{...}, "outputs_to":["a2"] }, ...],
  "required_connectors": [...],
  "clarify": [] // if missing info
}
`;
}

async function callAnthropic(prompt) {
  const body = {
    model: "claude-2", // adjust if needed
    prompt,
    max_tokens_to_sample: 1200,
    temperature: 0.2
  };
  const res = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "x-api-key": ANTHROPIC_KEY
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return data.completion || data;
}

async function callOpenAI(prompt) {
  const body = {
    model: "gpt-4o-mini", // change as available
    messages: [{role:"system", content:"You are an Intent Compiler."},{role:"user", content: prompt}],
    max_tokens: 1200,
    temperature: 0.2
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "Authorization": `Bearer ${ANTHROPIC_KEY}`
    },
    body: JSON.stringify(body)
  });
  const j = await res.json();
  return j.choices?.[0]?.message?.content ?? j;
}

export default async function handler(req, res) {
  try {
    const { goal, context } = req.body;
    if (!goal) return res.status(400).json({error:"missing goal"});

    const connectors = ["sendgrid","calendly","apollo","supabase"]; // sample list - replace as needed
    const prompt = buildIntentPrompt(goal, context, connectors);

    let raw;
    if (PROVIDER === "anthropic") raw = await callAnthropic(prompt);
    else raw = await callOpenAI(prompt);

    // sanitize: try to extract JSON block
    const text = typeof raw === "string" ? raw : JSON.stringify(raw);
    const jsonMatch = text.match(/\{[\s\S]*\}$/m) || text.match(/\[[\s\S]*\]$/m);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : (()=>{ try { return JSON.parse(text);}catch(e){return {raw:text};}})();

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({error: err.message, stack: err.stack});
  }
}
