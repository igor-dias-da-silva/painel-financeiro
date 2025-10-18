import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('--- create-payment-preference function invoked ---');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    console.log('Checking for MERCADO_PAGO_ACCESS_TOKEN...');
    if (!ACCESS_TOKEN) {
      console.error("FATAL: MERCADO_PAGO_ACCESS_TOKEN secret is not set or readable.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Payment provider token is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    console.log('MERCADO_PAGO_ACCESS_TOKEN found.');

    const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN, options: { timeout: 5000 } });

    const { userId, planId } = await req.json();
    console.log(`Request body parsed successfully. UserID: ${userId}, PlanID: ${planId}`);

    if (!userId || planId !== 'premium') {
      console.warn(`Invalid request body. UserID: ${userId}, PlanID: ${planId}`);
      return new Response('Bad Request: Invalid user or plan ID', { status: 400, headers: corsHeaders });
    }

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

    console.log('Creating Mercado Pago preference with body:', JSON.stringify(preferenceBody, null, 2));
    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    console.log('Mercado Pago preference response received:', JSON.stringify(result, null, 2));

    if (!result.init_point) {
      console.error('Error: init_point not found in Mercado Pago response.');
      throw new Error('Failed to get payment URL from provider.');
    }

    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('--- ERROR in create-payment-preference function ---');
    console.error('Error object:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unknown error occurred.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});