/* =========================================================
   CONEXIÓN PÚBLICA A SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://gcvxanagwqafpkyojxme.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_FzhLxo9j3XBfEJXTsKkXKA_0nCYpA0k";

const supabaseConfigReady =
    SUPABASE_URL.startsWith("https://") &&
    SUPABASE_URL.includes(".supabase.co") &&
    SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_");

window.laPosadaSupabaseReady = supabaseConfigReady;
window.laPosadaSupabase = null;

if (supabaseConfigReady && window.supabase) {
    window.laPosadaSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    console.log("Supabase conectado correctamente");
} else {
    console.error("No se pudo crear la conexión con Supabase");
}