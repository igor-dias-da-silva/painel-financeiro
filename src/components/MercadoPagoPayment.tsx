"use client";

import React, { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface MercadoPagoPaymentProps {
  preferenceId: string;
}

// IMPORTANTE: Substitua pela sua Chave Pública do Mercado Pago
const MERCADO_PAGO_PUBLIC_KEY = 'SUBSTITUA_PELA_SUA_CHAVE_PUBLICA';

export const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({ preferenceId }) => {
  
  useEffect(() => {
    if (!MERCADO_PAGO_PUBLIC_KEY.startsWith('APP_USR-') && !MERCADO_PAGO_PUBLIC_KEY.startsWith('TEST-')) {
      console.error('Chave Pública do Mercado Pago inválida ou não definida.');
      showError('Erro de configuração de pagamento. Contate o suporte.');
    } else {
      initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: 'pt-BR' });
    }
  }, []);

  const initialization = {
    amount: 19.90,
    preferenceId: preferenceId,
  };

  const customization = {
    visual: {
      style: {
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      },
    },
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
      pix: 'all' as const,
    },
  };

  const onSubmit = async (param: any) => {
    // O onSubmit é chamado, mas o redirecionamento é tratado
    // pelos back_urls que definimos na preferência.
    // O SDK do Mercado Pago cuida do envio dos dados.
    console.log('Pagamento enviado:', param);
  };

  const onError = (error: any) => {
    console.error('Erro no pagamento:', error);
    showError('Ocorreu um erro ao processar o pagamento. Tente novamente.');
  };

  const onReady = () => {
    // Callback para quando o brick estiver pronto
  };

  return (
    <div>
      {preferenceId ? (
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={onSubmit}
          onError={onError}
          onReady={onReady}
        />
      ) : (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-2">Carregando pagamento...</p>
        </div>
      )}
    </div>
  );
};