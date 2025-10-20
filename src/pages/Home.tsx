"use client";

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { DollarSign, Receipt, ShoppingCart, BarChart2, CheckCircle, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';

const Home = () => {
  const { setTheme, theme } = useTheme();

  // Força o tema claro ao carregar a página inicial
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light');
    }
  }, [setTheme, theme]);

  const features = [
    {
      icon: <Receipt className="h-8 w-8 text-primary" />,
      title: 'Controle Total de Contas',
      description: 'Nunca mais perca um vencimento. Cadastre e gerencie todas as suas contas a pagar de forma centralizada.',
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
      title: 'Compras Inteligentes',
      description: 'Crie listas de compras, defina orçamentos e acompanhe seus gastos para economizar dinheiro.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: 'Dashboard Intuitivo',
      description: 'Tenha uma visão clara de suas finanças com gráficos e resumos mensais fáceis de entender.',
    },
  ];

  const testimonials = [
    {
      quote: 'FinanBoard transformou a maneira como eu lido com meu dinheiro. Finalmente sinto que tenho o controle total das minhas finanças!',
      name: 'Ana Silva',
      role: 'Designer Freelancer',
      avatar: 'AS',
    },
    {
      quote: 'A simplicidade do aplicativo é incrível. Em poucos minutos, consegui organizar todas as minhas contas e meu orçamento de compras.',
      name: 'João Pereira',
      role: 'Estudante Universitário',
      avatar: 'JP',
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link to="/" className="mr-4 flex items-center">
            <DollarSign className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold text-lg">FinanBoard</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Criar Conta</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                A maneira inteligente de gerenciar suas finanças.
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground mb-8">
                Controle total sobre suas contas, orçamentos e compras, de forma simples e visual.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Comece Agora - É Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <Card className="bg-card/80 backdrop-blur-sm shadow-2xl transform transition-transform duration-500 hover:scale-105">
                <CardHeader>
                  <CardTitle>Dashboard Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Receitas do Mês</span>
                    <span className="font-bold text-green-500">R$ 5.280,00</span>
                  </div>
                  <Progress value={80} className="h-2" />
                  <div className="flex justify-between">
                    <span>Despesas do Mês</span>
                    <span className="font-bold text-red-500">R$ 3.150,00</span>
                  </div>
                  <Progress value={65} className="h-2 bg-red-500/20" />
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Saldo Atual</span>
                    <span className="font-bold text-xl">R$ 2.130,00</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 bg-muted/40">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Tudo que você precisa em um só lugar</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                Funcionalidades pensadas para simplificar sua vida financeira.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 bg-background hover:shadow-lg transition-shadow dark:bg-card dark:border-border">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works / Benefits Section */}
        <section className="py-16 md:py-20">
          <div className="container px-4 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Organização financeira sem complicação</h2>
              <p className="text-muted-foreground text-lg">
                FinanBoard foi desenhado para ser intuitivo. Em poucos cliques, você organiza sua vida financeira e ganha mais tranquilidade.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Centralize suas contas</h4>
                    <p className="text-muted-foreground">Veja tudo que precisa pagar em um único lugar e evite juros.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Planeje suas compras</h4>
                    <p className="text-muted-foreground">Crie listas, defina orçamentos e não tenha surpresas no caixa.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Visualize seus gastos</h4>
                    <p className="text-muted-foreground">Entenda para onde seu dinheiro está indo com relatórios claros.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="hidden lg:block">
              <Card className="bg-card/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle>Lista de Compras - Supermercado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span className="line-through text-muted-foreground">Leite Integral</span>
                    <span className="line-through text-muted-foreground">R$ 5,50</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span className="font-medium">Pão de Forma</span>
                    <span className="font-medium">R$ 8,90</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                    <span className="font-medium">Café em Pó</span>
                    <span className="font-medium">R$ 15,20</span>
                  </div>
                  <div className="flex justify-between pt-3 mt-3 border-t">
                    <span className="font-semibold">Total Estimado:</span>
                    <span className="font-bold text-lg">R$ 29,60</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 bg-muted/40">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">O que nossos usuários dizem</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-background hover:shadow-lg transition-shadow dark:bg-card dark:border-border">
                  <CardContent className="p-6">
                    <p className="mb-4 italic text-muted-foreground dark:text-muted-foreground">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold dark:text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground dark:text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Pronto para transformar sua vida financeira?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto mt-4 dark:text-muted-foreground">
              Crie sua conta gratuita e comece a organizar suas finanças hoje mesmo. Leva apenas um minuto.
            </p>
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">Cadastre-se Gratuitamente</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinanBoard. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Home;