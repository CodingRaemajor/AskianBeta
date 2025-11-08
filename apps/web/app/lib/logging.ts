import fs from 'fs/promises';
import path from 'path';

type LogRow = {
  ts: string;
  page_path: string;
  audience: 'prospective'|'undergrad'|'grad'|'international';
  q_hash: string;
  topK: number;
  sources: string[];
  latency_ms: number;
  rating: null | 0 | 1;
};

function logPath() {
  return path.join(process.cwd(), '..', '..', '..', 'data', 'logs.jsonl');
}

export async function logEvent(row: LogRow) {
  await fs.appendFile(logPath(), JSON.stringify(row) + '\n', 'utf-8');
}

export async function updateRating(q_hash: string, rating: 0|1) {
  const p = logPath();
  const lines = (await fs.readFile(p,'utf-8').catch(()=>'')) .trim().split('\n').filter(Boolean);
  const out = lines.map(l => {
    const o = JSON.parse(l) as LogRow;
    if (o.q_hash === q_hash) o.rating = rating;
    return JSON.stringify(o);
  }).join('\n') + (lines.length?'\n':'');
  await fs.writeFile(p, out, 'utf-8');
}

export async function getMetrics() {
  const p = logPath();
  const lines = (await fs.readFile(p,'utf-8').catch(()=>'')) .trim().split('\n').filter(Boolean);
  const rows = lines.map(l => JSON.parse(l) as LogRow);
  const n = rows.length || 1;
  const citationCoverage = rows.filter(r => (r.sources?.length || 0) >= 1).length / n;
  const helpfulness = rows.filter(r => r.rating === 1).length / (rows.filter(r => r.rating !== null).length || 1);
  const lat = rows.map(r => r.latency_ms).sort((a,b)=>a-b);
  const medianLatency = lat[Math.floor(lat.length/2)] || 0;
  return { citationCoverage, helpfulness, medianLatency };
}