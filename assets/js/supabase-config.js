import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://rewjnozwtxggtdpuedzx.supabase.co";
const supabaseAnonKey = "sb_publishable_P9Hpn8_qoaFLohw3bLS_nw_wyOu3LAO";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
window.supabaseClient = supabase;