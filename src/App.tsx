"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/toaster';

// Pages
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ShoppingList from './pages/ShoppingList';
import Bills from './pages/Bills';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import PricingPage from './pages/PricingPage';
import UpdatePassword from './pages/UpdatePassword';
import AdminPage from './pages/AdminPage';
import Transactions from './pages/Transactions'; // Importando a nova página

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Router>
          <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<AuthPage />} />
              <Route path="/update-password" element={<UpdatePassword />} />

              {/* Protected Routes (using Layout) */}
              <Route element={<Layout children={undefined} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/transactions" element={<Transactions />} /> {/* Nova Rota */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/help" element={<Help />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Routes>
          </AuthProvider>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;