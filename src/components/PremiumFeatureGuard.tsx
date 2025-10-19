"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Crown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface PremiumFeatureGuardProps {
  children: React.ReactNode;
}

export const PremiumFeatureGuard: React.FC<PremiumFeatureGuardProps> = ({ children }) => {
  const { t } = useTranslation();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPremium = profile?.subscription_plan === 'premium';
  const isAdmin = profile?.role === 'admin';

  if (!isPremium && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dark:bg-background">
        <Card className="w-full max-w-md text-center dark:bg-card dark:border-border">
          <CardHeader>
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <CardTitle className="text-2xl text-yellow-500">{t('premiumFeatureGuard.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {t('premiumFeatureGuard.description')}
            </p>
            <Link to="/pricing">
              <Button>{t('premiumFeatureGuard.cta')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};