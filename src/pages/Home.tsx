"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Receipt, ShoppingCart, BarChart2, CheckCircle } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <Receipt className="h-8 w-8 text-primary" />,
      title: 'Controle de Contas',
      description: 'Nunca mais perca um vencimento. Cadastre suas contas a pagar e mantenha tudo sob controle.',
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-primary" />,
      title: 'Lista de Compras Inteligente',
      description: 'Crie sua lista de compras, defina um orçamento e acompanhe seus gastos em tempo real.',
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: 'Dashboard Intuitivo',
      description: 'Tenha uma visão clara e completa de suas finanças com gráficos e resumos mensais.',
    },
  ];

  const testimonials = [
    {
      quote: 'FinanDash transformou a maneira como eu lido com meu dinheiro. Finalmente sinto que tenho o controle total das minhas finanças!',
      name: 'Ana Silva',
      role: 'Designer Freelancer',
    },
    {
      quote: 'A simplicidade do aplicativo é incrível. Em poucos minutos, consegui organizar todas as minhas contas e meu orçamento de compras.',
      name: 'João Pereira',
      role: 'Estudante Universitário',
    },
  ];

  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="mr-4 flex items-center">
            <DollarSign className="h-6 w-6 mr-2" />
            <span className="font-bold text-lg">FinanDash</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <nav className="flex items-center space-x-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Cadastre-se</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-12 md:py-20 lg:py-32">
          <div className="container text-center px-4">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Organize suas finanças com facilidade
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Assuma o controle de suas contas a pagar e listas de compras. FinanDash é a ferramenta simples e poderosa que você precisa para uma vida financeira mais tranquila.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">Comece Agora - É Grátis</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-20 bg-muted/40">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold">Tudo que você precisa em um só lugar</h2>
              <p className="max-w-xl mx-auto text-muted-foreground mt-4">
                Funcionalidades pensadas para simplificar sua vida financeira.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow dark:bg-card dark:border-border">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-4xl font-bold">O que nossos usuários dizem</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow dark:bg-card dark:border-border">
                  <CardContent className="p-6">
                    <p className="mb-4 italic text-muted-foreground dark:text-muted-foreground">"{testimonial.quote}"</p>
                    <div className="font-semibold dark:text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground dark:text-muted-foreground">{testimonial.role}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-muted/40">
          <div className="container px-4 text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Pronto para assumir o controle?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto dark:text-muted-foreground">
              Crie sua conta gratuita e comece a organizar suas finanças hoje mesmo. Leva apenas um minuto.
            </p>
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">Cadastre-se Gratuitamente</Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinanDash. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Home;