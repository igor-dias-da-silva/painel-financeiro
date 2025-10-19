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
} from 'lucide-react';
import { AuthGuard } from '@/components/AuthGuard';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('faq');

  const faqs = [
    {
      question: 'Como adiciono uma nova conta a pagar?',
      answer: 'Na página "Contas a Pagar", preencha os campos no card "Adicionar Nova Conta" e clique no botão para salvar.',
      category: 'Contas'
    },
    {
      question: 'Como defino meu orçamento para a lista de compras?',
      answer: 'Acesse a "Lista de Compras". No card "Meu Orçamento", insira o valor desejado e clique no ícone de salvar.',
      category: 'Compras'
    },
    {
      question: 'Como marco uma conta como paga?',
      answer: 'Na lista de "Minhas Contas", clique na caixa de seleção ao lado da conta que deseja marcar como paga.',
      category: 'Contas'
    },
    {
      question: 'Onde posso ver um resumo das minhas finanças?',
      answer: 'O Dashboard principal oferece um resumo visual do total de contas a pagar e dos gastos do mês com compras.',
      category: 'Dashboard'
    },
    {
      question: 'Meus dados financeiros estão seguros?',
      answer: 'Sim. Seus dados são armazenados de forma segura e associados apenas à sua conta. Ninguém mais tem acesso às suas informações.',
      category: 'Segurança'
    },
    {
      question: 'Posso editar meu nome ou biografia?',
      answer: 'Sim, na página de "Perfil" você pode clicar nos botões de edição para atualizar seu nome e biografia a qualquer momento.',
      category: 'Perfil'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const guides = [
    {
      title: 'Primeiros Passos',
      description: 'Aprenda a configurar seu orçamento e adicionar contas',
      icon: Plus,
      duration: '5 min'
    },
    {
      title: 'Gerenciando suas Contas',
      description: 'Dicas para manter suas contas sempre em dia',
      icon: CheckCircle,
      duration: '10 min'
    },
    {
      title: 'Otimizando Compras',
      description: 'Como usar a lista de compras para economizar',
      icon: MessageCircle,
      duration: '15 min'
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-foreground mb-2">Central de Ajuda</h1>
            <p className="text-gray-600 dark:text-muted-foreground">Encontre respostas para suas dúvidas e aprenda a usar o FinanBoard</p>
          </div>

          {/* Barra de Pesquisa */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar ajuda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 dark:bg-input dark:text-foreground dark:border-border"
              />
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className="mb-8">
            {/* Removido max-w-md para melhor responsividade em telas pequenas */}
            <div className="flex space-x-1 bg-gray-200 dark:bg-secondary p-1 rounded-lg mx-auto max-w-full sm:max-w-md">
              <Button
                variant={activeTab === 'faq' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('faq')}
                className="flex-1 text-sm h-10" // Adicionado text-sm e altura fixa para consistência
              >
                <HelpCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Perguntas Frequentes</span>
                <span className="sm:hidden">FAQ</span>
              </Button>
              <Button
                variant={activeTab === 'guide' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('guide')}
                className="flex-1 text-sm h-10"
              >
                <BookOpen className="h-4 w-4 mr-1 sm:mr-2" />
                Guia
              </Button>
              <Button
                variant={activeTab === 'contact' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('contact')}
                className="flex-1 text-sm h-10"
              >
                <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
                Contato
              </Button>
            </div>
          </div>

          {/* Conteúdo das Abas */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">Guia do Usuário</h2>
                <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
                  Aprenda passo a passo como usar todas as funcionalidades do FinanBoard
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guides.map((guide, index) => {
                  const Icon = guide.icon;
                  return (
                    <Card key={index} className="hover:shadow-md transition-shadow dark:bg-card dark:border-border">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600 dark:text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg dark:text-card-foreground">{guide.title}</CardTitle>
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-muted-foreground">
                              <span>{guide.duration}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-muted-foreground mb-4">{guide.description}</p>
                        <Button variant="outline" className="w-full dark:bg-secondary dark:text-secondary-foreground dark:border-border dark:hover:bg-accent">
                          Ler Guia
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="dark:bg-card dark:border-border">
                <CardHeader>
                  <CardTitle className="dark:text-card-foreground">Recursos Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Video className="h-5 w-5 text-blue-600 dark:text-primary" />
                        <div>
                          <div className="font-medium dark:text-foreground">Vídeo Tutoriais</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">Assista a vídeos explicativos</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium dark:text-foreground">Documentação Completa</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">Acesse a documentação detalhada</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-medium dark:text-foreground">Comunidade</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">Participe da nossa comunidade</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <div>
                          <div className="font-medium dark:text-foreground">Suporte por Email</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">Entre em contato com nossa equipe</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">Perguntas Frequentes</h2>
                <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
                  Encontre respostas para as perguntas mais comuns sobre o aplicativo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFaqs.map((faq, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow dark:bg-card dark:border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base flex-1 dark:text-card-foreground">{faq.question}</CardTitle>
                        <Badge variant="outline" className="ml-2 dark:border-border dark:text-muted-foreground">
                          {faq.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 dark:text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredFaqs.length === 0 && (
                <Card className="dark:bg-card dark:border-border">
                  <CardContent className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">Nenhuma pergunta encontrada</h3>
                    <p className="text-gray-500 dark:text-muted-foreground">Tente usar termos diferentes na sua busca</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-foreground mb-4">Entre em Contato</h2>
                <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto">
                  Tem alguma dúvida ou sugestão? Estamos aqui para ajudar!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="dark:bg-card dark:border-border">
                  <CardHeader>
                    <CardTitle className="dark:text-card-foreground">Envie uma Mensagem</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="dark:text-foreground">Nome</Label>
                      <Input id="name" placeholder="Seu nome" className="dark:bg-input dark:text-foreground dark:border-border" />
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="dark:text-foreground">Email</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" className="dark:bg-input dark:text-foreground dark:border-border" />
                    </div>
                    
                    <div>
                      <Label htmlFor="subject" className="dark:text-foreground">Assunto</Label>
                      <Input id="subject" placeholder="Assunto da mensagem" className="dark:bg-input dark:text-foreground dark:border-border" />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="dark:text-foreground">Mensagem</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Descreva sua dúvida ou sugestão..." 
                        rows={5}
                        className="dark:bg-input dark:text-foreground dark:border-border"
                      />
                    </div>
                    
                    <Button className="w-full">Enviar Mensagem</Button>
                  </CardContent>
                </Card>

                <Card className="dark:bg-card dark:border-border">
                  <CardHeader>
                    <CardTitle className="dark:text-card-foreground">Outras Formas de Contato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-primary" />
                        <div>
                          <div className="font-medium dark:text-foreground">Email</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">suporte@finanboard.com</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="font-medium dark:text-foreground">Chat Online</div>
                          <div className="text-sm text-gray-600 dark:text-muted-foreground">Disponível de 9h às 18h</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t dark:border-border pt-6">
                      <h4 className="font-medium mb-3 dark:text-foreground">Horário de Atendimento</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between dark:text-muted-foreground">
                          <span>Segunda a Sexta</span>
                          <span className="font-medium dark:text-foreground">9:00 - 18:00</span>
                        </div>
                        <div className="flex justify-between dark:text-muted-foreground">
                          <span>Sábado</span>
                          <span className="font-medium text-gray-500">Fechado</span>
                        </div>
                        <div className="flex justify-between dark:text-muted-foreground">
                          <span>Domingo</span>
                          <span className="font-medium text-gray-500">Fechado</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t dark:border-border pt-6">
                      <h4 className="font-medium mb-3 dark:text-foreground">Status do Sistema</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 dark:text-green-400">Todos os sistemas operando normalmente</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Help;