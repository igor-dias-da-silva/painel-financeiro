import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// A URL base do seu aplicativo React.
// Dependemos da reescrita do Vercel/Netlify para servir o index.html a partir desta URL.
const APP_URL = supabaseUrl.replace('//', '//app.');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const status = url.searchParams.get('status');

    if (!userId) {
      return new Response('Missing user_id parameter', { status: 400, headers: corsHeaders });
    }

    if (status === 'approved') {
      const subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_plan: 'premium',
          subscription_status: 'active',
          subscription_ends_at: subscriptionEndsAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase update error:', error);
      }
      
      return Response.redirect(`${APP_URL}/dashboard?payment=success`, 303);

    } else {
      return Response.redirect(`${APP_URL}/pricing?payment=pending`, 303);
    }

  } catch (error) {
    console.error('Payment Success Function Error:', error);
    return Response.redirect(`${APP_URL}/pricing?payment=error`, 303);
  }
});