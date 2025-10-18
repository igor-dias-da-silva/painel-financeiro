"use client";

import React, { useEffect } from 'react';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';
import { Loader2 } from 'lucide-react';
import { showError } from '@/utils/toast';

interface MercadoPagoPaymentProps {
  preferenceId: string;
}

const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-e1fd3592-390b-4c7d-a3fa-c3797923ab12';

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
    // Removido o objeto paymentMethods que estava causando o erro
  };

  const onSubmit = async (param: any) => {
    console.log('Pagamento enviado:', param);
  };

  const onError = (error: any) => {
    console.error('Erro no pagamento:', error);
    showError('Ocorreu um erro ao processar o pagamento. Tente novamente.');
  };

  const onReady = () => {
    // Callback para quando o brick estiver pronto
  };

  const onRender = (containerId: string, paymentMethods: any) => {
    console.log('--- MÉTODOS DE PAGAMENTO DISPONÍVEIS ---');
    console.log('Container ID:', containerId);
    console.log('Métodos retornados pelo Mercado Pago:', paymentMethods);
    console.log('-----------------------------------------');
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
          onRender={onRender}
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