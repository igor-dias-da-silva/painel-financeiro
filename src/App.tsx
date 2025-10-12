import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Boards from "./pages/Boards"; // Import the updated Boards page
import BoardView from "./pages/BoardView"; // Import the new BoardView page
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings"; // Import Settings page
import Profile from "./pages/Profile"; // Import Profile page
import Help from "./pages/Help"; // Import Help page
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
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
              <Boards /> {/* Use the updated Boards list page */}
            </Layout>
          </AuthGuard>
        } />
        <Route path="/boards/:boardId" element={
          <AuthGuard>
            <Layout>
              <BoardView /> {/* New route for individual board view */}
            </Layout>
          </AuthGuard>
        } />
        <Route path="/settings" element={
          <AuthGuard>
            <Layout>
              <Settings /> {/* Render the actual Settings page */}
            </Layout>
          </AuthGuard>
        } />
        <Route path="/profile" element={
          <AuthGuard>
            <Layout>
              <Profile /> {/* Render the actual Profile page */}
            </Layout>
          </AuthGuard>
        } />
        <Route path="/help" element={
          <AuthGuard>
            <Layout>
              <Help /> {/* Render the actual Help page */}
            </Layout>
          </AuthGuard>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;