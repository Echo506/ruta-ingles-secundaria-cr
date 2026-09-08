import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://rewjnozwtxggtdpuedzx.supabase.co";
const supabaseAnonKey = "TU_ANON_KEY_REAL_COMPLETA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
window.supabaseClient = supabase;