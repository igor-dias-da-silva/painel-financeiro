"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getProfile, Profile } from '@/lib/database';

export const useProfile = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  const { data: profile, isLoading: isProfileLoading, error } = useQuery<Profile | null>({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId!),
    enabled: isAuthenticated && !!userId,
  });

  const isAdmin = profile?.role === 'admin';
  const isLoading = isAuthLoading || isProfileLoading;

  return {
    profile,
    isLoading,
    isAdmin,
    error,
  };
};