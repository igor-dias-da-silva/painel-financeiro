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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Central de Ajuda</h1>
          <p className="text-gray-600">Encontre respostas para suas dúvidas e aprenda a usar o aplicativo</p>
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar ajuda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg max-w-md mx-auto">
            <Button
              variant={activeTab === 'guide' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('guide')}
              className="flex-1"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Guia
            </Button>
            <Button
              variant={activeTab === 'faq' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('faq')}
              className="flex-1"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Perguntas Frequentes
            </Button>
            <Button
              variant={activeTab === 'contact' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('contact')}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contato
            </Button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Guia do Usuário</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Aprenda passo a passo como usar todas as funcionalidades do aplicativo Kanban
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <guide.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{guide.title}</CardTitle>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <span>{guide.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{guide.description}</p>
                    <Button variant="outline" className="w-full">
                      Ler Guia
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Video className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Vídeo Tutoriais</div>
                        <div className="text-sm text-gray-600">Assista a vídeos explicativos</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Documentação Completa</div>
                        <div className="text-sm text-gray-600">Acesse a documentação detalhada</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Comunidade</div>
                        <div className="text-sm text-gray-600">Participe da nossa comunidade</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-orange-600" />
                      <div>
                        <div className="font-medium">Suporte por Email</div>
                        <div className="text-sm text-gray-600">Entre em contato com nossa equipe</div>
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
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Perguntas Frequentes</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Encontre respostas para as perguntas mais comuns sobre o aplicativo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex-1">{faq.question}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {faq.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma pergunta encontrada</h3>
                  <p className="text-gray-500">Tente usar termos diferentes na sua busca</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Entre em Contato</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Tem alguma dúvida ou sugestão? Estamos aqui para ajudar!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Envie uma Mensagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Seu nome" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="seu@email.com" />
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input id="subject" placeholder="Assunto da mensagem" />
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Descreva sua dúvida ou sugestão..." 
                      rows={5}
                    />
                  </div>
                  
                  <Button className="w-full">Enviar Mensagem</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Outras Formas de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-gray-600">suporte@kanbanapp.com</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium">Chat Online</div>
                        <div className="text-sm text-gray-600">Disponível de 9h às 18h</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Horário de Atendimento</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Segunda a Sexta</span>
                        <span className="font-medium">9:00 - 18:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábado</span>
                        <span className="font-medium">9:00 - 12:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingo</span>
                        <span className="font-medium text-gray-500">Fechado</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-3">Status do Sistema</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Todos os sistemas operando normalmente</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Help;