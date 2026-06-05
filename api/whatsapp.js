// Simple in-memory rate limiter (resets on cold start)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per minute per IP

function getRateLimitKey(req) {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(key) {
  const now = Date.now();
  const entry = rateLimitMap.get(key) || { count: 0, windowStart: now };

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count++;
  }

  rateLimitMap.set(key, entry);

  // Prevent map from growing unboundedly (simple cleanup)
  if (rateLimitMap.size > 10000) {
    const oldestKey = rateLimitMap.keys().next().value;
    rateLimitMap.delete(oldestKey);
  }

  return entry.count <= RATE_LIMIT_MAX;
}

function sanitize(str, maxLen = 2000) {
  if (typeof str !== 'string') return '';
  // Remove null bytes and control characters except newlines and tabs
  return str
    .replace(/\0/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\uFFFF]/g, '')
    .slice(0, maxLen);
}

export default function handler(request, response) {
  // Only allow POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método No Permitido' });
  }

  // Rate limiting
  const clientKey = getRateLimitKey(request);
  if (!checkRateLimit(clientKey)) {
    return response
      .status(429)
      .json({ error: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.' });
  }

  // Validate & sanitize message
  const rawMessage = request.body?.message;
  if (!rawMessage || typeof rawMessage !== 'string') {
    return response.status(400).json({ error: 'Falta el mensaje' });
  }

  const message = sanitize(rawMessage, 4000);
  if (message.length < 10) {
    return response.status(400).json({ error: 'Mensaje demasiado corto' });
  }

  // Build WhatsApp URL
  const phone = process.env.WHATSAPP_NUMBER || '573007787710';
  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phone}?text=${encodedMsg}`;

  // Redirect to WhatsApp (works on iOS Safari)
  return response.redirect(302, waUrl);
}
