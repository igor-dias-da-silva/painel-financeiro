import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import ShoppingListPage from "./app/shopping-list/page";
import BillsPage from "./pages/BillsPage";
import PricingPage from "./pages/PricingPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={
          <AuthGuard>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/shopping-list" element={
          <AuthGuard>
            <Layout>
              <ShoppingListPage />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/bills" element={
          <AuthGuard>
            <Layout>
              <BillsPage />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/pricing" element={
          <AuthGuard>
            <Layout>
              <PricingPage />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <Layout>
              <Settings />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <Layout>
              <Profile />
            </Layout>
          </AuthGuard>
        } />
        <Route path="/help" element={
          <AuthGuard>
            <Layout>
              <Help />
            </Layout>
          </AuthGuard>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;