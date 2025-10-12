"use client";

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

const fetchBoards = async () => {
  const { data, error } = await supabase.from('boards').select('*');
  if (error) throw new Error(error.message);
  return data;
};

const Dashboard = () => {
  const { data: boards, isLoading, isError, error } = useQuery('boards', fetchBoards);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/boards">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ver Todos os Quadros
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro:</strong>
          <span className="block sm:inline"> Não foi possível carregar os quadros.</span>
        </div>
      ) : (
        <div>
          {boards && boards.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Bem-vindo!</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-500">Nenhum quadro criado ainda</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards?.slice(0, 3).map((board) => (
                <Card key={board.id}>
                  <CardHeader>
                    <CardTitle>{board.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{board.description || 'Sem descrição'}</p>
                    <Link to={`/boards/${board.id}`} className="mt-4 inline-block">
                      <Button variant="outline">Ver Quadro</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;