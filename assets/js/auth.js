import { supabase } from "./supabase-config.js";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin + window.location.pathname
    }
  });

  if (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión:", error.message);
  }
}

export async function getCurrentUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}