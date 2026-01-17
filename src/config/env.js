
// Chargement synchrone de dotenv pour les tests
import dotenv from 'dotenv';
if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

export const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  BOT_PREFIX: process.env.BOT_PREFIX || '!',
  BOT_NAME: process.env.BOT_NAME || '100% Manga Bot',
  SUPER_ADMINS: (process.env.SUPER_ADMINS || '')
    .split(',')
    .map(x => x.trim())
    .filter(Boolean),
  JIKAN_BASE: process.env.JIKAN_BASE || 'https://api.jikan.moe/v4',
  WAIFU_BASE: process.env.WAIFU_BASE || 'https://api.waifu.pics',
  TRACE_BASE: process.env.TRACE_BASE || 'https://api.trace.moe'
}
