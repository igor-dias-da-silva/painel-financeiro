import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import './i18n'; // Importa a configuração de i18n

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback="Carregando...">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" attribute="class" enableSystem={false}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.Suspense>
);