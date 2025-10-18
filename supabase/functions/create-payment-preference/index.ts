import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!ACCESS_TOKEN) {
      throw new Error('Server configuration error: Payment provider token is missing.');
    }

    const { userId, planId, origin } = await req.json();
    if (!userId || planId !== 'premium' || !origin) {
      return new Response(JSON.stringify({ error: 'Bad Request: Invalid user, plan ID, or origin' }), { status: 400, headers: corsHeaders });
    }

    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId);

    if (userError || !userData.user || !userData.user.email) {
      throw new Error(`User or user email not found: ${userError?.message || 'Unknown error'}`);
    }
    const userEmail = userData.user.email;

    const preferenceBody = {
      items: [
        {
          title: 'Assinatura Premium FinanDash (Mensal)',
          quantity: 1,
          unit_price: 19.90,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${origin}/pricing?payment=success`,
        failure: `${origin}/pricing?payment=failure`,
        pending: `${origin}/pricing?payment=pending`,
      },
      auto_return: "approved",
      external_reference: userId,
      notification_url: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-webhook?source_news=webhooks`,
    };

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceBody)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Mercado Pago API error response:', result);
      throw new Error(result.message || `Mercado Pago API responded with status ${response.status}`);
    }
    
    if (!result.init_point) {
      throw new Error('Failed to get init_point from provider.');
    }

    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('--- ERROR in create-payment-preference function ---', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});