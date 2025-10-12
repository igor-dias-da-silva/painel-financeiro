"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  MessageCircle, 
  Mail, 
  Search,
  Plus,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('guide');

  const faqs = [
    {
      question: 'Como criar um novo quadro?',
      answer: 'Clique no botão "Novo Quadro" na página principal ou use o menu de navegação para acessar a lista de quadros.',
      category: 'criação'
    },
    {
      question: 'Como adicionar tarefas a um quadro?',
      answer: 'Dentro de um quadro, clique no botão "Nova Tarefa" e preencha os campos obrigatórios como título e prioridade.',
      category: 'tarefas'
    },
    {
      question: 'Como mover tarefas entre colunas?',
      answer: 'Arraste e solte as tarefas entre as colunas usando o mouse. Você também pode reorganizar as tarefas dentro da mesma coluna.',
      category: 'organização'
    },
    {
      question: 'Como filtrar tarefas por prioridade?',
      answer: 'Use os filtros de prioridade na parte superior do quadro para mostrar apenas tarefas com prioridade específica.',
      category: 'filtros'
    },
    {
      question: 'Como exportar meus dados?',
      answer: 'Vá para a página de Configurações e clique em "Exportar Dados" para baixar um arquivo JSON com todos os seus quadros e tarefas.',
      category: 'dados'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const guides = [
    {
      title: 'Primeiros Passos',
      description: 'Aprenda a criar seu primeiro quadro e adicionar tarefas',
      icon: Plus,
      duration: '5 min'
    },
    {
      title: 'Organização Avançada',
      description: 'Dicas para organizar suas tarefas de forma eficiente',
      icon: CheckCircle,
      duration: '10 min'
    },
    {
      title: 'Colaboração em Equipe',
      description: 'Como usar o Kanban para trabalho em equipe',
      icon: MessageCircle,
      duration: '15 min'
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Ajuda</h1>
            <p className="text-gray-600">Encontre respostas para suas dúvidas e aprend
Vou continuar a implementação do sistema de autenticação. Primeiro, vou atualizar o App.tsx para incluir o AuthProvider e as novas rotas:

<dyad-write path="src/App.tsx" description="Atualizando App.tsx com AuthProvider e rotas protegidas">
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Boards from "./pages/Boards";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/boards" element={<Boards />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;