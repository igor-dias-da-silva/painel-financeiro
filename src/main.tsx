import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AuthProvider } from "./hooks/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider.tsx"; // Importar ThemeProvider

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" attribute="class" enableSystem> {/* Adicionar ThemeProvider */}
        <App />
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);