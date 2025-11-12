import { useState } from "react";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [resp, setResp] = useState(null);

  async function submit() {
    const r = await fetch("/api/intent", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ goal, context: {} })
    });
    const j = await r.json();
    setResp(JSON.stringify(j, null, 2));
  }

  return (
    <main style={{padding: 40, fontFamily: 'Inter, sans-serif'}}>
      <h1>FounderForge — Intent Demo</h1>
      <textarea rows={4} cols={80} value={goal} onChange={e=>setGoal(e.target.value)} placeholder="Type an intent e.g. 'Find 200 DTC fashion brands in US revenue > $5M'"/>
      <br/>
      <button onClick={submit} style={{marginTop:12}}>Run Intent Compiler</button>
      <pre style={{whiteSpace:'pre-wrap', marginTop:20}}>{resp}</pre>
    </main>
  );
}
