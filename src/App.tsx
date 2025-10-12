import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/boards" element={
          <AuthGuard>
            <Layout>
              <Index />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
                <p className="text-gray-600">Página de configurações em desenvolvimento</p>
              </div>
            </Layout>
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Perfil</h2>
                <p className="text-gray-600">Página de perfil em desenvolvimento</p>
              </div>
            </Layout>
          </AuthGuard>
        } />
        <Route path="/help" element={
          <AuthGuard>
            <Layout>
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajuda</h2>
                <p className="text-gray-600">Página de ajuda em desenvolvimento</p>
              </div>
            </Layout>
          </AuthGuard>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;