import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Edge Function "create-payment-preference" invoked.');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Verificação do Token de Acesso do Mercado Pago
  const ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
  if (!ACCESS_TOKEN) {
    console.error("FATAL: MERCADO_PAGO_ACCESS_TOKEN secret is not set in Supabase.");
    return new Response(JSON.stringify({ error: 'Server configuration error: Payment provider token is missing.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('Authorization header missing.');
      return new Response('Unauthorized: Missing Authorization header', { status: 401, headers: corsHeaders });
    }
    
    const { userId, planId } = await req.json();
    console.log(`Received request for userId: ${userId}, planId: ${planId}`);

    if (!userId || planId !== 'premium') {
      return new Response('Bad Request: Invalid user or plan ID', { status: 400, headers: corsHeaders });
    }

    const preference = new Preference(client);
    
    const body = {
      items: [
        {
          title: 'Assinatura Premium FinanDash (Mensal)',
          quantity: 1,
          unit_price: 19.90,
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: `user-${userId}@finandash.com`, 
      },
      back_urls: {
        success: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-success?user_id=${userId}`,
        failure: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-failure?user_id=${userId}`,
        pending: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-pending?user_id=${userId}`,
      },
      auto_return: "approved",
      external_reference: userId,
    };

    console.log('Creating Mercado Pago preference with body:', JSON.stringify(body, null, 2));
    const result = await preference.create({ body });
    console.log('Mercado Pago preference created successfully:', result);

    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});