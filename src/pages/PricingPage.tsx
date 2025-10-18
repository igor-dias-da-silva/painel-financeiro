"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MercadoPagoPayment } from '@/components/MercadoPagoPayment';

const MERCADO_PAGO_FUNCTION_URL = 'https://ruubwpgemhyzsrbqspnj.supabase.co/functions/v1/create-payment-preference';

const PricingPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    if (paymentStatus) {
      switch (paymentStatus) {
        case 'success':
          showSuccess('Pagamento aprovado! Seu plano Premium está ativo.');
          break;
        case 'pending':
          showError('Pagamento pendente. Seu plano será ativado assim que o pagamento for confirmado.');
          break;
        case 'failure':
          showError('Pagamento falhou. Por favor, tente novamente.');
          break;
        case 'error':
          showError('Ocorreu um erro inesperado durante o processamento do pagamento.');
          break;
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate]);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id), // Corrigido de 'fn' para 'queryFn'
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Plano atualizado com sucesso!');
    },
    onError: () => showError('Erro ao atualizar plano.'),
  });

  const handleSubscribe = async (plan: 'free' | 'premium') => {
    if (!user) {
      showError('Você precisa estar logado para assinar um plano.');
      return;
    }
    
    if (plan === 'premium') {
      setIsPaymentLoading(true);
      try {
        const session = await supabase.auth.getSession();
        const accessToken = session.data.session?.access_token;

        if (!accessToken) {
          throw new Error('Sessão de usuário não encontrada.');
        }

        const response = await fetch(MERCADO_PAGO_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ userId: user.id, planId: 'premium' }),
        });

        const data = await response.json();
        
        if (!response.ok || data.error) {
          throw new Error(data.error || `Falha ao criar preferência de pagamento. Status: ${response.status}`);
        }

        if (data.preferenceId) {
          setPreferenceId(data.preferenceId);
          setIsPaymentModalOpen(true);
        } else {
          throw new Error('ID da preferência não recebido do servidor.');
        }

      } catch (error: any) {
        console.error('Erro na integração com Mercado Pago:', error);
        showError(`Erro ao iniciar pagamento: ${error.message}`);
      } finally {
        setIsPaymentLoading(false);
      }
    } else {
      updateProfileMutation.mutate({ 
        subscription_plan: 'free',
        subscription_status: 'active',
        subscription_ends_at: null
      });
    }
  };

  const handleCancelSubscription = () => {
    if (!user) return;
    
    updateProfileMutation.mutate({ 
      subscription_plan: 'free',
      subscription_status: 'cancelled',
      subscription_ends_at: null
    });
  };

  const isLoading = authLoading || profileLoading || updateProfileMutation.isPending;

  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0,00',
      period: 'para sempre',
      description: 'Perfeito para começar a organizar suas finanças',
      icon: Zap,
      features: [
        'Controle de contas a pagar',
        'Lista de compras básica',
        'Dashboard financeiro',
        'Até 5 contas ativas',
        'Suporte por email'
      ],
      limitations: [
        'Recursos limitados',
        'Sem exportação avançada',
        'Sem integrações'
      ],
      featured: false,
      cta: 'Plano Gratuito',
      ctaVariant: 'outline' as const
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 19,90',
      period: 'por mês',
      description: 'Desbloqueie todos os recursos e recursos avançados',
      icon: Crown,
      features: [
        'Tudo do plano gratuito',
        'Listas de compras ilimitadas',
        'Exportação para PDF e Excel',
        'Integração com calendário',
        'Análises financeiras avançadas',
        'Suporte prioritário',
        'Personalização avançada',
        'Backup automático de dados'
      ],
      limitations: [],
      featured: true,
      cta: 'Assinar Agora',
      ctaVariant: 'default' as const,
      popular: true
    }
  ];

  const currentPlan = profile?.subscription_plan || 'free';
  const isPremium = currentPlan === 'premium';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
              Escolha seu plano
            </h1>
            <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
              Comece de graça e atualize quando precisar de mais recursos
            </p>
          </div>

          {user && (
            <Card className="mb-8 dark:bg-card dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-foreground">
                      Plano Atual: <span className={isPremium ? 'text-green-600' : 'text-blue-600'}>
                        {isPremium ? 'Premium' : 'Gratuito'}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                      {isPremium 
                        ? 'Você tem acesso a todos os recursos premium.' 
                        : 'Você está usando o plano gratuito. Atualize para desbloquear mais recursos.'
                      }
                    </p>
                  </div>
                  {isPremium && (
                    <Button variant="outline" onClick={handleCancelSubscription} disabled={updateProfileMutation.isPending}>
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.featured ? 'ring-2 ring-primary border-primary' : ''} ${isCurrentPlan ? 'border-green-500' : ''} dark:bg-card dark:border-border`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.featured ? 'bg-primary/10' : 'bg-gray-100 dark:bg-secondary'}`}>
                        <Icon className={`h-6 w-6 ${plan.featured ? 'text-primary' : 'text-gray-600 dark:text-gray-400'}`} />
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-600 dark:text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                    <p className="text-gray-600 dark:text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-medium dark:text-foreground">Recursos incluídos:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm dark:text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-red-600">Limitações:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-600 dark:text-muted-foreground">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      variant={plan.ctaVariant}
                      onClick={() => handleSubscribe(plan.id as 'free' | 'premium')}
                      disabled={isLoading || isCurrentPlan || isPaymentLoading}
                    >
                      {isPaymentLoading && plan.id === 'premium' ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Preparando...</>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Efetuar Pagamento</DialogTitle>
          </DialogHeader>
          {preferenceId ? (
            <MercadoPagoPayment preferenceId={preferenceId} />
          ) : (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AuthGuard>
  );
};

export default PricingPage;