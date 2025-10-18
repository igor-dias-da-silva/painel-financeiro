import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { MercadoPagoConfig, Preference } from 'https://esm.sh/mercadopago@2.0.8';

// Configuração de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// O token de acesso deve ser configurado como um segredo no Supabase
const ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

if (!ACCESS_TOKEN) {
  console.error("MERCADO_PAGO_ACCESS_TOKEN is not set.");
}

const client = new MercadoPagoConfig({ accessToken: ACCESS_TOKEN || '', options: { timeout: 5000 } });

serve(async (req) => {
  // Lidar com requisições OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized: Missing Authorization header', { status: 401, headers: corsHeaders });
    }
    
    const { userId, planId } = await req.json();

    if (!userId || planId !== 'premium') {
      return new Response('Bad Request: Invalid user or plan ID', { status: 400, headers: corsHeaders });
    }

    // 2. Criar a preferência de pagamento
    const preference = new Preference(client);
    
    const body = {
      items: [
        {
          title: 'Assinatura Premium FinanDash (Mensal)',
          quantity: 1,
          unit_price: 19.90, // R$ 19,90
          currency_id: 'BRL',
        },
      ],
      payer: {
        email: `user-${userId}@finandash.com`, 
      },
      // URLs de retorno (usando o ID do projeto ruubwpgemhyzsrbqspnj)
      back_urls: {
        success: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-success?user_id=${userId}`,
        failure: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-failure?user_id=${userId}`,
        pending: `https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/payment-pending?user_id=${userId}`,
      },
      auto_return: "approved",
      external_reference: userId,
    };

    const result = await preference.create({ body });

    // 3. Retornar o URL de pagamento
    return new Response(JSON.stringify({ init_point: result.init_point }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Mercado Pago Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});