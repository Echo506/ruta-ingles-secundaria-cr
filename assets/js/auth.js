import { supabase } from "./supabase-config.js";

const REDIRECT_URL =
  "https://echo506.github.io/ruta-ingles-secundaria-cr/pages/progress.html";

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: REDIRECT_URL
    }
  });

  if (error) {
    console.error("Error al iniciar sesión con Google:", error.message);
    alert(`No se pudo iniciar sesión con Google: ${error.message}`);
  }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error al cerrar sesión:", error.message);
    alert(`No se pudo cerrar sesión: ${error.message}`);
    return;
  }

  window.location.href = REDIRECT_URL;
}

export async function getCurrentUser() {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error obteniendo usuario:", error.message);
    return null;
  }

  return user;
}