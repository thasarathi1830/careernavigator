
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider as ShadcnThemeProvider } from "@/components/theme/theme-provider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthGuard } from "./components/auth/AuthGuard";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import CourseTracker from "./pages/CourseTracker";
import JobPortal from "./pages/JobPortal";
import Projects from "./pages/Projects";
import Exams from "./pages/Exams";
import Forum from "./pages/Forum";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ResumeBuilder from "./pages/ResumeBuilder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ShadcnThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Index />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Profile />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/course-tracker"
                  element={
                    <AuthGuard>
                      <Layout>
                        <CourseTracker />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/job-portal"
                  element={
                    <AuthGuard>
                      <Layout>
                        <JobPortal />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/projects"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Projects />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/exams"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Exams />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/forum"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Forum />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <AuthGuard>
                      <Layout>
                        <Settings />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/resume-builder"
                  element={
                    <AuthGuard>
                      <Layout>
                        <ResumeBuilder />
                      </Layout>
                    </AuthGuard>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ShadcnThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
