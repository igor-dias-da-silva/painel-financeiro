import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    
    // Apenas processa notificações de pagamento
    if (body.type !== 'payment') {
      return new Response('Notification type not processed', { status: 200 });
    }

    const paymentId = body.data.id;
    const ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');

    // Busca os detalhes do pagamento na API do Mercado Pago
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });

    if (!paymentResponse.ok) {
      throw new Error(`Failed to fetch payment details for ID: ${paymentId}`);
    }

    const payment = await paymentResponse.json();
    const userId = payment.external_reference;
    const status = payment.status;

    if (!userId) {
      throw new Error(`User ID (external_reference) not found in payment details for ID: ${paymentId}`);
    }

    // Atualiza o perfil do usuário apenas se o pagamento for aprovado
    if (status === 'approved') {
      const subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabaseAdmin
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
        throw new Error(`Failed to update profile for user ${userId}: ${error.message}`);
      }
    }

    return new Response('Webhook processed successfully', { status: 200 });

  } catch (error) {
    console.error('--- ERROR in payment-webhook function ---', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});