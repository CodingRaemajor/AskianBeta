#!/usr/bin/env node
// cli.ts
import { chunk } from '../../apps/widget/src/chunker';
import { embedTexts } from './vectorize';

const cmd = process.argv[2];

async function run() {
  if (!cmd || ['help', '-h', '--help'].includes(cmd)) {
    console.log(`Askian CLI
Usage:
  askian chunk "<text>" [maxChars] [overlap]
  askian embed "<text1>|<text2>|..."
  askian purge <source-prefix>   (uses DATABASE_URL)
`);
    process.exit(0);
  }

  if (cmd === 'chunk') {
    const text = String(process.argv[3] ?? '');
    const maxChars = Number(process.argv[4] ?? 1200);
    const overlap  = Number(process.argv[5] ?? 100);
    const out = chunk(text, { maxChars, overlap });
    console.log(JSON.stringify(out, null, 2));
    return;
  }

  if (cmd === 'embed') {
    const joined = String(process.argv[3] ?? '');
    const texts = joined.split('|').map(s => s.trim()).filter(Boolean);
    const res = await embedTexts(texts);
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (cmd === 'purge') {
    // delegate to the purge script to keep pg dependency optional here
    const { spawn } = await import('node:child_process');
    const prefix = process.argv[3];
    const child = spawn(process.execPath, ['-r', 'ts-node/register', 'purge.ts', prefix], { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code ?? 0));
    return;
  }

  console.error('Unknown command. Try `askian help`.');
  process.exit(1);
}

run();
