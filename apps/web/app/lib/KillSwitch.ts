import fs from 'fs/promises';
import path from 'path';

let CACHE: boolean | null = null;

function flagPath() {
  return path.join(process.cwd(), '..', '..', 'data', 'flags.json');
}

export async function isKilled(): Promise<boolean> {
  if (CACHE !== null) return CACHE;
  try {
    const obj = JSON.parse(await fs.readFile(flagPath(), 'utf-8'));
    CACHE = obj.askian_enabled === false;
    return CACHE;
  } catch {
    return process.env.ASKIAN_KILL_SWITCH === 'true';
  }
}

export async function setKilled(killed: boolean) {
  CACHE = killed;
  await fs.writeFile(flagPath(), JSON.stringify({ askian_enabled: !killed }, null, 2), 'utf-8');
}