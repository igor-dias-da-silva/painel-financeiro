import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const APP_URL = supabaseUrl.replace('//', '//app.');

serve(async (req) => {
  return Response.redirect(`${APP_URL}/pricing?payment=failure`, 303);
});