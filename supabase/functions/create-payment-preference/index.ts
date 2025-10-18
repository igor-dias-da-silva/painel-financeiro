import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inicializa o cliente Supabase com a chave de Service Role para buscar dados do usuário
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
      console.error("FATAL: MERCADO_PAGO_ACCESS_TOKEN secret is not set.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Payment provider token is missing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const { userId, planId } = await req.json();
    if (!userId || planId !== 'premium') {
      return new Response('Bad Request: Invalid user or plan ID', { status: 400, headers: corsHeaders });
    }

    // Busca o e-mail real do usuário no Supabase Auth
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
        email: userEmail, // Usando o e-mail real do usuário
      },
      payment_methods: {
        excluded_payment_types: [],
        installments: 1,
      },
      back_urls: {
        success: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-success?user_id=${userId}`,
        failure: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-failure?user_id=${userId}`,
        pending: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-pending?user_id=${userId}`,
      },
      auto_return: "approved",
      external_reference: userId,
      purpose: 'wallet_purchase', // Adicionando o propósito da transação
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
      throw new Error(`Mercado Pago API responded with status ${response.status}`);
    }
    
    if (!result.id) {
      console.error('Error: preference ID not found in Mercado Pago response.');
      throw new Error('Failed to get preference ID from provider.');
    }

    return new Response(JSON.stringify({ preferenceId: result.id }), {
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