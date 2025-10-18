"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Shield, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '@/lib/database';
import { showError, showSuccess } from '@/utils/toast';
import { AuthGuard } from '@/components/AuthGuard';

const PricingPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'premium'>('free');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
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

  const handleSubscribe = (plan: 'free' | 'premium') => {
    if (!user) {
      showError('Você precisa estar logado para assinar um plano.');
      return;
    }
    
    setSelectedPlan(plan);
    
    if (plan === 'premium') {
      updateProfileMutation.mutate({ 
        subscription_plan: 'premium',
        subscription_status: 'active',
        subscription_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
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
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending && isCurrentPlan ? 'Atualizando...' : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 dark:text-foreground">Perguntas Frequentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">Posso cancelar a qualquer momento?</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Sim, você pode cancelar sua assinatura premium a qualquer momento. Seu plano será revertido para o gratuito no próximo ciclo de faturamento.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">Quais métodos de pagamento são aceitos?</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Aceitamos todos os principais cartões de crédito, débito e boletos bancários. A segurança das suas informações é nossa prioridade.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">Meus dados são seguros?</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Sim, usamos criptografia de ponta a ponta e armazenamos seus dados em servidores seguros com backup diário.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="dark:bg-card dark:border-border">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 dark:text-foreground">E se eu não gostar do plano premium?</h3>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Oferecemos garantia de devolução de 7 dias. Se não estiver satisfeito, entre em contato com nosso suporte para reembolso.
                  </p>
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