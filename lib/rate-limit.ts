const windowMaps = new Map<string, { count: number; reset: number }>();

export async function rateLimit(request: Request, limit: number, windowSeconds: number) {
  try {
    const ip = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '')
      .split(',')[0]
      .trim() || 'unknown';
    const key = `${ip}`;
    const now = Date.now();
    const bucket = windowMaps.get(key);
    if (!bucket || now > bucket.reset) {
      windowMaps.set(key, { count: 1, reset: now + windowSeconds * 1000 });
      return { ok: true } as const;
    }
    if (bucket.count >= limit) {
      const retryAfter = Math.ceil((bucket.reset - now) / 1000);
      return {
        ok: false,
        response: new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
        }),
      } as const;
    }
    bucket.count += 1;
    return { ok: true } as const;
  } catch {
    return { ok: true } as const;
  }
}