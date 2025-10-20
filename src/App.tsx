"use client";

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';
import { Loader2 } from 'lucide-react';

// Pages (Lazy Loaded)
const Home = lazy(() => import('./pages/Home'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ShoppingList = lazy(() => import('./pages/ShoppingList'));
const Bills = lazy(() => import('./pages/Bills'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Help = lazy(() => import('./pages/Help'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const AdminPage = lazy(() => import('./pages/AdminDashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const BudgetPage = lazy(() => import('./pages/Budget'));
const AccountsPage = lazy(() => import('./pages/Accounts'));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AuthProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/update-password" element={<UpdatePassword />} />

                {/* Protected Routes (using Layout) */}
                <Route element={<Layout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/accounts" element={<AccountsPage />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/budget" element={<BudgetPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;