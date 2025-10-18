import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Inicializa o cliente Supabase usando variáveis de ambiente
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Usamos a chave de Service Role para poder atualizar o perfil de qualquer usuário
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const status = url.searchParams.get('status'); // Status do Mercado Pago (e.g., approved)

    if (!userId) {
      return new Response('Missing user_id parameter', { status: 400, headers: corsHeaders });
    }

    if (status === 'approved') {
      // Calcula a data de expiração (30 dias a partir de agora)
      const subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Atualiza o perfil do usuário no banco de dados
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
        // Retorna um erro interno, mas redireciona o usuário para o dashboard
      }
      
      // Redireciona o usuário de volta para a página de planos ou dashboard
      return Response.redirect(`${supabaseUrl.replace('.co', '.co')}/dashboard?payment=success`, 303);

    } else {
      // Se o status não for aprovado, redireciona para a página de falha
      return Response.redirect(`${supabaseUrl.replace('.co', '.co')}/pricing?payment=pending`, 303);
    }

  } catch (error) {
    console.error('Payment Success Function Error:', error);
    return Response.redirect(`${supabaseUrl.replace('.co', '.co')}/pricing?payment=error`, 303);
  }
});