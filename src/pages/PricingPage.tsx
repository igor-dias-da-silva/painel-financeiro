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
import { useProfile } from '@/hooks/useProfile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PricingPage = () => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const { isAdmin } = useProfile();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  // Efeito para lidar com o retorno do pagamento
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus) {
      if (paymentStatus === 'success') {
        showSuccess('Pagamento aprovado! Seu plano Premium será ativado em breve.');
      } else if (paymentStatus === 'pending') {
        showSuccess('Pagamento pendente. Seu plano será ativado após a confirmação.');
      } else if (paymentStatus === 'failure') {
        showError('Falha no pagamento. Por favor, tente novamente.');
      }
      // Limpa os parâmetros da URL
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, navigate]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => updateProfile(user!.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      showSuccess('Plano atualizado para Gratuito.');
    },
    onError: () => showError('Erro ao atualizar plano.'),
  });

  const handleSubscribe = async (plan: 'free' | 'premium') => {
    if (!user) {
      showError('Você precisa estar logado para assinar um plano.');
      return;
    }

    if (isAdmin) {
      showError('Administradores possuem acesso Premium permanente.');
      return;
    }
    
    if (plan === 'free') {
      if (profile?.subscription_plan === 'free') {
        showSuccess('Você já está no plano Gratuito.');
        return;
      }
      updateProfileMutation.mutate({ 
        subscription_plan: 'free',
        subscription_status: 'cancelled',
        subscription_ends_at: null
      });
      return;
    }

    // Fluxo de Pagamento Premium
    if (plan === 'premium') {
      if (profile?.subscription_plan === 'premium' && profile.subscription_status === 'active') {
        showSuccess('Você já possui o plano Premium ativo.');
        return;
      }

      setIsProcessingPayment(true);
      try {
        const origin = window.location.origin;
        
        // 1. Chamar Edge Function para criar a preferência de pagamento
        const { data, error } = await supabase.functions.invoke('create-payment-preference', {
          body: { 
            userId: user.id, 
            planId: 'premium',
            origin: origin,
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        const { init_point } = data as { init_point: string };

        if (init_point) {
          // 2. Redirecionar para o Checkout do Mercado Pago
          window.location.href = init_point;
        } else {
          throw new Error('Não foi possível obter o link de pagamento.');
        }

      } catch (error: any) {
        console.error('Erro no pagamento:', error);
        showError(error.message || 'Erro ao iniciar o pagamento. Tente novamente.');
      } finally {
        setIsProcessingPayment(false);
      }
    }
  };

  const handleCancelSubscription = () => {
    if (!user) return;

    if (isAdmin) {
      showError('Administradores não podem cancelar a assinatura premium.');
      return;
    }
    
    updateProfileMutation.mutate({ 
      subscription_plan: 'free',
      subscription_status: 'cancelled',
      subscription_ends_at: null
    });
  };

  const isLoading = authLoading || profileLoading || isProcessingPayment;

  const plans = [
    {
      id: 'free',
      name: t('pricing.free'),
      price: 'R$ 0,00',
      period: t('pricing.forever'),
      description: 'Perfeito para começar a organizar suas finanças',
      icon: Zap,
      features: [
        'Controle de contas a pagar',
        'Lista de compras',
        'Dashboard e Transações',
        'Até 3 contas ativas',
      ],
      limitations: [
        'Sem Orçamento por Categoria',
        'Sem Exportação de Dados',
        'Suporte apenas por email'
      ],
      featured: false,
      cta: t('pricing.freeButton'),
      ctaVariant: 'outline' as const
    },
    {
      id: 'premium',
      name: t('pricing.premium'),
      price: 'R$ 19,90',
      period: t('pricing.perMonth'),
      description: 'Desbloqueie todos os recursos e recursos avançados',
      icon: Crown,
      features: [
        'Tudo do plano gratuito',
        'Contas ativas ilimitadas',
        'Orçamento por Categoria',
        'Exportação de Dados (PDF)',
        'Análises financeiras avançadas',
        'Suporte prioritário',
      ],
      limitations: [],
      featured: true,
      cta: t('pricing.subscribe'),
      ctaVariant: 'default' as const,
      popular: true
    }
  ];

  const currentPlan = profile?.subscription_plan || 'free';
  const isPremium = currentPlan === 'premium';

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-foreground mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          {/* Status do Plano Atual */}
          {user && (
            <Card className="mb-8 dark:bg-card dark:border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-foreground">
                      {t('pricing.currentPlan')} <span className={isPremium ? 'text-green-600' : 'text-blue-600'}>
                        {isPremium ? t('pricing.premium') : t('pricing.free')}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">
                      {isPremium 
                        ? t('pricing.premiumDescription')
                        : t('pricing.freeDescription')
                      }
                    </p>
                  </div>
                  {isPremium && !isAdmin && (
                    <Button variant="outline" onClick={handleCancelSubscription} disabled={updateProfileMutation.isPending}>
                      {t('pricing.cancel')}
                    </Button>
                  )}
                  {isPremium && isAdmin && (
                    <Badge variant="destructive">{t('pricing.adminAccess')}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlan === plan.id;
              const isFreePlanButtonForAdmin = isAdmin && plan.id === 'free';
              
              const ctaButton = (
                <Button 
                  className="w-full" 
                  variant={plan.ctaVariant}
                  onClick={() => handleSubscribe(plan.id as 'free' | 'premium')}
                  disabled={isLoading || isCurrentPlan || isFreePlanButtonForAdmin}
                  style={isFreePlanButtonForAdmin ? { pointerEvents: 'none' } : {}}
                >
                  {isCurrentPlan ? (
                    t('pricing.current')
                  ) : isProcessingPayment && plan.id === 'premium' ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t('pricing.redirecting')}</>
                  ) : (
                    plan.cta
                  )}
                </Button>
              );

              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.featured ? 'ring-2 ring-primary border-primary' : ''} ${isCurrentPlan ? 'border-green-500' : ''} dark:bg-card dark:border-border`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        {t('pricing.mostPopular')}
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
                      <h4 className="font-medium dark:text-foreground">{t('pricing.features')}</h4>
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
                        <h4 className="font-medium text-red-600">{t('pricing.limitations')}</h4>
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

                    {isFreePlanButtonForAdmin ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">{ctaButton}</div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t('pricing.adminTooltip')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      ctaButton
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Perguntas Frequentes */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 dark:text-foreground">{t('pricing.faq')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">{t('pricing.q1')}</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('pricing.a1')}</p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">{t('pricing.q2')}</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('pricing.a2')}</p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">{t('pricing.q3')}</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('pricing.a3')}</p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">{t('pricing.q4')}</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('pricing.a4')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default PricingPage;