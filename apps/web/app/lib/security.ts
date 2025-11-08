export const inputCaps = {maxQueryLen: 512};

const ipBuckets = new Map<string, { count: number; ts: number}>();
export function rateLimit(ip: string, limit = 60, windowMs = 60_000){
    const now = Date.now();
    const b = ipBuckets.get(ip) || {count: 0, ts: now};
    if (now - b.ts > windowMs) { b.count = 0; b.ts = now;}
    b.count++;
    ipBuckets.set(ip, b);
    return b.count <= limit;
}