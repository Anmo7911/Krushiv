// js/supabase.js
// Replace these with your actual Supabase credentials from Settings -> API
const SUPABASE_URL = "https://tjrvvqefycjrgdbtecqn.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_v_j1wZtERXZcBNMWX80LmQ_q3gODXKq";

// Initialize Supabase Client (loaded via CDN in HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function: Generate URL-safe slug from title
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start
    .replace(/-+$/, '');         // Trim - from end
}

// Helper function: Generate unique random token (for private/shareable links)
function generateToken(prefix = "tok") {
  const rand = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36).slice(-4);
  return `\({prefix}_\){rand}${timestamp}`;
}
