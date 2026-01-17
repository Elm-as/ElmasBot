import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
  throw new Error('Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_DEFAULT_KEY in env')
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
