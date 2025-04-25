import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import CourseTracker from "./pages/CourseTracker";
import JobPortal from "./pages/JobPortal";
import Projects from "./pages/Projects";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Index />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/course-tracker"
              element={
                <PrivateRoute>
                  <Layout>
                    <CourseTracker />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/job-portal"
              element={
                <PrivateRoute>
                  <Layout>
                    <JobPortal />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <PrivateRoute>
                  <Layout>
                    <Projects />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/exams"
              element={
                <Layout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Exams & Assignments</h1>
                    <p className="text-gray-500">This feature is coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/forum"
              element={
                <Layout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Discussion Forum</h1>
                    <p className="text-gray-500">This feature is coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold mb-6">Settings</h1>
                    <p className="text-gray-500">This feature is coming soon...</p>
                  </div>
                </Layout>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
