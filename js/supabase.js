// js/supabase.js
const SUPABASE_URL = "https://tjrvvqefycjrgdbtecqn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_v_j1wZtERXZcBNMWX80LmQ_q3gODXKq";

// Use window.supabaseClient to avoid variable collision with the CDN's window.supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Assign to window.supabaseClient and fallback alias window.db
window.supabaseClient = supabaseClient;
window.db = supabaseClient;

// Helper: Slug generator
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper: Token generator
function generateToken(prefix = "tok") {
  const rand = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36).slice(-4);
  return `\({prefix}_\){rand}${timestamp}`;
}
