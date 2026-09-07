import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://TU-PROJECT-REF.supabase.co";
const supabaseKey = "TU_PUBLISHABLE_KEY";

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

