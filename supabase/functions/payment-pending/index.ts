import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;

serve(async (req) => {
  // Redireciona o usuário de volta para a página de planos com status pendente
  return Response.redirect(`${supabaseUrl.replace('.co', '.co')}/pricing?payment=pending`, 303);
});